import * as OregonDSPTop from 'oregondsp';
import * as model from 'seisplotjs-model';

let OregonDSP = OregonDSPTop.com.oregondsp.signalProcessing;

export { OregonDSP, model };

export let BAND_PASS = OregonDSP.filter.iir.PassbandType.BANDPASS;
export let LOW_PASS = OregonDSP.filter.iir.PassbandType.LOWPASS;
export let HIGH_PASS = OregonDSP.filter.iir.PassbandType.HIGHPASS;

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

export function doDFT(waveform, npts) {
  let log2N = 4;
  let N = 16;
  while(N < npts) { log2N += 1; N = 2 * N;}
  let dft = new OregonDSP.fft.RDFT(log2N);
  let inArray = waveform.slice();
  for(let i=waveform.length; i< N; i++) {
    inArray.push(0);
  }
  
  let out = Array(N).fill(0);
  dft.evaluate(inArray, out);
  return out;
}

export function createButterworth(numPoles,
                                  passband,
                                  lowFreqCorner,
                                  highFreqCorner,
                                  delta) {
  return new OregonDSP.filter.iir.Butterworth(numPoles,
                                     passband,
                                     lowFreqCorner,
                                     highFreqCorner,
                                     delta);
}

export function createChebyshevI(numPoles,
                                 epsilon,
                                 passband,
                                 lowFreqCorner,
                                 highFreqCorner,
                                 delta) {
  return new OregonDSP.filter.iir.ChebyshevI(numPoles,
                                    epsilon,
                                    passband,
                                    lowFreqCorner,
                                    highFreqCorner,
                                    delta);
}

export function createChebyshevII(numPoles,
                                  epsilon,
                                  passband,
                                  lowFreqCorner,
                                  highFreqCorner,
                                  delta) {
  return new OregonDSP.filter.iir.ChebyshevII(numPoles,
                                     epsilon,
                                     passband,
                                     lowFreqCorner,
                                     highFreqCorner,
                                     delta);
}

