import * as filter from '../src/index';
import {readSac, readSacPoleZero} from './sacfile';

const ONE_COMPLEX = filter.model.createComplex(1, 0);
/**
 * @author crotwell Created on Jul 27, 2005
 */

 expect.extend({
   toBeCloseToArray(received, argument, digits) {
     const pass = (received.length == argument.length);
     if (! pass) {
       return {
         message: () =>
           `expected array length ${received.length} not to be ${argument.length}`,
         pass: false,
       };
     }
     let i;
     for (i=0; i<received.length; i++) {
         let m = expect(argument[i]).toBeCloseTo(received[i], digits);
         if ( ! m.pass) {
           return {
             message: () => `at index ${i} `+m.message(),
             pass: false,
           };

       }
     }
     if (pass) {
       return {
         message: () =>
           `expected array not to be close to array`,
         pass: true,
       };
     }
   },
 });

test("testTaper", () => {
    expect(filter.transfer.freqTaper(0, 1, 2, 3, 4)).toBeCloseTo(0, 5);
    expect(filter.transfer.freqTaper(1, 1, 2, 3, 4)).toBeCloseTo(0, 5);
    expect(filter.transfer.freqTaper(2, 1, 2, 3, 4)).toBeCloseTo(1, 5);
    expect(filter.transfer.freqTaper(1.5, 1, 2, 3, 4)).toBeCloseTo(.5, 5);
    expect(filter.transfer.freqTaper(3, 1, 2, 3, 4)).toBeCloseTo(1, 5);
    expect(filter.transfer.freqTaper(4, 1, 2, 3, 4)).toBeCloseTo(0, 5);
    expect(filter.transfer.freqTaper(5, 1, 2, 3, 4)).toBeCloseTo(0, 5);
});

test("TaperVsSac", () => {
    let sacout = [ [ 0, 0.000610352, 0 ],
                          [ 0.000610352, 0.000610352, 0 ],
                          [ 0.0012207, 0.000610352, 0 ],
                          [ 0.00183105, 0.000610352, 0 ],
                          [ 0.00244141, 0.000610352, 0 ],
                          [ 0.00305176, 0.000610352, 0 ],
                          [ 0.00366211, 0.000610352, 0 ],
                          [ 0.00427246, 0.000610352, 0 ],
                          [ 0.00488281, 0.000610352, 0 ],
                          [ 0.00549316, 0.000610352, 1.4534e-05 ],
                          [ 0.00610352, 0.000610352, 7.04641e-05 ],
                          [ 0.00671387, 0.000610352, 0.000160492 ],
                          [ 0.00732422, 0.000610352, 0.000271539 ],
                          [ 0.00793457, 0.000610352, 0.000387472 ],
                          [ 0.00854492, 0.000610352, 0.00049145 ],
                          [ 0.00915527, 0.000610352, 0.000568367 ],
                          [ 0.00976562, 0.000610352, 0.000607048 ],
                          [ 0.010376, 0.000610352, 0.000610352 ],
                          [ 0.0109863, 0.000610352, 0.000610352 ],
                          [ 0.0115967, 0.000610352, 0.000610352 ] ];
    for(let row of sacout) {
        expect(row[1]*filter.transfer.freqTaper(row[0], .005, .01, 1e5, 1e6)).toBeCloseTo(row[2], 5);

    }
});

