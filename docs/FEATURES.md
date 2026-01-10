# Zen Website Features Documentation

## Core Features

### 1. **Interactive Zen Story**
The centerpiece of the website - the classic Zen tale "Enter Zen From There"

#### Implementation
- Semantic HTML structure
- Fade-in animations for progressive reveal
- Interactive tooltips on key Zen concepts
- Responsive typography for readability

#### Zen Concept Tooltips
- **Zen**: "Zen is not something to understand, but to experience directly."
- **Consciousness**: "Pure awareness without the interference of thought."
- **Thinking**: "Thinking is useful, but can become an obstacle to direct experience."
- **Satori**: "A glimpse of enlightenment - a moment when the veil drops."
- **Aliveness**: "When mental noise subsides, the world appears vibrant."

### 2. **Dark/Light Mode Toggle** 🌙
Toggle between light and dark themes for comfortable reading.

#### Features
- Smooth color transitions
- Persists through session
- Affects all UI elements
- Triggers firefly effect in dark mode

#### Technical Details
- CSS class-based theming
- JavaScript toggle functionality
- Color palette optimized for readability

### 3. **Ambient Sound System** 🔊
Immersive audio environment with multiple sound layers.

#### Sound Elements
- **Mountain Stream**: Continuous background ambiance
- **OM Meditation**: Synchronized with breathing guide
- **Cosmic Meditation**: Special audio for cosmic mode
- **Bell Sounds**: Timer notifications
- **Zen Garden Sounds**: Rake and stone placement effects

#### Volume Controls
- Individual sliders for OM and Cosmic sounds
- Master sound toggle
- Graceful handling of autoplay restrictions

### 4. **Breathing Guide** 🧘
Animated breathing circle with OM sound for meditation practice.

#### Features
- 5-second breathing cycle
- Visual size and opacity changes
- Synchronized OM sound
- Helps establish meditation rhythm

#### Animation Cycle
1. Inhale: Circle expands (2.5 seconds)
2. Exhale: Circle contracts (2.5 seconds)
3. Continuous loop with smooth transitions

### 5. **Cosmic Meditation Mode** 🌌
Transform the entire experience with cosmic themes.

#### Visual Changes
- Space background (cosmic.jpg)
- Logo changes to Future.JPEG
- Ethereal color scheme
- Floating Zen quotes
- Cosmic drift animation
- Enhanced glow effects

#### Audio Changes
- Special cosmic meditation soundtrack (KTN.mp3)
- Adjustable volume control
- Seamless transition from normal mode

### 6. **Interactive Zen Garden** ☯️
A miniature Japanese rock garden for contemplative interaction.

#### Components
- **Sand Raking**: Multiple pattern options
- **Moveable Stones**: 5 stones with natural variations
- **Water Pond**: With swimming koi fish
- **Cherry Blossoms**: Falling petal animations
- **Bamboo Decorations**: Static elements for aesthetics
- **Stone Lantern**: Lights up in night mode

#### Raking Patterns
1. **Line**: Straight horizontal lines
2. **Wave**: Curved wave patterns
3. **Circle**: Concentric circles
4. **Spiral**: Spiral patterns from center

#### Interactive Elements
- Click and drag to rake sand
- Drag stones to new positions
- Day/night mode toggle
- Fullscreen mode
- Reset garden option

### 7. **Environmental Effects**

#### Falling Leaves 🍃
- Realistic leaf physics
- Random colors (yellow to green)
- Swaying motion during fall
- Continuous generation when active

#### Water Ripples 💧
- Click anywhere to create ripples
- Expanding circle animation
- Fades out naturally
- Multiple simultaneous ripples supported

#### Fireflies ✨
- Active only in dark mode
- Random movement patterns
- Glowing effect
- 25 fireflies maximum

### 8. **Meditation Timer** ⏱️
Built-in timer for meditation sessions.

#### Features
- Preset durations: 5, 10, 15 minutes
- Start/pause functionality
- Bell sound at start and end
- Large, readable display
- Countdown in MM:SS format

### 9. **Parallax Background** 🖱️
Optional parallax scrolling effect for depth.

#### Implementation
- Mouse position tracking
- Subtle background movement
- Can be toggled on/off
- Optimized with `will-change`

### 10. **Hidden Features**

#### Secret Message
- Click "Enter Zen from here" in footer
- Reveals Shunryu Suzuki quote
- Modal overlay presentation

#### Cosmic Mode Quotes
Floating wisdom quotes that appear during cosmic meditation:
- "The pine teaches silence"
- "In the beginner's mind there are many possibilities"
- "When you do something, burn yourself up completely"
- "The moon does not think to be reflected"
- "Sitting quietly, doing nothing, spring comes"

### 11. **Responsive Design**
Adapts to different screen sizes and devices.

#### Breakpoints
- Mobile: < 600px
- Tablet: 600px - 1024px
- Desktop: > 1024px

#### Mobile Optimizations
- Adjusted container padding
- Smaller control buttons
- Touch-friendly interactions
- Optimized animations

## Feature Interactions

### Synergies
- Dark mode + Fireflies
- Breathing guide + OM sound
- Cosmic mode + Floating quotes
- Zen garden + Ambient sounds

### Conflicts Handled
- Cosmic mode overrides normal background
- Timer bells override other sounds momentarily
- Zen garden has its own sound environment

## Accessibility Features

### Visual
- High contrast options
- Readable fonts
- Clear visual hierarchy
- Smooth transitions

### Interaction
- Keyboard navigation support
- Touch-friendly controls
- Clear button labels
- Tooltips for guidance

## Performance Features

### Optimizations
- Lazy loading for effects
- Efficient animation loops
- Automatic cleanup of elements
- Throttled event handlers

### Resource Management
- Preloaded critical assets
- Minimal external dependencies
- Optimized image formats
- Efficient DOM manipulation

## Browser Feature Support

### Required Features
- CSS3 animations
- ES6 JavaScript
- HTML5 audio
- Flexbox layout

### Progressive Enhancement
- Core content works without JavaScript
- Basic styling without CSS3
- Fallbacks for older browsers
- Graceful degradation

## User Experience Design

### Principles
- Minimalist interface
- Non-intrusive controls
- Smooth transitions
- Immediate feedback
- Contemplative pacing

### Flow
1. User arrives at peaceful story
2. Discovers interactive elements
3. Explores at their own pace
4. Creates personalized experience
5. Returns for meditation practice
