import * as filter from '../src/index';
import {readSac, readSacPoleZero} from './sacfile';


test("Round Trip FFT, Spike", () => {
  const data = Array(128).fill(0);
  data[1] = 1/100;
  const fft = filter.calcDFT(data, data.length);
  const out = filter.inverseDFT(fft, data.length);
  for(let i=0; i<out.length; i++) {
    //console.log(i+" "+out[i]+"  raw: "+data[i]);
    if (data[i] === 0) {
      expect(out[i]).toBeCloseTo(data[i], 3);
    } else {
      expect(out[i]/data[i]).toBeCloseTo(1, 5);
    }
  }
});


test("Round Trip FFT HRV", () => {
  return readSac("./test/data/IU.HRV.__.BHE.SAC")
  .then(data => {

    const fft = filter.calcDFT(data.y, data.y.length);
    const out = filter.inverseDFT(fft, data.y.length);
    for(let i=0; i<out.length; i++) {
      //if (i > 9644) {console.log(i+" "+out[i]+"  sac: "+data.y[i]);}
      if (data.y[i] === 0) {
        expect(out[i]).toBeCloseTo(data.y[i], 3);
      } else {
        expect(out[i]/data.y[i]).toBeCloseTo(1, 3);
      }
    }
  })
});