test("testEvalPoleZero", () => {
    // array is freq, real, imag from sac genran.c
    const sacout =  [ [0, 0, 0],
                      [0.000610352, -63356.3, -165446],
                      [0.0012207, -897853, -986468],
                      [0.00183105, -3.56033e+06, -1.78889e+06],
                      [0.00244141, -7.78585e+06, -1.05324e+06],
                      [0.00305176, -1.21507e+07, 1.70486e+06],
                      [0.00366211, -1.56945e+07, 5.80921e+06],
                      [0.00427246, -1.82753e+07, 1.04878e+07],
                      [0.00488281, -2.00925e+07, 1.52973e+07],
                      [0.00549316, -2.13745e+07, 2.00495e+07],
                      [0.00610352, -2.22939e+07, 2.46831e+07],
                      [0.00671387, -2.29672e+07, 2.91893e+07],
                      [0.00732422, -2.34707e+07, 3.35782e+07],
                      [0.00793457, -2.38545e+07, 3.78652e+07],
                      [0.00854492, -2.4152e+07, 4.20655e+07],
                      [0.00915527, -2.43859e+07, 4.61927e+07],
                      [5.04028, 1.48193e+10, 1.47267e+10],
                      [5.04089, 1.48211e+10, 1.47267e+10],
                      [5.0415, 1.48229e+10, 1.47267e+10],
                      [5.04211, 1.48246e+10, 1.47267e+10],
                      [5.04272, 1.48264e+10, 1.47267e+10],
                      [5.04333, 1.48282e+10, 1.47266e+10],
                      [5.04395, 1.483e+10, 1.47266e+10],
                      [5.04456, 1.48318e+10, 1.47266e+10],
                      [5.04517, 1.48336e+10, 1.47266e+10],
                      [5.04578, 1.48353e+10, 1.47266e+10],
                      [5.04639, 1.48371e+10, 1.47266e+10],
                      [5.047, 1.48389e+10, 1.47266e+10],
                      [5.04761, 1.48407e+10, 1.47265e+10],
                      [5.04822, 1.48425e+10, 1.47265e+10],
                      [5.04883, 1.48442e+10, 1.47265e+10],
                      [5.04944, 1.4846e+10, 1.47265e+10],
                      [5.05005, 1.48478e+10, 1.47265e+10],
                      [9.99084, 2.35288e+10, 1.17883e+10],
                      [9.99145, 2.35294e+10, 1.17878e+10],
                      [9.99207, 2.353e+10, 1.17874e+10],
                      [9.99268, 2.35306e+10, 1.1787e+10],
                      [9.99329, 2.35311e+10, 1.17865e+10],
                      [9.9939, 2.35317e+10, 1.17861e+10],
                      [9.99451, 2.35323e+10, 1.17857e+10],
                      [9.99512, 2.35329e+10, 1.17852e+10],
                      [9.99573, 2.35334e+10, 1.17848e+10],
                      [9.99634, 2.3534e+10, 1.17844e+10],
                      [9.99695, 2.35346e+10, 1.17839e+10],
                      [9.99756, 2.35352e+10, 1.17835e+10],
                      [9.99817, 2.35357e+10, 1.17831e+10],
                      [9.99878, 2.35363e+10, 1.17826e+10],
                      [9.99939, 2.35369e+10, 1.17822e+10],
                      [10, 2.35375e+10, 1.17818e+10]];
    // IU.HRV.BHE response
    const zeros =  [filter.model.createComplex(0, 0),
                    filter.model.createComplex(0, 0),
                    filter.model.createComplex(0, 0) ];
    const poles =  [filter.model.createComplex(-0.0139, 0.0100),
                    filter.model.createComplex(-0.0139, -0.0100),
                    filter.model.createComplex(-31.4160, 0.0000) ];
    let sacPoleZero = {
      poles: poles,
      zeros: zeros,
      constant: 2.94283674E10
    };
    for(let i = 1; i < sacout.length; i++) {
        let dhi = filter.transfer.evalPoleZeroInverse(sacPoleZero, sacout[i][0]);
        dhi = ONE_COMPLEX.overComplex(dhi);
        expect(sacout[i][1] / dhi.real()).toBeCloseTo(1.0, 4);
        expect(sacout[i][2] / dhi.imag()).toBeCloseTo(1.0, 4);
    }
});

test("ReadPoleZero", () => {
  return readSacPoleZero("./test/data/hrv.bhe.sacpz")
  .then( pz => {

    // IU.HRV.BHE response
    const zeros =  [filter.model.createComplex(0, 0),
      filter.model.createComplex(0, 0),
      filter.model.createComplex(0, 0) ];
    const poles =  [filter.model.createComplex(-0.0139, 0.0100),
      filter.model.createComplex(-0.0139, -0.0100),
      filter.model.createComplex(-31.4160, 0.0000) ];
    let sacPoleZero = {
    poles: poles,
    zeros: zeros,
    constant: 2.94283674E10
    };
    expect(pz.zeros.length).toBe(sacPoleZero.zeros.length);
    for (let i=0; i<pz.zeros.length; i++) {
      expect(pz.zeros[i].real()).toBeCloseTo(sacPoleZero.zeros[i].real(), 5);
      expect(pz.zeros[i].imag()).toBeCloseTo(sacPoleZero.zeros[i].imag(), 5);
    }
    expect(pz.poles.length).toBe(sacPoleZero.poles.length);
    for (let i=0; i<pz.poles.length; i++) {
      expect(pz.poles[i].real()).toBeCloseTo(sacPoleZero.poles[i].real(), 5);
      expect(pz.poles[i].imag()).toBeCloseTo(sacPoleZero.poles[i].imag(), 5);
    }
    expect(pz.constant).toBe(sacPoleZero.constant);
  });
});

