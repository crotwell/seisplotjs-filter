import * as filter from '../src/index';
import {readSac, readSacPoleZero} from './sacfile';

/*
 r IU.HRV.__.BHE.SAC.0
 rmean
 w 1_rmean.sac
 taper type hanning width 0.05
 w 2_taper.sac
 transfer from polezero subtype hrv.bhe.sacpz to none freqlimits 0.005 0.01 1e5 1e6
 w 3_transfer.sac
 */
test("HRV taper", () => {
  return Promise.all([readSac("./test/data/2_taper.sac"),
                      readSac("./test/data/IU.HRV.__.BHE.SAC")])
  .then ( result => {
      let sactaper = result[0];
      let orig = result[1];
      const origseis = new filter.model.Seismogram(orig.y, 1/orig.delta, moment.utc());
      let bagtaper = filter.taper.taper(filter.rMean(origseis));
      const sacdata = sactaper.y;
      const bagdata = bagtaper.y();
      for(let i = 0; i < bagdata.length && i < 20; i++) {
          if (bagdata[i] === 0) {
            expect(bagdata[i]).toBeCloseTo(sacdata[i], 3);
            //  assertEquals("data", sacdata[i] , bagdata[i], 0.0001);
          } else {
            expect(sacdata[i] / bagdata[i]).toBeCloseTo(1, 2);
            //  assertEquals("data", 1, sacdata[i] / bagdata[i], 0.0001);
          }
      }
  });

});
