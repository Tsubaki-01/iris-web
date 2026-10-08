/* 浏览器音频仅送入 ASR，不进行本地播放。 */
class IrisPcmCapture extends AudioWorkletProcessor {
  process(inputs) {
    const samples = inputs[0]?.[0];
    if (samples) this.port.postMessage(samples.slice());
    return true;
  }
}
registerProcessor('iris-pcm-capture', IrisPcmCapture);
