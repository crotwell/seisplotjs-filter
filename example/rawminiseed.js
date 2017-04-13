
// this comes from the seisplotjs miniseed bundle
var ds = seisplotjs_fdsndataselect;
var miniseed = ds.miniseed;
var OregonDSP = seisplotjs_filter.OregonDSP

//seisplotjs_filter.tryDFT()
//tryDFT();
var doRunQuery = false;
//var doRunQuery = true;

// this comes from the seisplotjs waveformplot bundle
//var wp = seisplotjs_waveformplot

//  .host('service.scedc.caltech.edu')
var dsQuery = new ds.DataSelectQuery()
  .nodata(404)
  .networkCode('CO')
  .stationCode('JSC')
  .locationCode('00')
  .channelCode('HHZ')
  .startTime(new Date(Date.parse('2017-03-01T20:15:04Z')))
  .endTime(new Date(Date.parse('2017-03-01T20:16:14Z')));

var div = d3.select('div.miniseed');
var divP = div.append('p');
divP.text("URL: ");
var url = dsQuery.formURL();
divP.append("a")
    .attr("href", url)
    .text(url);

function processMiniseed(records) {
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
      let butterworth = seisplotjs_filter.createButterworth(
                                 4, // poles
                                 seisplotjs_filter.LOW_PASS,
                                 0, // low corner
                                 1, // high corner
                                 
                                 1/seismogram.sampleRate() // delta (period)
                        );
      butterworth.filterInPlace(seismogram.y());
      let fftOut = seisplotjs_filter.doDFT(seismogram.y(), seismogram.numPoints(), seismogram.sampleRate() );
      for (let i=0; i<10; i++) {
        console.log("seis dft "+i+" "+fftOut[i]);
      }

      simpleLogPlot(fftOut, "div.fftplot", seismogram.sampleRate())

}

if (doRunQuery) {
  dsQuery.query().then(processMiniseed).catch( function(error) {
    d3.select("div.miniseed").append('p').html("Error loading data." +error);
    console.assert(false, error);
  });
} else {
  d3.request("fdsnws-dataselect_2017-04-12T13_42_59Z.mseed")
    .responseType("arraybuffer")
    .get(function(error, rawBuffer) {
if(error) console.log("error: "+error);
console.log("rawBuffer size: "+rawBuffer.response.length);
      var records = miniseed.parseDataRecords(rawBuffer.response);
console.log("got "+records.length+" records");
      processMiniseed(records);
    });
}

function simpleLogPlot(fft, cssSelector, sps) {
console.log("in simpleLogPlot "+fft.length +" "+sps);

    var T = 1/sps;
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
  fftAmp = fftAmp.slice(1);

    var svg = d3.select(cssSelector).select("svg");

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLog()
    .rangeRound([0, width]);

var y = d3.scaleLog()
    .rangeRound([height, 0]);

var line = d3.line()
    .x(function(d, i) { return x((i+1)*T); })
    .y(function(d, i) { return y(d); });

  x.domain([T, fftAmp.length*T]);
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
    .append("text")
      .attr("fill", "#000")
      .attr("y", 0)
      .attr("x", width/2)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Hertz");

//    .select(".domain")
//      .remove();

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
