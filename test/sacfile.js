import * as filter from '../src/index';
import fs from 'fs';

const NVHDR_OFFSET = 76 * 4;
const NPTS_OFFSET = 79 * 4;
const DATA_OFFSET = 632;

export function readSac(filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, function (err, data) {
      if (err) reject(err);
      else resolve(data.buffer);
    });
  }).then(data => {
    let out = {};

    let dv = new DataView(data);
    let littleEndian = false;
    let sacVer = dv.getUint32(NVHDR_OFFSET, true);
    if (sacVer === 6) {
      littleEndian = true;
    }
    out.delta = dv.getFloat32(0, littleEndian);
    out.npts = dv.getUint32(NPTS_OFFSET, littleEndian);
    let y = [];
    let j=0;
    for(let i=DATA_OFFSET; i < dv.byteLength; i+=4, j++) {
      y[j] = dv.getFloat32(i, littleEndian);
    }
    out.y = y;
    return out;
  })
}

export function readSacPoleZero(filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, "utf8", function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  }).then(data => {
    let pz = {
      zeros: [],
      poles: [],
      constant: 1
    };
    let lines = data.split('\n');
    let numZeros = 0;
    let numPoles = 0;
    let i=0;
    while (i < lines.length) {
      let l = lines[i];
      let items = l.trim().split(/ +/);
      if (items[0] === 'ZEROS') {
        numZeros = parseInt(items[1]);
        i++;
        l = lines[i];
        items = l.trim().split(/ +/);
        while (i < lines.length && pz.zeros.length < numZeros) {
          if (items[0] === 'POLES') {
            // no more zeros, fill array with 0
            for(let z = pz.zeros.length; z < numZeros; z++) {
              pz.zeros.push(filter.model.createComplex(0,0));
            }
            break;
          } else {
            let real = parseFloat(items[0]);
            let imag = parseFloat(items[1]);
            pz.zeros.push(filter.model.createComplex(real, imag));
          }
          i++;
          l = lines[i];
          items = l.trim().split(/ +/);
        }
      }
      if (items[0] === 'POLES') {
        numPoles = parseInt(items[1]);
        i++;
        l = lines[i];
        items = l.trim().split(/ +/);
        while (i < lines.length && pz.poles.length < numPoles) {
          if (items[0] === 'CONSTANT') {
            // no more poles, fill array with 0
            for(let z = pz.poles.length; z < numPoles; z++) {
              pz.poles.push(filter.model.createComplex(0,0));
            }
            break;
          } else {
            let real = parseFloat(items[0]);
            let imag = parseFloat(items[1]);
            pz.poles.push(filter.model.createComplex(real, imag));
          }
          i++;
          l = lines[i];
          items = l.trim().split(/ +/);
        }
      }
      if (items[0] === 'CONSTANT') {
        pz.constant = parseFloat(items[1]);
      }
      i++;
    }
    return pz;
  });
}
