# Checklist — Page 05-03 Import SVG

- [x] `importSvg.ts` created and exported
- [x] Returns `ImportResult<SvgDocument>`
- [x] Empty string → `"empty-input"` error
- [x] Malformed XML → `"invalid-xml"` error
- [x] Unsupported elements produce `ImportWarning`, not errors
- [x] `warnings` always present (empty `[]` when no warnings)
- [x] Tests: valid SVG, SVG with unsupported element, empty, malformed
- [x] All tests pass, build clean