test("PoleZeroTaper", () => {
    return Promise.all([readSac("./test/data/IU.HRV.__.BHE.SAC"),
                        readSacPoleZero("./test/data/hrv.bhe.sacpz")])
    .then( result => {
      let sac = result[0];
      let poleZero = result[1];
      let data = sac.y;
      let samprate = 1 / sac.delta;
      for(let i = 0; i < data.length; i++) {
          data[i] /= samprate;
      }
      let out = filter.calcDFT(data, data.length);
      const sacout = [ [0, 0, 0],
                       [0.000610352, -0, 0],
                       [0.0012207, -0, 0],
                       [0.00183105, -0, 0],
                       [0.00244141, -0, 0],
                       [0.00305176, -0, -0],
                       [0.00366211, -0, -0],
                       [0.00427246, -0, -0],
                       [0.00488281, -0, -0],
                       [0.00549316, -3.61712e-13, -3.39289e-13],
                       [0.00610352, -1.42001e-12, -1.57219e-12],
                       [0.00671387, -2.67201e-12, -3.39588e-12],
                       [0.00732422, -3.79726e-12, -5.43252e-12],
                       [0.00793457, -4.615e-12, -7.32556e-12],
                       [0.00854492, -5.04479e-12, -8.7865e-12],
                       [0.00915527, -5.07988e-12, -9.62251e-12],
                       [0.00976562, -4.7661e-12, -9.74839e-12],
                       [0.010376, -4.24248e-12, -9.31375e-12],
                       [0.0109863, -3.78195e-12, -8.86666e-12],
                       [0.0115967, -3.3922e-12, -8.4564e-12]];
      const lowCut = .005;
      const lowPass = 0.01;
      const highPass = 1e5;
      const highCut = 1e6;
      console.log("sac.delta: "+sac.delta+" samprate: "+samprate+"  "+out.length);
      const deltaF = samprate / out.length;
      let freq;
      let respAtS;
      for(let i = 0; i < sacout.length; i++) {
          freq = i * deltaF;
          //console.log(i+" freq test "+freq+"  "+sacout[i][0]);
          expect(freq).toBeCloseTo(sacout[i][0], 5);
          respAtS = filter.transfer.evalPoleZeroInverse(poleZero, freq);
          respAtS = respAtS.timesReal(deltaF*filter.transfer.freqTaper(freq,
                                                 lowCut,
                                                 lowPass,
                                                 highPass,
                                                 highCut));

          if(sacout[i][0] == 0 || respAtS.real() == 0) {
            expect(respAtS.real()).toBeCloseTo(sacout[i][1], 5);
              // assertEquals("real " + i + " " + respAtS.real()+"   "+sacout[i][1],
              //              sacout[i][1],
              //              respAtS.real() ,
              //              0.00001);
          } else {
              expect(respAtS.real()).toBeCloseTo(sacout[i][1], 5);
              // assertEquals("real " + i + " " + respAtS.real()+"   "+sacout[i][1], 1, sacout[i][1]
              //         / respAtS.real(), 0.00001);
          }
          if(sacout[i][1] == 0 || respAtS.imag() == 0) {
            expect(respAtS.imag()).toBeCloseTo(sacout[i][2], 5);
              // assertEquals("imag " + i + " " + respAtS.imag(),
              //              sacout[i][2],
              //              respAtS.imag() ,
              //              0.00001);
          } else {
              expect(respAtS.imag()).toBeCloseTo(-1*sacout[i][2], 5);
              // assertEquals("imag " + i + " " + respAtS.imag(),
              //              -1,
              //              sacout[i][2] / respAtS.imag() ,
              //              0.00001);
          }

      }
    });
});

