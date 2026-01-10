# Zen Website Debug Log

## Debug Session Template
```
Date: YYYY-MM-DD
Time: HH:MM
Issue: Brief description
Environment: Browser/OS/Device
Steps to Reproduce:
1. Step one
2. Step two
Expected Result: What should happen
Actual Result: What actually happened
Resolution: How it was fixed (if applicable)
Time Spent: X hours/minutes
```

## Active Debugging Sessions

### Session 2025-05-25-001
**Date**: 2025-05-25  
**Time**: 14:30  
**Issue**: Verify asset paths after reorganization  
**Environment**: Chrome 125.0 / Windows 11  
**Status**: 🔄 In Progress  

**Checklist**:
- [ ] All images load correctly
  - [ ] mountain-path.jpg
  - [ ] cosmic.jpg
  - [ ] meditation.png
  - [ ] Future.JPEG
- [ ] All audio files play
  - [ ] OM.mp3
  - [ ] KTN.mp3
- [ ] JavaScript files load
  - [ ] modernizr-2.6.2.min.js
  - [ ] respond.min.js
- [ ] Console errors check
- [ ] Network tab verification

**Notes**: 
```
Need to verify paths in both index.html and zen-story-backup.html
```

---

## Browser Compatibility Testing

### Desktop Browsers
| Browser | Version | Status | Issues | Last Tested |
|---------|---------|--------|--------|-------------|
| Chrome | 125.0 | ❓ | TBD | - |
| Firefox | 126.0 | ❓ | TBD | - |
| Safari | 17.5 | ❓ | TBD | - |
| Edge | 125.0 | ❓ | TBD | - |

### Mobile Browsers
| Browser | Version | Device | Status | Issues | Last Tested |
|---------|---------|--------|--------|--------|-------------|
| Chrome Mobile | Latest | Android | ❓ | TBD | - |
| Safari Mobile | Latest | iOS | ❓ | TBD | - |
| Firefox Mobile | Latest | Android | ❓ | TBD | - |

## Feature-Specific Debug Logs

### 🌙 Dark Mode Toggle
**Last Tested**: -  
**Known Issues**: None yet  
**Test Scenarios**:
- [ ] Initial load respects system preference
- [ ] Toggle switches theme correctly
- [ ] Theme persists on page reload
- [ ] All elements styled correctly in both modes

### 🧘 Breathing Guide
**Last Tested**: -  
**Known Issues**: None yet  
**Test Scenarios**:
- [ ] Animation runs smoothly
- [ ] OM sound plays correctly
- [ ] Sync between visual and audio
- [ ] Proper cleanup when toggled off

### 🌌 Cosmic Meditation Mode
**Last Tested**: -  
**Known Issues**: None yet  
**Test Scenarios**:
- [ ] Background image loads
- [ ] Logo switches correctly
- [ ] KTN.mp3 plays
- [ ] All cosmic effects render
- [ ] Performance impact acceptable

### ☯️ Zen Garden
**Last Tested**: -  
**Known Issues**: None yet  
**Test Scenarios**:
- [ ] Sand raking works on all devices
- [ ] Stone dragging functions
- [ ] Koi fish animation smooth
- [ ] Day/night cycle works
- [ ] Cherry blossoms render
- [ ] Touch events work on mobile

### ⏱️ Meditation Timer
**Last Tested**: -  
**Known Issues**: None yet  
**Test Scenarios**:
- [ ] All timer durations work
- [ ] Bell sounds play at end
- [ ] Timer can be cancelled
- [ ] Display updates correctly
- [ ] No memory leaks

## Performance Debug Log

### Initial Load Performance
```
Date: TBD
Page Load Time: TBD
First Contentful Paint: TBD
Largest Contentful Paint: TBD
Time to Interactive: TBD
Total Blocking Time: TBD
```

### Resource Loading
| Resource | Size | Load Time | Status | Notes |
|----------|------|-----------|--------|-------|
| index.html | TBD | TBD | ❓ | - |
| mountain-path.jpg | TBD | TBD | ❓ | - |
| cosmic.jpg | TBD | TBD | ❓ | - |
| OM.mp3 | TBD | TBD | ❓ | - |
| KTN.mp3 | TBD | TBD | ❓ | - |

## Console Error Tracking

### JavaScript Errors
```
// Log any JS errors here with timestamps
```

### Network Errors
```
// Log any failed resource loads
```

### Warnings
```
// Log any console warnings
```

## Memory Leak Detection

### Suspected Memory Leaks
- [ ] Zen Garden animations
- [ ] Audio playback loops
- [ ] Particle effects (leaves, fireflies)
- [ ] Timer intervals

### Memory Profiling Results
```
Date: TBD
Initial Memory: TBD
After 5 minutes: TBD
After 15 minutes: TBD
After 30 minutes: TBD
```

## Debugging Tools & Commands

### Browser DevTools Commands
```javascript
// Check all images loaded
Array.from(document.images).forEach(img => {
    console.log(`${img.src}: ${img.complete ? 'Loaded' : 'Failed'}`);
});

// Check all audio elements
Array.from(document.querySelectorAll('audio')).forEach(audio => {
    console.log(`${audio.src}: ${audio.readyState}`);
});

// Monitor memory usage
console.log(`Memory used: ${performance.memory.usedJSHeapSize / 1048576} MB`);

// Check for event listeners
getEventListeners(document);
```

### Performance Monitoring
```javascript
// Measure function execution time
console.time('functionName');
// ... function execution
console.timeEnd('functionName');

// Monitor FPS
let lastTime = performance.now();
let frames = 0;
function checkFPS() {
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
        console.log(`FPS: ${frames}`);
        frames = 0;
        lastTime = currentTime;
    }
    requestAnimationFrame(checkFPS);
}
checkFPS();
```

## Debug Configuration

### Local Development Settings
```javascript
// Add to top of main script for debugging
const DEBUG = true;
const LOG_LEVEL = 'verbose'; // 'error', 'warn', 'info', 'verbose'

function debugLog(message, level = 'info') {
    if (!DEBUG) return;
    const logLevels = ['error', 'warn', 'info', 'verbose'];
    if (logLevels.indexOf(level) <= logLevels.indexOf(LOG_LEVEL)) {
        console[level === 'verbose' ? 'log' : level](`[${new Date().toISOString()}] ${message}`);
    }
}
```

## Resolved Issues Archive

### Session YYYY-MM-DD-XXX (Template)
**Date**: YYYY-MM-DD  
**Issue**: Description  
**Resolution**: How it was fixed  
**Time Spent**: X hours  
**Lessons Learned**: What we learned from this issue  

---

## Debug Checklist for New Features

When adding new features, complete this checklist:

- [ ] Console error check (all browsers)
- [ ] Memory leak test (30+ minute run)
- [ ] Performance impact measurement
- [ ] Mobile device testing
- [ ] Accessibility testing
- [ ] Cross-browser compatibility
- [ ] Error handling implementation
- [ ] Cleanup functions for toggles
- [ ] Event listener management
- [ ] Resource optimization

## Contact for Debugging Help

**Project Lead**: [Your Name]  
**Last Updated**: 2025-05-25  
**Debug Session Naming**: YYYY-MM-DD-XXX (XXX = sequential number)
