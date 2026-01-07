# PWA Icons Directory

This directory contains the Progressive Web App (PWA) icons for Kontrollitud.ee.

## Required Icon Sizes

Generate the following icons from your logo:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png (minimum for Android)
- icon-384x384.png
- icon-512x512.png (recommended for splash screens)

## How to Generate Icons

### Option 1: Online Tools (Easiest)

1. **PWA Builder Image Generator**
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload your logo
   - Download all sizes

2. **Real Favicon Generator**
   - Visit: https://realfavicongenerator.net/
   - Upload your logo
   - Generate all icons

3. **Favicon.io**
   - Visit: https://favicon.io/
   - Convert PNG to icons

### Option 2: Using ImageMagick (Command Line)

```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: apt-get install imagemagick

# Then run:
magick convert ../src/assets/logokontroll.jpg -resize 72x72 icon-72x72.png
magick convert ../src/assets/logokontroll.jpg -resize 96x96 icon-96x96.png
magick convert ../src/assets/logokontroll.jpg -resize 128x128 icon-128x128.png
magick convert ../src/assets/logokontroll.jpg -resize 144x144 icon-144x144.png
magick convert ../src/assets/logokontroll.jpg -resize 152x152 icon-152x152.png
magick convert ../src/assets/logokontroll.jpg -resize 192x192 icon-192x192.png
magick convert ../src/assets/logokontroll.jpg -resize 384x384 icon-384x384.png
magick convert ../src/assets/logokontroll.jpg -resize 512x512 icon-512x512.png
```

### Option 3: Photoshop/GIMP

1. Open your logo
2. Resize to each required size
3. Export as PNG with transparency (if needed)
4. Save as icon-{size}x{size}.png

## Best Practices

1. **Square Format**: Icons should be square (1:1 aspect ratio)
2. **Transparency**: Use transparent background for better flexibility
3. **Padding**: Add 10-15% padding around your logo
4. **Simple Design**: Avoid too much detail for smaller sizes
5. **Test**: Preview icons on different devices

## Current Status

Once you generate the icons, place them in this directory.
The PWA will automatically use them for:
- Home screen shortcuts
- Splash screens
- Browser tabs
- Task switchers
