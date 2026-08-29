/*
 * AI Desk Talk widget — floating "Talk" button + voice-call modal.
 * Drop-in <script src=".../talk-widget.js" data-exec-id="..."> — no other markup needed.
 * Extracted from static/index.html's openTalk()/startTalk() (same WS/audio pipeline, same avatar frames).
 * Self-scoped: styles are prefixed .aidt-* and IDs are unique to this widget, so it can't clash with host CSS/JS.
 */
(function () {
  var CUR_SCRIPT = document.currentScript;
  var EXEC_ID = CUR_SCRIPT && CUR_SCRIPT.getAttribute("data-exec-id");
  if (!EXEC_ID) { console.error("[ai-desk] talk-widget.js: missing data-exec-id"); return; }
  // Name/avatar have no public (unauthenticated) read endpoint — admin API is
  // auth-only — so take them from the script tag instead of fetching.
  var EXEC_NAME = CUR_SCRIPT.getAttribute("data-exec-name") || "Assistant";
  var EXEC_AVATAR = CUR_SCRIPT.getAttribute("data-exec-avatar") || "";

  // Base path this script was loaded from (e.g. "/desk/admin") — avatars live
  // under this same prefix. The API/WS routes are mounted at the FastAPI
  // app root (not under /admin), so PREFIX strips the "/admin" static-mount
  // segment too, leaving just the proxy prefix (e.g. "/desk", or "" if the
  // service is at the domain root) to build /ws/voice-chat/... against.
  var SCRIPT_URL = new URL(CUR_SCRIPT.src, location.href);
  var BASE = SCRIPT_URL.pathname.replace(/\/[^/]*$/, ""); // strip "/talk-widget.js" -> ".../admin"
  var PREFIX = BASE.replace(/\/admin$/, ""); // strip "/admin" -> proxy prefix
  var ORIGIN = SCRIPT_URL.origin;

  var GEMINI_SAMPLE_RATE = 16000;
  var talkState = null;

  function injectStyles() {
    var css = "\
.aidt-fab{position:fixed;right:22px;bottom:22px;z-index:99998;width:56px;height:56px;border-radius:50%;\
background:linear-gradient(135deg,#4f3cc9,#4230b3);color:#fff;border:none;cursor:pointer;\
box-shadow:0 6px 20px -4px rgba(28,26,40,.35);font-size:24px;display:flex;align-items:center;justify-content:center;\
transition:transform .15s ease;}\
.aidt-fab:hover{transform:scale(1.06);}\
.aidt-backdrop{position:fixed;inset:0;background:rgba(19,16,25,.55);backdrop-filter:blur(2px);\
display:flex;align-items:center;justify-content:center;z-index:99999;font-family:system-ui,-apple-system,Segoe UI,sans-serif;}\
.aidt-modal{background:#fff;color:#1c1a28;border:1px solid #e4e2ed;border-radius:16px;padding:26px;\
width:380px;max-width:90vw;box-shadow:0 12px 32px -8px rgba(28,26,40,.22);text-align:center;}\
@media(prefers-color-scheme:dark){.aidt-modal{background:#1c1826;color:#f1eef9;border-color:#2c2738;}}\
.aidt-modal h2{font-size:17px;margin:0 0 4px;display:flex;align-items:center;justify-content:center;gap:8px;}\
.aidt-modal input{width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid #d3d0e0;border-radius:8px;\
font-size:14px;margin:5px 0 10px;background:transparent;color:inherit;}\
.aidt-modal label{display:block;text-align:left;font-size:12.5px;font-weight:600;color:#67637a;}\
.aidt-avatar-wrap{position:relative;width:96px;height:96px;margin:4px auto 14px;}\
.aidt-avatar-ring{position:absolute;inset:0;border-radius:50%;border:2px solid #eeebfb;opacity:0;transition:opacity .2s ease;}\
.aidt-avatar-ring.speaking{opacity:1;animation:aidt-ring-pulse 900ms ease-out infinite;}\
@keyframes aidt-ring-pulse{0%{transform:scale(.96);box-shadow:0 0 0 0 #eeebfb;}70%{transform:scale(1.14);box-shadow:0 0 0 10px transparent;}100%{transform:scale(1.18);opacity:0;}}\
.aidt-avatar{position:absolute;inset:8px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;\
box-shadow:0 4px 12px -2px rgba(28,26,40,.10);transition:transform 70ms ease-out;transform-origin:center;background:#eeebfb;}\
.aidt-avatar img.aidt-face{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity 70ms linear;}\
.aidt-avatar .aidt-initials{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:28px;}\
.aidt-mic-dot{width:10px;height:10px;border-radius:50%;display:inline-block;background:#d3d0e0;}\
.aidt-mic-dot.live{background:#16a34a;box-shadow:0 0 0 3px #e9f9ef;animation:aidt-pulse 1.2s infinite;}\
@keyframes aidt-pulse{0%,100%{opacity:1;}50%{opacity:.45;}}\
.aidt-status{color:#67637a;font-size:12.5px;min-height:32px;}\
.aidt-meter{height:4px;border-radius:3px;background:#f1f0f6;margin:14px 0 2px;overflow:hidden;}\
.aidt-meter-fill{height:100%;width:0%;background:#16a34a;transition:width 60ms linear;}\
.aidt-btn{font-family:inherit;padding:10px 18px;border-radius:9px;cursor:pointer;font-size:14px;font-weight:700;\
margin-top:14px;border:none;}\
.aidt-btn-primary{background:#4f3cc9;color:#fff;}\
.aidt-btn-primary.active{background:#dc2626;}\
.aidt-btn-secondary{background:#f1f0f6;color:#1c1a28;border:1px solid #e4e2ed;margin-left:8px;}\
@media(prefers-color-scheme:dark){.aidt-btn-secondary{background:#171320;color:#f1eef9;border-color:#2c2738;}}\
";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function escapeHtml(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function talkAvatarHtml(exec) {
    if (exec.avatar_url) return '<img src="' + exec.avatar_url + '" alt="" class="aidt-face" style="opacity:1" />';
    return (
      '<img src="' + BASE + '/avatars/woman-mouth-closed.png" alt="" class="aidt-face" id="aidtFaceClosed" style="opacity:1" />' +
      '<img src="' + BASE + '/avatars/woman-mouth-mid.png" alt="" class="aidt-face" id="aidtFaceMid" style="opacity:0" />' +
      '<img src="' + BASE + '/avatars/woman-mouth-open.png" alt="" class="aidt-face" id="aidtFaceOpen" style="opacity:0" />'
    );
  }

  function openTalk(exec) {
    var backdrop = document.createElement("div");
    backdrop.className = "aidt-backdrop";
    backdrop.id = "aidtModal";
    backdrop.innerHTML =
      '<div class="aidt-modal">' +
        '<div class="aidt-avatar-wrap"><div class="aidt-avatar-ring" id="aidtRing"></div>' +
          '<div class="aidt-avatar" id="aidtAvatar">' + talkAvatarHtml(exec) + '</div></div>' +
        '<h2><span class="aidt-mic-dot" id="aidtMicDot"></span> ' + escapeHtml(exec.name) + '</h2>' +
        '<div id="aidtCallerForm">' +
          '<label>Your name</label><input id="aidtCallerName" placeholder="Required" />' +
          '<label>Phone (optional)</label><input id="aidtCallerPhone" placeholder="+91..." />' +
        '</div>' +
        '<p class="aidt-status" id="aidtStatus">Enter your name, then click Start and allow microphone access.</p>' +
        '<div class="aidt-meter"><div class="aidt-meter-fill" id="aidtMeterFill"></div></div>' +
        '<button class="aidt-btn aidt-btn-primary" id="aidtToggle">Start</button>' +
        '<button class="aidt-btn aidt-btn-secondary" id="aidtClose">Close</button>' +
      '</div>';
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeTalk(); });
    document.getElementById("aidtClose").onclick = closeTalk;
    document.getElementById("aidtToggle").onclick = function () {
      if (talkState) { stopTalk(); return; }
      var name = document.getElementById("aidtCallerName").value.trim();
      if (!name) { document.getElementById("aidtStatus").textContent = "Please enter your name first."; return; }
      var phone = document.getElementById("aidtCallerPhone").value.trim();
      document.getElementById("aidtCallerForm").style.display = "none";
      startTalk(exec.id, name, phone);
    };
  }

  function closeTalk() {
    if (talkState) stopTalk();
    var el = document.getElementById("aidtModal");
    if (el) el.remove();
  }

  function startTalk(execId, callerName, callerPhone) {
    var statusEl = document.getElementById("aidtStatus");
    var dotEl = document.getElementById("aidtMicDot");
    var toggleEl = document.getElementById("aidtToggle");
    navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: GEMINI_SAMPLE_RATE } })
      .then(function (micStream) {
        var wsProtocol = ORIGIN.indexOf("https:") === 0 ? "wss:" : "ws:";
        var wsHost = ORIGIN.replace(/^https?:/, "");
        var params = new URLSearchParams({ caller_name: callerName });
        if (callerPhone) params.set("caller_phone", callerPhone);
        var ws = new WebSocket(wsProtocol + wsHost + PREFIX + "/ws/voice-chat/" + execId + "?" + params);
        ws.binaryType = "arraybuffer";

        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaStreamSource(micStream);
        var processorNode = audioCtx.createScriptProcessor(4096, 1, 1);
        processorNode.onaudioprocess = function (e) {
          if (ws.readyState !== WebSocket.OPEN) return;
          var input = e.inputBuffer.getChannelData(0);
          var pcm16 = floatTo16BitPCM(resampleTo(input, audioCtx.sampleRate, GEMINI_SAMPLE_RATE));
          ws.send(pcm16);
        };
        var micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);

        source.connect(processorNode);
        var silentGain = audioCtx.createGain();
        silentGain.gain.value = 0;
        processorNode.connect(silentGain);
        silentGain.connect(audioCtx.destination);

        var playbackCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        var playCursor = playbackCtx.currentTime;
        var playbackAnalyser = playbackCtx.createAnalyser();
        playbackAnalyser.fftSize = 256;
        playbackAnalyser.connect(playbackCtx.destination);

        ws.onmessage = function (event) {
          if (typeof event.data === "string") return;
          var pcm16 = new Int16Array(event.data);
          var float32 = new Float32Array(pcm16.length);
          for (var i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;
          var buffer = playbackCtx.createBuffer(1, float32.length, 24000);
          buffer.copyToChannel(float32, 0);
          var src = playbackCtx.createBufferSource();
          src.buffer = buffer;
          src.connect(playbackAnalyser);
          var startAt = Math.max(playCursor, playbackCtx.currentTime);
          src.start(startAt);
          playCursor = startAt + buffer.duration;
        };

        ws.onerror = function () { statusEl.textContent = "Connection error."; };
        ws.onclose = function () { statusEl.textContent = "Call ended."; dotEl.classList.remove("live"); };
        ws.onopen = function () { statusEl.textContent = "Live — speak naturally."; dotEl.classList.add("live"); };

        talkState = { ws: ws, audioCtx: audioCtx, micStream: micStream, processorNode: processorNode, playbackCtx: playbackCtx, micAnalyser: micAnalyser, playbackAnalyser: playbackAnalyser, animFrame: null };
        toggleEl.textContent = "Stop";
        toggleEl.classList.add("active");
        runAvatarAnimationLoop();
      })
      .catch(function (e) { statusEl.textContent = "Mic access failed: " + e.message; });
  }

  function setFaceFrame(openness) {
    var closed = document.getElementById("aidtFaceClosed");
    if (!closed) return;
    var mid = document.getElementById("aidtFaceMid");
    var open = document.getElementById("aidtFaceOpen");
    closed.style.opacity = String(Math.max(0, 1 - openness * 3));
    mid.style.opacity = String(Math.max(0, 1 - Math.abs(openness - 0.5) * 3));
    open.style.opacity = String(Math.max(0, (openness - 0.66) * 3));
  }

  function rmsLevel(byteData) {
    var sumSquares = 0;
    for (var i = 0; i < byteData.length; i++) {
      var centered = (byteData[i] - 128) / 128;
      sumSquares += centered * centered;
    }
    return Math.sqrt(sumSquares / byteData.length);
  }

  function runAvatarAnimationLoop() {
    var micData = new Uint8Array(talkState.micAnalyser.frequencyBinCount);
    var playbackData = new Uint8Array(talkState.playbackAnalyser.frequencyBinCount);

    function tick() {
      if (!talkState) return;
      talkState.micAnalyser.getByteTimeDomainData(micData);
      var micLevel = rmsLevel(micData);
      var meterFill = document.getElementById("aidtMeterFill");
      if (meterFill) meterFill.style.width = Math.min(100, micLevel * 300) + "%";

      talkState.playbackAnalyser.getByteTimeDomainData(playbackData);
      var speakLevel = rmsLevel(playbackData);
      var speaking = speakLevel > 0.02;
      var ring = document.getElementById("aidtRing");
      var avatar = document.getElementById("aidtAvatar");
      if (ring) ring.classList.toggle("speaking", speaking);
      if (avatar) avatar.style.transform = speaking ? "scale(" + (1 + Math.min(speakLevel, 0.3) * 0.5) + ")" : "scale(1)";
      setFaceFrame(speaking ? Math.min(speakLevel, 0.3) / 0.3 : 0);

      talkState.animFrame = requestAnimationFrame(tick);
    }
    talkState.animFrame = requestAnimationFrame(tick);
  }

  function stopTalk() {
    if (!talkState) return;
    if (talkState.animFrame) cancelAnimationFrame(talkState.animFrame);
    talkState.ws.close();
    talkState.processorNode.disconnect();
    talkState.micStream.getTracks().forEach(function (t) { t.stop(); });
    talkState.audioCtx.close();
    talkState.playbackCtx.close();
    talkState = null;
    var toggleEl = document.getElementById("aidtToggle");
    if (toggleEl) { toggleEl.textContent = "Start"; toggleEl.classList.remove("active"); }
    var dotEl = document.getElementById("aidtMicDot");
    if (dotEl) dotEl.classList.remove("live");
    var ring = document.getElementById("aidtRing");
    if (ring) ring.classList.remove("speaking");
    var avatar = document.getElementById("aidtAvatar");
    if (avatar) avatar.style.transform = "scale(1)";
    var meterFill = document.getElementById("aidtMeterFill");
    if (meterFill) meterFill.style.width = "0%";
    setFaceFrame(0);
  }

  function resampleTo(float32, fromRate, toRate) {
    if (fromRate === toRate) return float32;
    var ratio = fromRate / toRate;
    var newLength = Math.round(float32.length / ratio);
    var result = new Float32Array(newLength);
    for (var i = 0; i < newLength; i++) {
      var srcIndex = i * ratio;
      var i0 = Math.floor(srcIndex);
      var i1 = Math.min(i0 + 1, float32.length - 1);
      var frac = srcIndex - i0;
      result[i] = float32[i0] * (1 - frac) + float32[i1] * frac;
    }
    return result;
  }

  function floatTo16BitPCM(float32) {
    var buffer = new ArrayBuffer(float32.length * 2);
    var view = new DataView(buffer);
    for (var i = 0; i < float32.length; i++) {
      var s = Math.max(-1, Math.min(1, float32[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  function init() {
    injectStyles();
    var fab = document.createElement("button");
    fab.className = "aidt-fab";
    fab.setAttribute("aria-label", "Talk to us");
    fab.title = "Talk to us";
    fab.textContent = "🎙️";
    fab.onclick = function () {
      openTalk({ id: EXEC_ID, name: EXEC_NAME, avatar_url: EXEC_AVATAR });
    };
    document.body.appendChild(fab);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