test("FFT", () => {
  return readSac("./test/data/IU.HRV.__.BHE.SAC")
    .then(sac => {
      const samprate = 1/ sac.delta;
      let data = sac.y;
      /* sac premultiplies the data by the sample period before doing the fft. Later it
       * seems to be cancled out by premultiplying the pole zeros by a similar factor.
       * I don't understand why they do this, but am reporducing it in order to be
       * compatible.
       */
      for(let i = 0; i < data.length; i++) {
          data[i] /= samprate;
      }
      const out = filter.calcDFT(data, data.length);
      const sacout =  [ [695917, 0],
                        [-34640.4, 7593.43],
                        [-28626.7, -34529.8],
                        [-28644.3, -18493.2],
                        [-17856.8, -14744.9],
                        [-26180.4, -13016],
                        [-35773.7, -28250.8],
                        [-3204.24, -39020.9],
                        [-6523.97, -9036.16],
                        [-9328.12, -28816.7],
                        [-4191.56, -4618.8],
                        [-25816.1, -37862.5],
                        [24457.3, -40734.5],
                        [33569.6, 6327.69],
                        [-35207.2, 24178.2],
                        [-16313.6, -81431.5],
                        [77269.7, -3612.97],
                        [-5407.14, 32410.2],
                        [-11010.8, 4728.02],
                        [-15558.3, -24774.9]];
      // real
      expect(out[0]).toBeCloseTo(sacout[0][0], 0);
      //imag
      //expect(out[0].imag()).toBeCloseTo(sacout[0][1], 5);
      // assertEquals("real " + 0 + " " + out[0].real(), 1, sacout[0][0]
      //         / out[0].real() , 0.00001);
      // assertEquals("imag " + 0 + " " + out[0].imag(),
      //              sacout[0][1],
      //              -out[0].imag() ,
      //              0.00001);
      for(let i = 1; i < sacout.length; i++) {
        //real
        expect(out[i]).toBeCloseTo(sacout[i][0], 1);
        //imag
        expect(out[out.length-i]).toBeCloseTo(sacout[i][1], 1);
          // assertEquals("real " + i + " " + out[i].real(), 1, sacout[i][0]
          //         / out[i].real(), 0.00001);
          // // sac fft is opposite sign imag, so ratio is -1
          // assertEquals("imag " + i + " " + out[i].imag(), -1, sacout[i][1]
          //         / out[i].imag(), 0.00001);
      }
    });
});


test("Combine", () => {
  return Promise.all([readSac("./test/data/IU.HRV.__.BHE.SAC"),
                      readSacPoleZero("./test/data/hrv.bhe.sacpz")])
  .then ( result => {
      let sac = result[0];
      let pz = result[1];
      const samprate = 1/ sac.delta;
      let data = sac.y;
      for(let i = 0; i < data.length; i++) {
          data[i] /= samprate;
      }


      const outfft = filter.calcDFT(data, data.length);
      expect(outfft.length).toBe(32768);
      //assertEquals("nfft", 32768, out.length);
      expect(samprate/outfft.length).toBeCloseTo(0.000610352, 9);
      //assertEquals("delfrq ", 0.000610352, samprate/out.length, 0.00001);
      const out = filter.transfer.combine(outfft, samprate, pz, 0.005, 0.01, 1e5, 1e6);
      const sacout = [ [0, 0],
                           [0, -0],
                           [0, 0],
                           [0, 0],
                           [0, 0],
                           [0, 0],
                           [0, 0],
                           [0, 0],
                           [0, 0],
                           [-6.40312e-09, 1.35883e-08],
                           [-1.30956e-09, 1.31487e-08],
                           [-5.95957e-08, 1.88837e-07],
                           [-3.14161e-07, 2.18147e-08],
                           [-1.0857e-07, -2.75118e-07],
                           [3.90054e-07, 1.87374e-07],
                           [-7.00704e-07, 5.70641e-07],
                           [-4.03496e-07, -7.36036e-07],
                           [3.24801e-07, -8.71389e-08],
                           [8.35641e-08, 7.97482e-08],
                           [-1.5673e-07, 2.15609e-07]];

      for(let i = 0; i < sacout.length; i++) {
          if(sacout[i][0] == 0 || out[i] == 0) {
            expect(out[i]).toBeCloseTo(sacout[i][0]);
            //  assertEquals("real " + i + " " + out[i].real()+"  "+sacout[i][0],
            //               sacout[i][0],
            //               out[i].real() ,
            //               0.00001);
          } else {
            expect(sacout[i][0]/ out[i]).toBeCloseTo(1, 5);
              // assertEquals("real " + i + " " + out[i].real()+"  "+sacout[i][0], 1, sacout[i][0]
              //         / out[i].real(), 0.00001);
          }
        }
        for(let i = 1; i < sacout.length; i++) {
          if(sacout[i][1] == 0 || out[out.length-i] == 0) {
            expect(out[out.length-i]).toBeCloseTo(sacout[i][1]);
              // assertEquals("imag " + i + " " + out[i].imag()+"  "+sacout[i][1],
              //              sacout[i][1],
              //              out[i].imag() ,
              //              0.00001);
          } else {
            expect(sacout[i][1]/ out[out.length-i]).toBeCloseTo(1, 5);
              // assertEquals("imag " + i + " " + out[i].imag()+"  "+sacout[i][1],
              //              -1,
              //              sacout[i][1] / out[i].imag(),
              //              0.00001);
          }
      }
    });
});

/*
 r IU.HRV.__.BHE.SAC.0
 transfer from polezero subtype hrv.bhe.sacpz to none freqlimits 0.005 0.01 1e5 1e6
 */
