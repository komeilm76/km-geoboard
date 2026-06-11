# Checklist — Page 05-03 Import SVG

- [ ] `importSvg.ts` created and exported
- [ ] Returns `ImportResult<SvgDocument>`
- [ ] Empty string → `"empty-input"` error
- [ ] Malformed XML → `"invalid-xml"` error
- [ ] Unsupported elements produce `ImportWarning`, not errors
- [ ] `warnings` always present (empty `[]` when no warnings)
- [ ] Tests: valid SVG, SVG with unsupported element, empty, malformed
- [ ] All tests pass, build clean
