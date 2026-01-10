# Zen Website Project Structure

## Project Overview
This is an interactive Zen meditation website featuring the story "Enter Zen From There" with various meditation features and interactive elements.

## Project Structure

### HTML Files (Root Directory)
- `index.html` - Main website file with full features
- `zen-story-backup.html` - Backup version of the website

### Assets Directory Structure
```
assets/
├── images/          # All image assets
│   ├── mountain-path.jpg  - Nature background for normal mode
│   ├── cosmic.jpg         - Space background for cosmic meditation mode
│   ├── meditation.png     - Main logo/icon
│   └── Future.JPEG        - Logo for cosmic mode
├── audio/           # All audio assets
│   ├── OM.mp3      - OM meditation sound
│   └── KTN.mp3     - Cosmic meditation sound
└── js/              # JavaScript libraries
    ├── modernizr-2.6.2.min.js  - Browser feature detection
    └── respond.min.js          - IE9 support
```

### Documentation
- `README.md` - Main project documentation
- `PROJECT_STRUCTURE.md` - This file
- `docs/` - Comprehensive project documentation
    - Architecture and design decisions
    - Development guide
    - Feature documentation

## Files to Remove (Not Part of Zen Website)

### Unrelated Images in images/ folder:
- `about.jpg`
- `addigy.png`
- `AI_Left.jpg`
- `AI_right.jpg`
- `cyber_def.png`
- `linux.png`  
- `portal.png`
- `presec.png`
- `purple team.png`
- `SOC_Core_Skills.png`
- `THM-07TDRGKZIH.png`
- `udemynetplus.jpg`
- `whitehat.jpg`
- `img_bg_1.jpg`
- `img_bg_2.jpg`

### Duplicate Images (already in root):
- `images/cosmic.jpg`
- `images/Future.JPEG`
- `images/meditation.png`
- `images/mountain-path.jpg`

### Configuration Files:
- `prepros-6.config` - From another project

### Potentially Unused Framework Files:
The following directories contain Bootstrap and other framework files that don't appear to be used in the Zen website (which has all styles inline):
- `css/` directory (Bootstrap, Flexslider, Owl Carousel, etc.)
- `fonts/` directory (Bootstrap and icon fonts)
- `sass/` directory (SCSS source files)
- Most files in `js/` directory except modernizr and respond

## Features of the Zen Website

1. **Main Story**: "Enter Zen From There" with interactive tooltips
2. **Dark/Light Mode Toggle**
3. **Sound Features**: Stream sounds, OM meditation, cosmic meditation
4. **Breathing Guide Animation**
5. **Cosmic Meditation Mode** with space background
6. **Interactive Zen Garden** with sand raking and stones
7. **Falling Leaves Animation**
8. **Meditation Timer**
9. **Parallax Background Effect**
10. **Water Ripple Effects**
11. **Fireflies in Dark Mode**
12. **Hidden Messages and Quotes**

## Cleanup Progress
✅ Moved all unrelated images to `to_remove/images/`
✅ Moved `prepros-6.config` to `to_remove/`
✅ Emptied the `images/` folder (all images are referenced from root)

## Next Steps
1. ✅ Remove unrelated files listed above
2. Organize remaining files properly
3. Consider removing unused CSS/SASS/Fonts folders
4. Add a proper README.md for the project
5. Manually delete the `to_remove/` folder after confirming all moves are correct
