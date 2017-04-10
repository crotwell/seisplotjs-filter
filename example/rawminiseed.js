
// this comes from the seisplotjs miniseed bundle
var ds = seisplotjs_fdsndataselect;
var miniseed = ds.miniseed;
var OregonDSP = seisplotjs_filter.OregonDSP

//seisplotjs_filter.tryDFT()
//tryDFT();
//var doRunQuery = false;
var doRunQuery = true;

function tryDFT() {
  let npts = 16;
  let signal = [];
  for (let i=0; i<npts; i++) {
    //signal[i] = Math.random();
    signal[i] = 0;
  }
  signal[0] = -1;
  var fftOut = doDFT(signal, signal.length);
      simpleLogPlot(fftOut, "div.fftplot")
  for (let i=0; i<npts; i++) {
    console.log(i+" "+fftOut[i]);
  }
};
function doDFT(waveform, npts, sps) {
  let log2N = 4;
  let N = 16;
  while(N < npts) { log2N += 1; N = 2 * N;}
  let dft = new OregonDSP.com.oregondsp.signalProcessing.fft.RDFT(log2N);
  let out = Array(N).fill(0)
  dft.evaluate_7u45pk$(waveform, out);
  for (let i=0; i<10; i++) {
    console.log("dft "+i+" "+out[i]);
  }
  return out;
}

// this comes from the seisplotjs waveformplot bundle
//var wp = seisplotjs_waveformplot

//  .host('service.scedc.caltech.edu')
var dsQuery = new ds.DataSelectQuery()
  .nodata(404)
  .networkCode('CO')
  .stationCode('JSC')
  .locationCode('00')
  .channelCode('HHZ')
  .startTime(new Date(Date.parse('2017-03-01T20:17:04Z')))
  .endTime(new Date(Date.parse('2017-03-01T20:17:14Z')));

var div = d3.select('div.miniseed');
var divP = div.append('p');
divP.text("URL: ");
var url = dsQuery.formURL();
divP.append("a")
    .attr("href", url)
    .text(url);

if (doRunQuery) dsQuery.query().then(function(records) {
var table = d3.select("div.miniseed")
        .select("table");
      if ( table.empty()) {
        table = d3.select("div.miniseed")
          .append("table");
        var th = table.append("thead").append("tr");
        th.append("th").text("Seq");
        th.append("th").text("Net");
        th.append("th").text("Sta");
        th.append("th").text("Loc");
        th.append("th").text("Chan");
        th.append("th").text("Start");
        th.append("th").text("End");
        th.append("th").text("NumSamp");
        th.append("th").text("Sps");
        table.append("tbody");
      }
      var tableData = table.select("tbody")
        .selectAll("tr")
        .data(records, function(d) { return d.codes()+d.header.start;});
      tableData.exit().remove();
      var tr = tableData.enter().append('tr');
      tr.append("td")
        .text(function(d) {
          return d.header.seq;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.netCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.staCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.locCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.chanCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.start.toISOString();
        });
      tr.append("td")
        .text(function(d) {
          return d.header.end.toISOString();
        });
      tr.append("td")
        .text(function(d) {
          return d.header.numSamples;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.sampleRate;
        });

      let seismogram = miniseed.merge(records)[0];
console.log("seismogram: "+seismogram+" "+seismogram.y().slice(0,10)+" npts:"+seismogram.numPoints()+" sps: "+seismogram.sampleRate());
//      seismogram = seisplotjs_filter.rMean(seismogram);
      let fftOut = seisplotjs_filter.doDFT(seismogram.y(), seismogram.numPoints(), seismogram.sampleRate() );
      for (let i=0; i<10; i++) {
        console.log("seis dft "+i+" "+fftOut[i]);
      }

      simpleLogPlot(fftOut, "div.fftplot")

}).catch( function(error) {
  d3.select("div.miniseed").append('p').html("Error loading data." +error);
  console.assert(false, error);
});

function simpleLogPlot(fft, cssSelector) {
console.log("in simpleLogPlot "+fft.length);

    var ampLength = fft.length/2 +1;
    var fftReal = fft.slice(0, ampLength);
    var fftImag = new Array(ampLength);
    fftImag[0] = 0;
    fftImag[fftImag.length-1] = 0;
    for (let i=1; i< fft.length/2; i++) {
      fftImag[i] = fft[fft.length - i];
    }
    var fftAmp = new Array(fftReal.length);
    for (let i=0; i< fftReal.length; i++) {
      fftAmp[i] = Math.hypot(fftReal[i], fftImag[i]);
    }

    console.log(" Amp length"+fftAmp.length);
  for (let i=0; i<9 && i<fftAmp.length; i++) {
    console.log(i+" Amp "+fftAmp[i]+"  r="+fftReal[i]+" i="+fftImag[i]);
  }


    var svg = d3.select(cssSelector).select("svg");

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
    .rangeRound([0, width]);

var y = d3.scaleLog()
    .rangeRound([height, 0]);

var line = d3.line()
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });

  x.domain([0, fftAmp.length]);
//  x.domain(d3.extent(fftAmp, function(d, i) { return i; }));
  y.domain(d3.extent(fftAmp, function(d, i) { return d; }));
  if (y.domain()[0] === y.domain()[1]) {
    y.domain( [ y.domain()[0]/2, y.domain()[1]*2]);
  }
console.log("y domain: "+y.domain());
console.log("x domain: "+x.domain());

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .select(".domain")
      .remove();

  g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Amp");

  g.append("path")
      .datum(fftAmp)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  
}
