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

  // Optional: explicit backend base URL to bypass Next.js proxy (for dev).
  // e.g. data-api-base="http://localhost:8000"
  // If omitted, falls back to page origin + /desk prefix.
  var API_BASE = (CUR_SCRIPT.getAttribute("data-api-base") || "").replace(/\/$/, "");

  // Rotating female counsellor names shown on the FAB label each call
  var FEMALE_NAMES = ["Priya", "Anjali", "Sneha", "Meera", "Divya", "Riya", "Pooja", "Nisha"];
  var nameIndex = 0;
  function nextCallerName() {
    var n = FEMALE_NAMES[nameIndex % FEMALE_NAMES.length];
    nameIndex++;
    return n;
  }

  var GEMINI_SAMPLE_RATE = 16000;
  var talkState = null;

  function injectStyles() {
    var css = "\
.aidt-fab{position:fixed;right:22px;bottom:90px;z-index:99998;width:54px;height:54px;border-radius:50%;\
background:linear-gradient(135deg,#4f3cc9,#4230b3);color:#fff;border:none;cursor:pointer;\
box-shadow:0 6px 20px -4px rgba(28,26,40,.35);font-size:22px;display:flex;align-items:center;justify-content:center;\
transition:transform .15s ease;}\
.aidt-fab:hover{transform:scale(1.08);box-shadow:0 8px 24px -2px rgba(79,60,201,.5);}\
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
    var tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function escapeHtml(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(s) { return String(s || "").replace(/"/g, "&quot;"); }

  function talkAvatarHtml(exec) {
    if (exec && exec.avatar_url) {
      return '<img src="' + escapeAttr(exec.avatar_url) + '" alt="' + escapeAttr(exec.name) + '" class="aidt-face" style="opacity:1" />';
    }
    return (
      '<img src="' + BASE + '/avatars/woman-mouth-closed.png" alt="" class="aidt-face" id="aidtFaceClosed" style="opacity:1" />' +
      '<img src="' + BASE + '/avatars/woman-mouth-mid.png" alt="" class="aidt-face" id="aidtFaceMid" style="opacity:0" />' +
      '<img src="' + BASE + '/avatars/woman-mouth-open.png" alt="" class="aidt-face" id="aidtFaceOpen" style="opacity:0" />'
    );
  }

  var CALL_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/></svg>';
  var END_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>';

  function openTalk(exec) {
    var backdrop = document.createElement("div");
    backdrop.className = "aidt-backdrop";
    backdrop.id = "aidtModal";
    backdrop.innerHTML =
      '<div class="aidt-modal">' +
        '<div class="aidt-avatar-wrap"><div class="aidt-avatar-ring" id="aidtRing"></div>' +
          '<div class="aidt-avatar" id="aidtAvatar">' + talkAvatarHtml(exec) + '</div></div>' +
        '<h2><span class="aidt-mic-dot" id="aidtMicDot"></span> ' + escapeHtml(exec.name) + '</h2>' +
        '<p class="aidt-status" id="aidtStatus">Connecting&hellip; please allow microphone access.</p>' +
        '<div class="aidt-meter"><div class="aidt-meter-fill" id="aidtMeterFill"></div></div>' +
        '<button class="aidt-btn aidt-btn-primary active" id="aidtToggle" style="display:inline-flex;align-items:center;justify-content:center;gap:7px;">' + END_ICON + ' End Call</button>' +
        '<button class="aidt-btn aidt-btn-secondary" id="aidtClose">Close</button>' +
      '</div>';
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeTalk(); });
    document.getElementById("aidtClose").onclick = closeTalk;
    document.getElementById("aidtToggle").onclick = function () { stopTalk(); };

    // Start the call immediately with the counsellor's name
    startTalk(exec.id, "Candidate", "", exec.name);
  }

  function closeTalk() {
    if (talkState) stopTalk();
    var el = document.getElementById("aidtModal");
    if (el) el.remove();
  }

  function startTalk(execId, callerName, callerPhone, agentName) {
    var statusEl = document.getElementById("aidtStatus");
    var dotEl = document.getElementById("aidtMicDot");
    var toggleEl = document.getElementById("aidtToggle");
    navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: GEMINI_SAMPLE_RATE } })
      .then(function (micStream) {
        // Build WebSocket URL: use API_BASE directly (e.g. http://localhost:8000)
        // so the connection goes straight to FastAPI, not through Next.js proxy.
        var wsBase = API_BASE || (location.origin + "/desk");
        var wsUrl = wsBase.replace(/^https:/, "wss:").replace(/^http:/, "ws:") + "/ws/voice-chat/" + execId;
        var params = new URLSearchParams({ caller_name: callerName || "Candidate" });
        if (callerPhone) params.set("caller_phone", callerPhone);
        if (agentName) params.set("agent_name", agentName);
        var ws = new WebSocket(wsUrl + "?" + params);
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
        // Browsers create AudioContexts suspended until a user gesture resumes them.
        // getUserMedia() above satisfies the gesture requirement for audioCtx, but this
        // second context is created later inside the same handler and needs its own
        // resume() call — otherwise playback is silently dropped (no error, no sound).
        if (playbackCtx.state === "suspended") playbackCtx.resume();
        var playCursor = playbackCtx.currentTime;
        var playbackAnalyser = playbackCtx.createAnalyser();
        playbackAnalyser.fftSize = 256;
        playbackAnalyser.connect(playbackCtx.destination);

        ws.onmessage = function (event) {
          if (typeof event.data === "string") return;
          if (playbackCtx.state === "suspended") playbackCtx.resume(); // guard against re-suspension (e.g. tab backgrounded)
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
        toggleEl.innerHTML = END_ICON + ' End Call';
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
    if (toggleEl) { toggleEl.innerHTML = CALL_ICON + ' Call'; toggleEl.classList.remove("active"); }
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
    var activeCounsellor = (EXEC_NAME && EXEC_NAME !== "Assistant") ? EXEC_NAME : FEMALE_NAMES[0];
    var firstLabel = "Call " + activeCounsellor;
    fab.setAttribute("aria-label", firstLabel);
    fab.title = firstLabel;
    fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/></svg>';
    fab.onclick = function () {
      if (document.getElementById("aidtModal")) return; // already open
      var counsellor = (EXEC_NAME && EXEC_NAME !== "Assistant") ? EXEC_NAME : FEMALE_NAMES[nameIndex % FEMALE_NAMES.length];
      nameIndex++;
      var nextName = (EXEC_NAME && EXEC_NAME !== "Assistant") ? EXEC_NAME : FEMALE_NAMES[nameIndex % FEMALE_NAMES.length];
      var nextLabel = "Call " + nextName;
      fab.setAttribute("aria-label", nextLabel);
      fab.title = nextLabel;
      openTalk({ id: EXEC_ID, name: counsellor, avatar_url: EXEC_AVATAR });
    };
    document.body.appendChild(fab);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
