// AudioWorkletProcessor: downsamples mono to 16kHz Int16 and posts ~100ms frames.
// Registered as 'pcm-downsampler-16k'.

class PcmDownsampler extends AudioWorkletProcessor {
  constructor() {
    super();
    // 100ms @ 16kHz = 1600 samples
    this._frame = new Int16Array(1600);
    this._offset = 0;
    this._ratio = sampleRate / 16000;
    this._accum = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const ch = input[0];
    for (let i = 0; i < ch.length; i++) {
      this._accum += 1;
      if (this._accum >= this._ratio) {
        this._accum -= this._ratio;
        let s = ch[i];
        if (s > 1) s = 1;
        else if (s < -1) s = -1;
        this._frame[this._offset++] = s < 0 ? s * 0x8000 : s * 0x7fff;
        if (this._offset >= this._frame.length) {
          // Copy into a fresh buffer we can transfer.
          const out = new Int16Array(this._frame.length);
          out.set(this._frame);
          this.port.postMessage(out.buffer, [out.buffer]);
          this._offset = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("pcm-downsampler-16k", PcmDownsampler);
