
import { calcDFT, inverseDFT } from './index';
import * as model from 'seisplotjs-model';

export function transfer(seis,
                        response,
                        lowCut,
                        lowPass,
                        highPass,
                        highCut) {
        const poleZero = response.stages()[0].filter();
        if ( ! (poleZero instanceof model.PolesZeros)) {
          throw new Error("First stage is not instance of PoleZero");
        }
        const sacPoleZero = convertToSacPoleZero(response);

        const sampFreq = seis.getSampleRate();

        let values = seis.y();
        /* sac premultiplies the data by the sample period before doing the fft. Later it
         * seems to be cancled out by premultiplying the pole zeros by a similar factor.
         * I don't understand why they do this, but am reproducing it in order to be
         * compatible.
         */
        values = values.map(d => d/sampFreq);

        let freqValues = calcDFT(values, values.length);
        freqValues = combine(freqValues, sampFreq, sacPoleZero, lowCut, lowPass, highPass, highCut);

        values = inverseDFT(freqValues, values.length);
        // a extra factor of nfft gets in somehow???
        values = values.map(d => d * freqValues.length);
        let out = seis.clone();
        out.y(values);
        out.y_unit = model.UNITS.METER;
        return out;
    }


function combine(freqValues, sampFreq,  sacPoleZero,
                 lowCut,
                 lowPass,
                 highPass,
                 highCut) {

        const deltaF = sampFreq / freqValues.length;
        // handle zero freq
        freqValues[0] = 0;
        // handle nyquist
        let freq = sampFreq / 2;
        let respAtS = evalPoleZeroInverse(sacPoleZero, freq);
        respAtS = respAtS.timesReal(deltaF*freqTaper(freq,
                                               lowCut,
                                               lowPass,
                                               highPass,
                                               highCut));
        freqValues[freqValues.length -1 ] = respAtS.timesReal(freqValues[freqValues.length -1 ]).real();
        for(let i = 1; i < freqValues.length / 2 ; i++) {
            freq = i * deltaF;
            respAtS = evalPoleZeroInverse(sacPoleZero, freq);
            respAtS = respAtS.timesReal(deltaF*freqTaper(freq,
                                                               lowCut,
                                                               lowPass,
                                                               highPass,
                                                               highCut));
            let freqComplex = model.createComplex(freqValues[2*i-1], freqValues[2*i])
                .timesComplex(respAtS);
            freqValues[2*i-1] = freqComplex.real();
            freqValues[2*i] = freqComplex.imag();
            // fft in sac has opposite sign on imag, so take conjugate to make same
            //freqValues[freqValues.length - i] = freqValues[i].conjg();
        }
        return freqValues;
    }

    /**
     * Evaluates the poles and zeros at the given value. The return value is
     * 1/(pz(s) to avoid divide by zero issues. If there is a divide by zero
     * situation, then the response is set to be 0+0i.
     */
  function evalPoleZeroInverse(sacPoleZero, freq) {
        const s = model.createComplex(0, 2 * Math.PI * freq);
        let zeroOut = model.createComplex(1, 0);
        let poleOut = model.createComplex(1, 0);
        for(let i = 0; i < sacPoleZero.poles.length; i++) {
            poleOut = poleOut.timesComplex( s.minusComplex(sacPoleZero.poles[i]) );
        }
        for(let i = 0; i < sacPoleZero.zeros.length; i++) {
            if(s.real() == sacPoleZero.zeros[i].real()
                    && s.imag() == sacPoleZero.zeros[i].imag()) {
                return model.createComplex(0,0);
            }
            zeroOut = zeroOut.timesComplex( s.minusComplex(sacPoleZero.zeros[i]) );
        }
        let out = poleOut.overComplex(zeroOut);
        // sac uses opposite sign in imag, so take conjugate
        return out.overComplex( sacPoleZero.constant.conjg());
    }

