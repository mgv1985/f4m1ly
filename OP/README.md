# Adding images to OP

1. Upload or copy the new `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif` file into this `OP` folder.
2. Open `images.js`.
3. Add a line before the closing `];`:

```js
{ file: "your-image.jpg", title: "Optional title" },
```

The `title` is optional. If it is omitted, the gallery assigns a simple plate number. Images keep their natural proportions and are loaded lazily.

For faster loading, use JPG or WebP files and keep each image below roughly 2 MB when practical.