test("HRV", () => {
  return Promise.all([readSac("./test/data/transfer.sac"),
                      readSac("./test/data/IU.HRV.__.BHE.SAC"),
                      readSacPoleZero("./test/data/hrv.bhe.sacpz")])
  .then ( result => {
      let sactfr = result[0];
      let orig = result[1];
      let pz = result[2];
      const origseis = new filter.model.Seismogram(orig.y, 1/orig.delta, moment.utc());
      let bagtfr = filter.transfer.transferSacPZ(origseis,
                                      pz,
                                      .005,
                                      0.01,
                                      1e5,
                                      1e6);
      const sacdata = sactfr.y;
      const bagdata = bagtfr.y();

      for(let i = 0; i < bagdata.length; i++) {
          if (bagdata[i] === 0) {
            expect(bagdata[i]).toBeCloseTo(sacdata[i], 3);
            //  assertEquals("data", sacdata[i] , bagdata[i], 0.0001);
          } else {
            expect(sacdata[i] / bagdata[i]).toBeCloseTo(1, 1);
            //  assertEquals("data", 1, sacdata[i] / bagdata[i], 0.0001);
          }
      }
  });

});

/*
 *
  r IU.HRV.__.BHE.SAC.0
  rmean
  w 1_rmean.sac
  taper type hanning width 0.05
  w 2_taper.sac
  transfer from polezero subtype hrv.bhe.sacpz to none freqlimits 0.005 0.01 1e5 1e6
  w 3_transfer.sac
*/
test("HRV Retest", () => {
  return Promise.all([readSac("./test/data/IU.HRV.__.BHE.SAC"),
                      readSacPoleZero("./test/data/hrv.bhe.sacpz"),
                      readSac("./test/data/1_rmean.sac"),
                      readSac("./test/data/2_taper.sac"),
                      readSac("./test/data/3_transfer.sac"),
                    ])
  .then ( result => {
      let orig = result[0];
      let pz = result[1];
      let rmean = result[2];
      let taper = result[3];
      let transfer = result[4];
      const origseis = new filter.model.Seismogram(orig.y, 1/orig.delta, moment.utc());
      const bag_rmean = filter.rMean(origseis);
      const rmean_data = bag_rmean.y();
      let sacdata = rmean.y;
      for(let i = 0; i < rmean_data.length; i++) {
          if (Math.abs(rmean_data[i]) < 1e-8) {
            expect(rmean_data[i]).toBeCloseTo(sacdata[i], 3);
            //  assertEquals("data", sacdata[i] , bagdata[i], 0.0001);
          } else {
            expect(sacdata[i] / rmean_data[i]).toBeCloseTo(1, 3);
            //  assertEquals("data", 1, sacdata[i] / bagdata[i], 0.0001);
          }
      }

      const bag_taper = filter.taper.taper(bag_rmean, 0.05, filter.taper.HANNING);
      const taper_data = bag_taper.y();
      sacdata = taper.y;

      for(let i = 0; i < taper_data.length; i++) {
          if (Math.abs(taper_data[i]) < 1e-8) {
            expect(taper_data[i]).toBeCloseTo(sacdata[i], 3);
            //  assertEquals("data", sacdata[i] , bagdata[i], 0.0001);
          } else {
            if (sacdata[i] / taper_data[i] < .9 || sacdata[i] / taper_data[i] > 1.1) {
              console.log(i+" "+sacdata[i]+"  "+taper_data[i]);
            }
            expect(sacdata[i] / taper_data[i]).toBeCloseTo(1, 2);
            //  assertEquals("data", 1, sacdata[i] / bagdata[i], 0.0001);
          }
      }

      let bagtfr = filter.transfer.transferSacPZ(bag_taper,
                                      pz,
                                      .005,
                                      0.01,
                                      1e5,
                                      1e6);
      const bagdata = bagtfr.y();
      sacdata = transfer.y;
      for(let i = 0; i < bagdata.length; i++) {
          if (Math.abs(bagdata[i]) < 1e-8) {
            expect(bagdata[i]).toBeCloseTo(sacdata[i], 3);
            //  assertEquals("data", sacdata[i] , bagdata[i], 0.0001);
          } else {
            if (sacdata[i] / bagdata[i] < .99 || sacdata[i] / bagdata[i] > 1.01) {
              console.log(i+" "+sacdata[i]+"  "+bagdata[i]);
            }
            expect(sacdata[i] / bagdata[i]).toBeCloseTo(1, 1);
            //  assertEquals("data", 1, sacdata[i] / bagdata[i], 0.0001);
          }
      }
  });

});



function notest(name, fun) {
  console.log("skipping "+name);
  return;
}
