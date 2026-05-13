// ============================================================
// CALIFORNIA — CLIMATE COVARIATES
// ============================================================

var cal = ee.FeatureCollection(
  'projects/mon-projet-gee-2025/assets/CALIFORNIA_10000_POINTS'
);

var era5 = ee.ImageCollection('ECMWF/ERA5_LAND/MONTHLY_AGGR')
  .filter(ee.Filter.date('2021-01-01', '2021-12-31'));

var temp_mean = era5
  .select('temperature_2m')
  .mean()
  .subtract(273.15)
  .rename('temp_mean_c');

var precip_total = era5
  .select('total_precipitation_sum')
  .sum()
  .multiply(1000)
  .rename('precip_mm');

var dewpoint_mean = era5
  .select('dewpoint_temperature_2m')
  .mean()
  .subtract(273.15)
  .rename('dewpoint_c');

var climate_img = temp_mean
  .addBands(precip_total)
  .addBands(dewpoint_mean);

print('Bandes finales:', climate_img.bandNames());

var sampled = climate_img.sampleRegions({
  collection: cal,
  scale: 11132,
  properties: ['system:index', 'class'],
  geometries: false
});

print('California Climate size:', sampled.size());

Export.table.toDrive({
  collection: sampled,
  description: 'CALIFORNIA_CLIMATE_COVARIATES',
  fileFormat: 'CSV'
});