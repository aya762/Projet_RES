// ============================================================
// ARKANSAS 
// ============================================================

var YEAR = 2021;

var cdl = ee.ImageCollection('USDA/NASS/CDL')
  .filter(ee.Filter.calendarRange(YEAR, YEAR, 'year'))
  .first()
  .select('cropland');

// Keep only cropland
var cropland = cdl.updateMask(cdl.gt(0));

var ark_region = ee.Geometry.Rectangle([-94.6, 33.0, -89.6, 36.5]);

// Target classes
var ark_classes = [5, 3, 1, 2];  // Soy, Rice, Corn, Cotton

// Build ONE image with Others = 999
var ark_image = cropland.remap(
  ark_classes,
  ark_classes,
  999
).rename('class');

// Desired exact counts (sum = 10000)
var values = [5, 3, 1, 2, 999];
var counts = [4677, 2423, 1522, 762, 616];

var ark_all = ark_image.stratifiedSample({
  numPoints: 0,
  classBand: 'class',
  classValues: values,
  classPoints: counts,
  region: ark_region,
  scale: 30,
  geometries: true
});

print('Arkansas FINAL distribution:',
      ark_all.aggregate_histogram('class'));
print('Arkansas TOTAL:', ark_all.size());

Export.table.toAsset({
  collection: ark_all,
  description: 'ARKANSAS_10000_POINTS',
  assetId: 'ARKANSAS_10000_POINTS'
});