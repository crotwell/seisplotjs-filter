import * as OregonDSPTop from 'oregondsp';
import * as model from 'seisplotjs-model';

let OregonDSP = OregonDSPTop.com.oregondsp.signalProcessing;

export { OregonDSP, model };

// if OregonDSP is loaded (here it is) we want to use 
// its Complex instead of the simple one defined in model
model.createComplex = function(real, imag) {
  return new OregonDSP.filter.iir.Complex_init(real, imag);
}

export let BAND_PASS = OregonDSP.filter.iir.PassbandType.BANDPASS;
export let LOW_PASS = OregonDSP.filter.iir.PassbandType.LOWPASS;
export let HIGH_PASS = OregonDSP.filter.iir.PassbandType.HIGHPASS;

export function amplitude(real, imag) {
  return Math.hypot(real, imag);
}

export function rMean(seis) {
  let out = seis.clone();
  let meanVal = mean(seis);
  let demeanY = seis.y().map(function(d) {
    return d-meanVal;
  });
  out.y(demeanY);
  return out;
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

export function calcDFT(waveform, npts) {
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

