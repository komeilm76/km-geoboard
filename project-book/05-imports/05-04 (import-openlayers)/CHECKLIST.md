# Checklist — Page 05-04 Import OpenLayers

- [ ] `importOpenLayers.ts` created and exported
- [ ] Returns `ImportResult<GeoJsonFeatureCollection>`
- [ ] Strips `crs` field from root of input object
- [ ] Non-EPSG:4326 crs emits `ImportWarning`
- [ ] EPSG:4326 crs emits no warning
- [ ] Standard GeoJSON (no crs) passes through cleanly
- [ ] Delegates to `importGeoJson` for core validation
- [ ] Merges crs warnings with GeoJSON import warnings
- [ ] Tests: no crs, crs = EPSG:4326, crs = EPSG:3857, invalid GeoJSON
- [ ] All tests pass, build clean