function freqTaper( freq,
                    lowCut,
                    lowPass,
                    highPass,
                    highCut) {
    if (lowCut > lowPass || lowPass > highPass || highPass > highCut) {
        throw new Error("must be lowCut > lowPass > highPass > highCut: "+lowCut +" "+ lowPass +" "+ highPass +" "+ highCut);
    }
    if(freq <= lowCut || freq >= highCut) {
        return 0;
    }
    if(freq >= lowPass && freq <= highPass) {
        return 1;
    }
    if(freq > lowCut && freq < lowPass) {
        return 0.5e0 * (1.0e0 + Math.cos(Math.PI * (freq - lowPass)
                / (lowCut - lowPass)));
    }
    // freq > highPass && freq < highCut
    return 0.5e0 * (1.0e0 - Math.cos(Math.PI * (freq - highCut)
            / (highPass - highCut)));
}

function convertToSacPoleZero( response) {
    const polesZeros = response.stages()[0].filter();
    if ( ! (polesZeros instanceof model.PolesZeros)) {
      throw new Error("First stage is not instance of PoleZero");
    }
    let unit = response.instrumentSensitivity().inputUnits();

    const unitQty = new model.Qty(unit);
    let scaleUnit = new model.Qty(1, unit);
    let gamma = 0;
    if (unitQty.isCompatible(model.UNITS.METER)) {
        gamma = 0;
        scaleUnit = scaleUnit.to(model.UNITS.METER);
    } else if (unitQty.isConvertableTo(model.UNITS.METER_PER_SECOND)) {
        gamma = 1;
        scaleUnit = scaleUnit.to(model.UNITS.METER_PER_SECOND);
    } else if (unitQty.isConvertableTo(model.UNITS.METER_PER_SECOND_PER_SECOND)) {
        gamma = 2;
        scaleUnit = scaleUnit.to(model.UNITS.METER_PER_SECOND_PER_SECOND);
    } else {
        throw new Error("response unit is not displacement, velocity or acceleration: "+unit);
    }

    let mulFactor = 1;
    if (polesZeros.pzTransferFunctionType().equals("LAPLACE (HERTZ)")) {
        mulFactor = 2 * Math.PI;
    }
    let zeros = [];
    // extra gamma zeros are (0,0)
    for (let i = 0; i < polesZeros.zeros().length; i++) {
        zeros[i] = model.createComplex(polesZeros.zeros()[i].getReal() * mulFactor,
                               polesZeros.zeros()[i].getImaginary() * mulFactor);
    }
    for (let i=0; i<gamma; i++) {
      zeros.push(model.createComplex(0,0));
    }
    let poles = [];
    for (let i = 0; i < polesZeros.poles().length; i++) {
        poles[i] = model.createComplex(polesZeros.poles()[i].getReal() * mulFactor,
                               polesZeros.poles()[i].getImaginary() * mulFactor);
    }
    let constant = polesZeros.normalizationFactor();
    let sd = response.instrumentSensitivity().sensitivity();
    let fs = response.instrumentSensitivity().frequency();
    sd *= Math.pow(2 * Math.PI * fs, gamma);
    let A0 = polesZeros.normalizationFactor();
    let fn = polesZeros.normalizationFrequency();
    A0 = A0 / Math.pow(2 * Math.PI * fn, gamma);
    if (polesZeros.pzTransferFunctionType().equals("LAPLACE (HERTZ)")) {
        A0 *= Math.pow(2 * Math.PI, polesZeros.poles().length - polesZeros.zeros().length);
    }
    if (poles.length == 0 && zeros.length == 0) {
        constant = (sd * A0);
    } else {
        constant = (sd * calc_A0(poles, zeros, fs));
    }
    constant *= scaleUnit.scalar;
    return {
      poles:poles,
      zeros: zeros,
      constant: constant
    };
}

function calc_A0(poles, zeros, ref_freq) {
    let numer = model.createComplex(1, 0);
    let denom = model.createComplex(1, 0);
    let f0;
    let a0;
    f0 = model.createComplex(0, 2 * Math.PI * ref_freq);
    for (let i = 0; i < zeros.length; i++) {
        denom = denom.timesComplex( f0.sub(zeros[i]));
    }
    for (let i = 0; i < poles.length; i++) {
        numer = numer.timesCompex( f0.sub(poles[i]));
    }
    a0 = numer.overComplex(denom).abs();
    return a0;
}
