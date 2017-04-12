import * as OregonDSP from 'oregondsp';
import * as model from 'seisplotjs-model';

console.log("OregonDSP: "+OregonDSP);


export { OregonDSP, model };

export let BAND_PASS = OregonDSP.com.oregondsp.signalProcessing.filter.iir.PassbandType.BANDPASS;
export let LOW_PASS = OregonDSP.com.oregondsp.signalProcessing.filter.iir.PassbandType.LOWPASS;
export let HIGH_PASS = OregonDSP.com.oregondsp.signalProcessing.filter.iir.PassbandType.HIGHPASS;

export function amplitude(real, imag) {
  return Math.hypot(real, imag);
}

export function rMean(waveform) {
  let meanVal = mean(waveform);
  let demeanY = waveform.y().map(function(d) {
    return d-meanVal;
  });
  return new model.Seismogram(demeanY, waveform.sampleRate(), waveform.start());
}

export function mean(waveform) {
  return meanOfSlice(waveform.y(), waveform.y().length);
}

function meanOfSlice(dataSlice, totalPts) {
  if (dataSlice.length < 8) {
    return dataSlice.reduce(function(acc, val) {
       return acc + val;
    }, 0) / totalPts;
  } else {
    var byTwo = Math.floor(dataSlice.length / 2);
    return meanOfSlice(dataSlice.slice(0, byTwo), totalPts) + meanOfSlice(dataSlice.slice(byTwo, dataSlice.length), totalPts);
  }
}

export function tryDFT() {
  let npts = 1024;
  let signal = [];
  for (let i=0; i<npts; i++) {
    signal[i] = Math.random();
  }
  this.doDFT(signal, signal.length);
}

export function highPass(waveform, cutoffFreq) {
  applyFilter(DSP.DSP.HIGHPASS, waveform, waveform.sampleRate, cutoffFreq);
}

export function lowPass(waveform, cutoffFreq) {
  applyFilter(DSP.DSP.LOWPASS, waveform, waveform.sampleRate, cutoffFreq);
}

export function applyFilter(filterStyle, dataArray, sps, cutoffFreq) {
  let filter = new DSP.IIRFilter(filterStyle, cutoffFreq, 1, sps);
  filter.process(dataArray);
  return;
}

export function doDFT(waveform, npts, sps) {
  let log2N = 4;
  let N = 16;
  while(N < npts) { log2N += 1; N = 2 * N;}
console.log("doDFT: N: "+N+" log2N: "+log2N+"  waveform.length: "+waveform.length);
  let dft = new OregonDSP.com.oregondsp.signalProcessing.fft.RDFT(log2N);
  let inArray = waveform.slice();
  for(let i=waveform.length; i< N; i++) {
    inArray.push(0);
  }
  
  let out = Array(N).fill(0);
  dft.evaluate(inArray, out);
  return out;
}

export function createFilter(filterName,
                           passband,
                           epsilon,
                           lowFreqCorner,
                           highFreqCorner,
                           numPoles,
                           filterType,
                           delta) {
  var filter;
  if (filterName === "chebyshevI") {
            filter = new OregonDSP.com.oregondsp.signalProcessing.filter.iir.ChebyshevI(numPoles,
                                    epsilon,
                                    passband,
                                    lowFreqCorner,
                                    highFreqCorner,
                                    delta);
        } else if (filterName === "chebyshevII") {
            filter = new OregonDSP.com.oregondsp.signalProcessing.filter.iir.ChebyshevII(numPoles,
                                     epsilon,
                                     passband,
                                     lowFreqCorner,
                                     highFreqCorner,
                                     delta);
        } else if (filterName == null || filterName === "butterworth") {
            // butterworth is default
            filter = new OregonDSP.com.oregondsp.signalProcessing.filter.iir.Butterworth(numPoles,
                                     passband,
                                     lowFreqCorner,
                                     highFreqCorner,
                                     delta);
        } else {
          throw new Error("Unknown filter type: "+filterName);
        }
        return filter;
}
