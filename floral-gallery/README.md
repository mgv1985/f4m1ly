# Floral Gallery

The whole collection lives on one page. Flower and colour filters are derived automatically from each filename.

To add more photographs:

1. Copy the image files into `floral-gallery/images`.
2. Name each one with the flower family first and the colour somewhere in the filename, for example `Hydrangea White Variety Name.webp`.
3. Run `powershell -ExecutionPolicy Bypass -File floral-gallery/build-manifest.ps1` from the repository root.

The first filename word determines the flower family. `Ecuador`, `Oriental`, `Spray`, and the corrected spelling of `Gypsophilla` receive friendlier display names in `gallery.js`. Recognised colour words are also maintained there.

`header.webp` is the gallery banner and is deliberately excluded from the photo manifest.
