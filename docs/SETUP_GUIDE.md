# Zen Website Setup Guide

## Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A text editor (VS Code, Sublime Text, etc.)
- Git (for version control)
- Python or Node.js (optional, for local server)

### Basic Setup
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd Zen
   ```

2. Open `index.html` in your browser:
   - Simply double-click the file, or
   - Right-click and select "Open with" → Your browser

3. That's it! The website should be fully functional.

## Development Environment

### Setting Up a Local Server
While the site works by opening the HTML file directly, using a local server provides a better development experience.

#### Option 1: Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then visit: http://localhost:8000

#### Option 2: Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

#### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Conda Environment Setup (Optional)
For a more robust development environment with additional tools:

```bash
# Create environment
conda create -n zen-dev python=3.9
conda activate zen-dev

# Install development tools
conda install -c conda-forge nodejs
pip install beautifulsoup4 html5lib  # For HTML validation
npm install -g html-minifier terser clean-css-cli  # For optimization
```

## Project Structure
```
Zen/
├── index.html              # Main website
├── zen-story-backup.html   # Backup version
├── assets/
│   ├── images/
│   │   ├── mountain-path.jpg
│   │   ├── cosmic.jpg
│   │   ├── meditation.png
│   │   └── Future.JPEG
│   ├── audio/
│   │   ├── OM.mp3
│   │   └── KTN.mp3
│   └── js/
│       ├── modernizr-2.6.2.min.js
│       └── respond.min.js
├── docs/
│   ├── DEVELOPMENT_TRACKER.md
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   └── SETUP_GUIDE.md
├── README.md
└── PROJECT_STRUCTURE.md
```

## Making Changes

### Editing the Story
1. Open `index.html` in your text editor
2. Find the story content between `<div class="content">` tags
3. Edit the paragraphs as needed
4. Save and refresh your browser

### Adding New Features
1. JavaScript code starts at line ~1370
2. Add new functions following the existing pattern
3. Create control buttons in the `.controls` div
4. Test thoroughly in multiple browsers

### Modifying Styles
1. All styles are in the `<style>` tag in the `<head>`
2. Follow the existing naming conventions
3. Test responsive design at different screen sizes
4. Ensure dark mode compatibility

### Adding Audio Files
1. Place new audio files in `assets/audio/`
2. Add `<audio>` elements before the closing `</body>` tag
3. Initialize in JavaScript with appropriate controls
4. Handle autoplay restrictions gracefully

## Testing

### Browser Testing Checklist
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Feature Testing
- [ ] All control buttons work
- [ ] Sounds play correctly
- [ ] Animations are smooth
- [ ] Zen garden interactions work
- [ ] Timer functions properly
- [ ] Dark/light mode transitions
- [ ] Responsive design at all sizes

### Performance Testing
1. Open browser DevTools
2. Run Lighthouse audit
3. Check for:
   - Page load time < 3 seconds
   - First Contentful Paint < 1.5 seconds
   - No memory leaks in animations
   - Smooth 60fps animations

## Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Site will be available at `https://[username].github.io/Zen/`

### Netlify
1. Connect GitHub repository
2. Build command: (none needed)
3. Publish directory: `/`
4. Deploy automatically on push

### Traditional Hosting
1. Upload all files via FTP/SFTP
2. Ensure `.htaccess` allows audio files (if Apache)
3. Set appropriate MIME types for audio files
4. No server-side configuration needed

## Troubleshooting

### Audio Won't Play
- Check browser console for errors
- Ensure audio files exist in correct location
- Try user interaction before playing
- Check browser autoplay policies

### Images Not Loading
- Verify file paths are correct
- Check file names (case sensitive on Linux)
- Ensure images are in `assets/images/`
- Clear browser cache

### Animations Stuttering
- Reduce number of active animations
- Check CPU usage
- Disable parallax effect
- Use Chrome DevTools Performance tab

### Zen Garden Not Working
- Check JavaScript console for errors
- Ensure all event listeners are attached
- Verify sand patterns are rendering
- Test in different browsers

## Optimization Tips

### Image Optimization
```bash
# Optimize JPEGs
jpegoptim --size=200k assets/images/*.jpg

# Or use imagemagick
convert input.jpg -quality 85 -strip output.jpg
```

### Code Minification
```bash
# Minify HTML
html-minifier index.html -o index.min.html --collapse-whitespace

# Minify inline CSS (extract first)
# Minify inline JavaScript (extract first)
```

### Performance Improvements
1. Enable gzip compression on server
2. Add cache headers for static assets
3. Consider CDN for images
4. Implement service worker for offline

## Contributing

### Code Style
- Use 4 spaces for indentation
- Follow existing naming conventions
- Comment complex functionality
- Test before committing

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-meditation-mode

# Make changes and commit
git add .
git commit -m "Add new meditation mode"

# Push branch
git push origin feature/new-meditation-mode

# Create pull request on GitHub
```

### Documentation
- Update relevant docs when adding features
- Include examples in documentation
- Keep README.md current
- Document any breaking changes

## Resources

### Learning Materials
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

### Meditation & Zen
- [Zen Stories](http://www.ashidakim.com/zenkoans/zenindex.html)
- [Meditation Timer Bell Sounds](https://freesound.org/)
- [Nature Sounds](https://www.zapsplat.com/)

### Tools
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance
- [WAVE](https://wave.webaim.org/) - Accessibility

## Support

For issues or questions:
1. Check existing documentation
2. Look for similar issues on GitHub
3. Create a new issue with details
4. Include browser and OS information

Happy coding and may your development be as peaceful as the Zen garden! 🧘‍♂️
