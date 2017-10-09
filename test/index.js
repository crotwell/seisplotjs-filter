

QUnit.test("simple rotation", function (assert) {
  let a = [ 1, 1, 0];
  let b = [ 1, 0, 1];
  let az = 0;
  let rotToAz = 90;
  let now = new Date();
  let seisA = new model.Seismogram(a, 1.0, now);
  seisA.netCode("XX").staCode("AAA").locCode("00").chanCode("BHE");
  let seisB = new model.Seismogram(b, 1.0, now);
  seisA.netCode("XX").staCode("AAA").locCode("00").chanCode("BHN");
  let out = rotate(seisA, az, seisB, az+90, 90);
  assert.equal(out.radial.y().length, 3, "out.x length");
  assert.equal(out.transverse.y().length, 3, "out.y length");
  assert.equal(out.azimuthRadial, rotToAz, "out.x length");
  assert.equal(out.azimuthTransverse, rotToAz+90, "out.y length");
  floatEquals(out.radial._y[0], 1, 1e-9, "rot 90 x 0");
  floatEquals(out.radial.yAtIndex(0), 1, 1e-9, "rot 90 x 0");
  floatEquals(out.radial.yAtIndex(1), 1, 1e-9, "rot 90 x 1");
  floatEquals(out.radial.yAtIndex(2), 0, 1e-9, "rot 90 x 2");
  floatEquals(out.transverse.yAtIndex(0), -1, 1e-9, "rot 90 y 0");
  floatEquals(out.transverse.yAtIndex(1), 0, 1e-9, "rot 90 y 1");
  floatEquals(out.transverse.yAtIndex(2), -1, 1e-9, "rot 90 y 2");
  assert.equal(out.radial.chanCode(), "BHR", "x->r chan code");
  assert.equal(out.transverse.chanCode(), "BHT", "y->r chan code");
});

function floatEquals(valA, valB, error, message) {
  assert.ok(Math.abs(valA - valB) < error, message+" actual="+valA+" expected="+valB);
}
