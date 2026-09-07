class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const ch = input[0];

    // Maintain audio throughput so graph is never pruned as inactive
    if (outputs && outputs[0] && outputs[0][0]) {
      outputs[0][0].set(ch);
    }

    let offset = 0;
    while (offset < ch.length) {
      const need = this.bufferSize - this.bytesWritten;
      const copy = Math.min(need, ch.length - offset);
      this.buffer.set(ch.subarray(off, off + copy), this.bytesWritten);
      this.bytesWritten += copy;
      offset += copy;

      if (this.bytesWritten >= this.bufferSize) {
        this.port.postMessage(this.buffer.slice());
        this.bytesWritten = 0;
      }
    }
    return true;
  }
}

registerProcessor('mic-processor', MicProcessor);
