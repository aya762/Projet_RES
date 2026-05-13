// ============================================================
// CALIFORNIA — TOPOGRAPHY COVARIATES
// ============================================================

var cal = ee.FeatureCollection(
  'projects/mon-projet-gee-2025/assets/CALIFORNIA_10000_POINTS'
);

var elevation = ee.Image('NOAA/NGDC/ETOPO1')
  .select('bedrock')
  .rename('elevation_m');

var landforms = ee.Image('CSP/ERGo/1_0/Global/ALOS_landforms')
  .select('constant')
  .rename('landform_class');

var topo_img = elevation
  .addBands(landforms);

print('Bandes Topo:', topo_img.bandNames());

var sampled = topo_img.sampleRegions({
  collection: cal,
  scale: 250,
  properties: ['system:index', 'class'],
  geometries: false
});

print('California Topo size:', sampled.size());

Export.table.toDrive({
  collection: sampled,
  description: 'CALIFORNIA_TOPO_COVARIATES',
  fileFormat: 'CSV'
});