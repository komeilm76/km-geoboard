# Checklist — Page 05-04 Import OpenLayers

- [x] `importOpenLayers.ts` created and exported
- [x] Returns `ImportResult<GeoJsonFeatureCollection>`
- [x] Strips `crs` field from root of input object
- [x] Non-EPSG:4326 crs emits `ImportWarning`
- [x] EPSG:4326 crs emits no warning
- [x] Standard GeoJSON (no crs) passes through cleanly
- [x] Delegates to `importGeoJson` for core validation
- [x] Merges crs warnings with GeoJSON import warnings
- [x] Tests: no crs, crs = EPSG:4326, crs = EPSG:3857, invalid GeoJSON
- [x] All tests pass, build clean
