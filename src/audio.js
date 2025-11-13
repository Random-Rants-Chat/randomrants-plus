var audioEngine = {};

var AudioContext = window.AudioContext || window.webkitAudioContext; //If running under safari, uses webkitAudioContext.

var audioCTX = new AudioContext();
audioEngine.context = audioCTX;
audioEngine.running = false;

setInterval(() => {
  if (audioCTX.state === "suspended") {
    audioCTX.resume().catch(() => {});
  }
  audioEngine.running = audioCTX.state === "running";
}, 100);

function cloneAudioBuffer(fromAudioBuffer) {
  const audioBuffer = new AudioBuffer({
    length: fromAudioBuffer.length,
    numberOfChannels: fromAudioBuffer.numberOfChannels,
    sampleRate: fromAudioBuffer.sampleRate,
  });
  for (let channelI = 0; channelI < audioBuffer.numberOfChannels; ++channelI) {
    const samples = fromAudioBuffer.getChannelData(channelI);
    audioBuffer.copyToChannel(samples, channelI);
  }
  return audioBuffer;
}
audioEngine.cloneAudioBuffer = cloneAudioBuffer;

function decodeAsync(data) {
  return new Promise((resolve, reject) => {
    try {
      audioCTX.decodeAudioData(data, resolve, reject);
    } catch (e) {
      resolve(null);
    }
  });
}
audioEngine.decodeAsync = decodeAsync;
audioEngine.loadSoundFromURL = async function loadSoundURL(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return await decodeAsync(buffer);
  } catch (e) {
    console.warn(e);
    return null;
  }
};

class AudioBufferPlayer {
  constructor(data) {
    this.data = data;
    this.source = null;
    this._playbackRate = 1;
    this.playbackRate = 1;
    this.looped = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.detune = 0;
    this.startVol = 1;
    this.gainNode = null;
    this.filters = [];
  }

  setData(data) {
    this.data = data;
  }

  set looped(v) {
    if (this.source) {
      this.source.loop = v;
    }
    this._looped = v;
  }

  get looped() {
    return this._looped;
  }

  set loopStart(v) {
    if (this.source) {
      this.source.loopStart = v;
    }
    this._loopStart = v;
  }

  get loopStart() {
    return this._loopStart;
  }

  set loopEnd(v) {
    if (this.source) {
      this.source.loopEnd = v;
    }
    this._loopEnd = v;
  }

  get loopEnd() {
    return this._loopEnd;
  }

  set detune(v) {
    if (this.source) {
      this.source.detune.value = v;
    }
    this._detune = v;
  }

  get detune() {
    return this._detune;
  }

  loopAt(start, end) {
    this.loopStart = start;
    this.loopEnd = end;
  }

  stop() {
    this.pause();
  }

  play(time) {
    if (this.data) {
      if (!this.source) {
        const source = audioCTX.createBufferSource();
        this.gainNode = audioCTX.createGain();
        source.buffer = this.data;
        source.playbackRate.value = this._playbackRate;
        source.loop = this._looped;
        source.loopStart = this._loopStart;
        source.loopEnd = this._loopEnd;
        source.detune.value = this._detune;

        // Apply filters
        let currentNode = this.gainNode;
        for (const filter of this.filters) {
          currentNode.connect(filter);
          currentNode = filter;
        }
        currentNode.connect(audioCTX.destination);

        this.gainNode.gain.value = this.startVol;
        source.connect(this.gainNode);
        source.start(time);

        this.source = source;
        source.onended = () => {
          this._callOnEnded();
          this.source = null;
        };
        this._endedCalled = false;
      }
    }
  }

  _callOnEnded() {
    if (this._endedCalled) return; // prevent double firing
    this._endedCalled = true;
    if (typeof this.onended === "function") {
      this.onended();
    }
  }

  pause() {
    if (this.source) {
      this.source.stop();
      this.source = null;
      this.gainNode = null;
      this._callOnEnded();
    }
  }

  remove() {
    this.destory();
  }

  setVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
    this.startVol = value;
  }

  get volume() {
    return this.startVol;
  }

  set volume(v) {
    if (this.gainNode) {
      this.gainNode.gain.value = v;
    }
    this.startVol = v;
  }

  getVolume() {
    return this.gainNode ? this.gainNode.gain.value : this.startVol;
  }

  setPlaybackRate(value) {
    this.playbackRate = value;
  }

  set playbackRate(v) {
    this._playbackRate = v;
    if (this.source) {
      this.source.playbackRate.value = v;
    }
  }

  get playbackRate() {
    return this._playbackRate;
  }

  addFilter(filter) {
    if (filter instanceof BiquadFilterNode || filter instanceof GainNode) {
      this.filters.push(filter);
    }
  }

  clearFilters() {
    this.filters = [];
  }

  fadeIn(duration) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(0, audioCTX.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        this.startVol,
        audioCTX.currentTime + duration,
      );
    }
  }

  fadeOut(duration) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.getVolume(), audioCTX.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        0,
        audioCTX.currentTime + duration,
      );
    }
  }

  applyEqualizer(lowGain = 0, midGain = 0, highGain = 0) {
    const lowFilter = audioCTX.createBiquadFilter();
    lowFilter.type = "lowshelf";
    lowFilter.frequency.value = 250;
    lowFilter.gain.value = lowGain;

    const midFilter = audioCTX.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1;
    midFilter.gain.value = midGain;

    const highFilter = audioCTX.createBiquadFilter();
    highFilter.type = "highshelf";
    highFilter.frequency.value = 4000;
    highFilter.gain.value = highGain;

    this.filters = [lowFilter, midFilter, highFilter];
  }

  destroy() {
    // Stop playback
    this.pause();

    // Disconnect all filters and gain node
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    for (const filter of this.filters) {
      filter.disconnect();
    }
    this.filters = [];

    // Clear audio buffer reference
    this.data = null;

    // Clear event handlers
    this.onended = null;
  }

  onended() {
    // Gets overwritten by the user script
  }
}

audioEngine.Player = AudioBufferPlayer;
audioEngine.AudioBufferPlayer = AudioBufferPlayer;

module.exports = audioEngine;
