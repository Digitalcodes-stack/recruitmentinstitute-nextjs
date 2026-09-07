"""
Audio transcoding and resampling between Plivo Telephony (8kHz/16kHz μ-law or PCM16)
and Google Gemini Live (16kHz PCM16 input / 24kHz PCM16 output).
"""
import audioop
import base64
import logging

logger = logging.getLogger("aidesk.transcoder")


class PlivoAudioTranscoder:
    """
    Maintains rate-conversion state for streaming chunks in both directions:
      - Inbound:  Plivo (8kHz μ-law or 16kHz PCM16) -> Gemini Live (16kHz PCM16)
      - Outbound: Gemini Live (24kHz PCM16) -> Plivo (8kHz μ-law or 16kHz PCM16)
    """

    def __init__(self, plivo_content_type: str = "audio/x-mulaw", plivo_sample_rate: int = 8000):
        self.plivo_content_type = plivo_content_type.lower()
        self.plivo_sample_rate = plivo_sample_rate
        self.is_mulaw = "mulaw" in self.plivo_content_type
        self._inbound_ratecv_state = None
        self._outbound_ratecv_state = None

    def decode_inbound(self, base64_payload: str) -> bytes:
        """
        Takes a base64 chunk from Plivo's `media` event, decodes and resamples
        to 16kHz PCM16 for Gemini Live.
        """
        raw_bytes = base64.b64decode(base64_payload)
        if not raw_bytes:
            return b""

        # Step 1: μ-law to Linear PCM16 (if needed)
        if self.is_mulaw:
            pcm_in = audioop.ulaw2lin(raw_bytes, 2)
        else:
            pcm_in = raw_bytes

        # Step 2: Resample to 16000Hz (Gemini Live input requirement)
        if self.plivo_sample_rate == 16000:
            return pcm_in

        pcm_16k, self._inbound_ratecv_state = audioop.ratecv(
            pcm_in,
            2,                       # 2 bytes per sample (16-bit)
            1,                       # 1 channel (mono)
            self.plivo_sample_rate,  # e.g. 8000
            16000,                   # target Gemini rate
            self._inbound_ratecv_state,
        )
        return pcm_16k

    def encode_outbound(self, pcm24k_bytes: bytes) -> str:
        """
        Takes raw 24kHz PCM16 chunk from Gemini Live, resamples to Plivo's rate
        (typically 8kHz), encodes to μ-law (if configured), and returns base64 payload.
        """
        if not pcm24k_bytes:
            return ""

        # Step 1: Downsample from 24000Hz to Plivo sample rate (e.g. 8000Hz)
        pcm_target, self._outbound_ratecv_state = audioop.ratecv(
            pcm24k_bytes,
            2,                       # 16-bit
            1,                       # mono
            24000,                   # Gemini Live output rate
            self.plivo_sample_rate,  # e.g. 8000 or 16000
            self._outbound_ratecv_state,
        )

        # Step 2: Encode to μ-law if requested by Plivo stream
        if self.is_mulaw:
            encoded_bytes = audioop.lin2ulaw(pcm_target, 2)
        else:
            encoded_bytes = pcm_target

        return base64.b64encode(encoded_bytes).decode("ascii")
