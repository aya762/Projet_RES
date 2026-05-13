// ============================================================
//  SENTINEL-2 EXTRACTION — 36 × 10 (LONG FORMAT)
// ============================================================
var YEAR  = 2021;
var START = ee.Date.fromYMD(YEAR, 1, 1);
var ark = ee.FeatureCollection('projects/mon-projet-gee-2025/assets/ARKANSAS_10000_POINTS');
var cal = ee.FeatureCollection('projects/mon-projet-gee-2025/assets/CALIFORNIA_10000_POINTS');

// ---------------- Cloud mask using SCL ----------------
function maskS2(img){
  var scl = img.select('SCL');
  var good = scl.eq(4)
      .or(scl.eq(5))
      .or(scl.eq(6))
      .or(scl.eq(7));
  return img.updateMask(good);
}

// ---------------- Keep the 10 paper bands ----------------
function prep(img){
  return img.select([
    'B2','B3','B4','B5','B6','B7','B8','B8A','B11','B12'
  ]);
}

// ---------------- Build 36 composites (10-day) ----------------
var steps = ee.List.sequence(0, 35);
var s2_10day = ee.ImageCollection(
  steps.map(function(i){
    i = ee.Number(i);
    var start = START.advance(i.multiply(10), 'day');
    var end   = start.advance(10, 'day');
    return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') // ← harmonized
      .filterDate(start, end)
      .map(maskS2)
      .map(prep)
      .median()
      .unmask(0)   
      .set('step', i);
  })
);

// ---------------- Sampling function ----------------
function sampleState(points, name){
  var sampled = s2_10day.map(function(img){
    var step = img.get('step');
    return img.sampleRegions({
      collection: points,
      scale: 10,
      geometries: true,
      properties: ['system:index','class']
    }).map(function(f){
      return f.set('step', step);
    });
  }).flatten();

  Export.table.toDrive({
    collection: sampled,
    description: name,
    fileFormat: 'CSV'
  });
}

// ---------------- Run for both states ----------------
sampleState(ark, 'ARKANSAS_S2_LONG_36x10_FIXED');
sampleState(cal, 'CALIFORNIA_S2_LONG_36x10_FIXED');