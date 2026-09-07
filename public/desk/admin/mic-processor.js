class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channelData = input[0];
    let offset = 0;
    while (offset < channelData.length) {
      const needed = this.bufferSize - this.bytesWritten;
      const toCopy = Math.min(needed, channelData.length - offset);
      this.buffer.set(channelData.subarray(offset, offset + toCopy), this.bytesWritten);
      this.bytesWritten += toCopy;
      offset += toCopy;

      if (this.bytesWritten >= this.bufferSize) {
        this.port.postMessage(this.buffer.slice());
        this.bytesWritten = 0;
      }
    }
    return true;
  }
}

registerProcessor('mic-processor', MicProcessor);
