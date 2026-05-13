// ============================================================
// ARKANSAS — SOIL COVARIATES
// ============================================================

var ark = ee.FeatureCollection(
  'projects/mon-projet-gee-2025/assets/ARKANSAS_10000_POINTS'
);

var soil_ph = ee.Image('OpenLandMap/SOL/SOL_PH-H2O_USDA-4C1A2A_M/v02')
  .select('b0')
  .multiply(0.1)
  .rename('soil_ph');

var soil_oc = ee.Image('OpenLandMap/SOL/SOL_ORGANIC-CARBON_USDA-6A1C_M/v02')
  .select('b0')
  .multiply(0.1)
  .rename('soil_oc');

var soil_texture = ee.Image('OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02')
  .select('b0')
  .rename('soil_texture');

var soil_img = soil_ph
  .addBands(soil_oc)
  .addBands(soil_texture);

print('Bandes Sol:', soil_img.bandNames());

var sampled = soil_img.sampleRegions({
  collection: ark,
  scale: 250,
  properties: ['system:index', 'class'],
  geometries: false
});

print('Arkansas Soil size:', sampled.size());

Export.table.toDrive({
  collection: sampled,
  description: 'ARKANSAS_SOIL_COVARIATES',
  fileFormat: 'CSV'
});