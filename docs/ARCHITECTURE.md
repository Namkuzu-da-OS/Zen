# Zen Website Architecture

## Overview
The Zen Website is a single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. It provides an immersive meditation experience through interactive storytelling and various mindfulness features.

## Technical Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Libraries**: 
  - Modernizr 2.6.2 (browser feature detection)
  - Respond.js (IE9 media query support)
- **External Resources**: 
  - Audio files from SoundBible (stream sounds, bell sounds)
  - Custom audio files (OM.mp3, KTN.mp3)
- **No Framework Dependencies**: Intentionally built without frameworks for simplicity and performance

## Architecture Principles

### 1. **Progressive Enhancement**
- Core content (Zen story) is accessible without JavaScript
- Interactive features enhance the experience but aren't required
- Graceful degradation for older browsers

### 2. **Performance First**
- Inline CSS to reduce HTTP requests
- Preloading of critical images
- Lazy loading approach for features
- Minimal external dependencies

### 3. **Immersive Design**
- Full-screen experience with no scrolling
- Smooth transitions between states
- Ambient sound design
- Visual effects that don't distract from content

## Component Structure

### Core Components

#### 1. **Story Container**
- Central content area with the Zen story
- Responsive design with max-width constraint
- Semi-transparent background for readability
- Smooth transitions for mode changes

#### 2. **Control Panel**
- Fixed position control buttons
- Circular design for minimal visual footprint
- Tooltip hints for functionality
- State management for each feature

#### 3. **Interactive Features**
- **Breathing Guide**: Animated circle with synchronized OM sound
- **Cosmic Mode**: Complete theme transformation with space imagery
- **Zen Garden**: Miniature interactive sandbox with physics
- **Meditation Timer**: Customizable timer with bell sounds
- **Environmental Effects**: Leaves, fireflies, ripples

### State Management
- Uses vanilla JavaScript for state tracking
- Each feature has its own state variable
- LocalStorage not used (by design for privacy)
- All state is session-based

## Design Patterns

### 1. **Module Pattern**
Each feature is encapsulated in its own scope:
```javascript
// Example: Zen Garden module
let zenGardenActive = false;
let stones = [];
let lines = [];

function initZenGarden() {
    // Initialize garden components
}

function clearZenLines() {
    // Clean up lines
}
```

### 2. **Event Delegation**
- Document-level event listeners for global effects
- Component-specific listeners for localized interaction
- Efficient event handling for dynamically created elements

### 3. **Factory Pattern**
Used for creating similar elements:
```javascript
function createLeaf() {
    // Create and return configured leaf element
}

function createFirefly() {
    // Create and return configured firefly element
}
```

## CSS Architecture

### 1. **Inline Styles**
- All styles are inline for simplicity
- Reduces HTTP requests
- Easy to maintain for single-page application

### 2. **CSS Classes**
- Semantic naming convention
- State-based classes (`.dark-mode`, `.cosmic-mode`)
- Component-specific classes (`.zen-garden`, `.breathing-circle`)

### 3. **Animations**
- CSS keyframes for smooth animations
- Hardware-accelerated transforms
- Careful use of `will-change` for performance

## Audio Architecture

### 1. **Preloading Strategy**
- All audio elements have `preload="auto"`
- Critical sounds loaded at startup
- User interaction required for autoplay (browser policy)

### 2. **Sound Management**
- Individual volume controls
- Master sound toggle
- Graceful handling of playback failures

## Performance Optimizations

### 1. **Image Optimization**
- Preload critical images
- Use appropriate formats (JPEG for photos)
- Lazy loading for non-critical assets

### 2. **Animation Performance**
- Use CSS transforms instead of position changes
- Limit number of animated elements
- Remove elements after animation completion

### 3. **Memory Management**
- Clean up event listeners
- Remove DOM elements when not needed
- Limit particle effects to reasonable numbers

## Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Limited IE9+ support (with polyfills)

### Fallback Strategies
- Modernizr for feature detection
- Respond.js for media queries in IE9
- Graceful degradation for unsupported features

## Security Considerations

### 1. **No External Data**
- No API calls or external data fetching
- All content is static
- No user data collection

### 2. **Content Security**
- No inline JavaScript in HTML
- No eval() or dynamic code execution
- Safe DOM manipulation practices

### 3. **Privacy First**
- No tracking or analytics
- No cookies or local storage
- No third-party scripts

## Future Architecture Considerations

### 1. **Modularization**
- Consider splitting into ES6 modules
- Implement build process for bundling
- Add TypeScript for type safety

### 2. **Progressive Web App**
- Add service worker for offline support
- Implement app manifest
- Enable installation as standalone app

### 3. **Backend Integration**
- Could add meditation tracking
- User preferences sync
- Additional content management

## Development Best Practices

### 1. **Code Organization**
- Clear function naming
- Consistent indentation
- Comprehensive comments

### 2. **Testing Approach**
- Manual testing checklist
- Cross-browser testing
- Performance profiling

### 3. **Maintenance**
- Regular dependency updates
- Performance monitoring
- User feedback integration
