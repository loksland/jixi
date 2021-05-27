
```
UNDER DEVELOPMENT
```
# jixi

`jixi` is a lightweight game engine for [PixiJS](https://www.pixijs.com/) featuring responsive layout, scenes, sprites, camera, transitions and PSD exporting.

Primary features include:

- Navigation class including 6 built in transitions
- Scene controller class with display life-cycle methods
- Adaptive scaling and retina aware automatic layout driven from Photoshop, utilising the [Choppy PSD publishing library](https://www.npmjs.com/package/choppy)
- Library of 2d maths functions
- A camera class for panning across a field of play 
- Input helpers including a button class 
- Google web font support

### Getting started 

```
$ npm install jixi --save
```

Evoke in js ES6 module:
```js

const { createApp, utils, scaler, nav, ui, Btn } = require(`jixi`);

// Nav

import Home from './scenes/home.js';
import Play from './scenes/play.js';

const scenes = {
  
  home: {class: Home, sceneData: {}, default:true}, 
  play: {class: Play, sceneData: {}},
  
}

nav.setScenes(scenes);

// UI 

ui.registerPsdInfo(utils.requireAll(require.context('./ui', false, /.json$/))); // Path to PSD data
ui.registerFonts({
  standard: {psdFontNames: ['Montserrat'], googleFontName: 'Montserrat', additionalStyles:['700 italic'], fallbacks:['serif']}
});


// Scaler

const artboardDims = {width: Math.round(756.0*0.5), height:Math.round(1334.0*0.5)}; 
const artboardScaleFactor = 2.0; // How many px in a pt in art
const artboardProjectionParams = {
  default: {
    alignment: {x:0, y:0}, // -1 (left/top) 0:(centered) 1:(right/bottom) 
    scaleToFit: 'contain', // `w` / `h` / `contain` / 'cover' (case insensitive). 
    minDensity: 1.0 // Limits up scaling. Eg. 1.0 will scale no larger than SD on retina. 
  },
  ui: {
    matchProjScale: 'default', // Match the scale of other projection before applying own limits 
    pinToProj: 'default', // Other projection will be used to position 
    minScale: 1, // Lock scale to no smaller than pts match with art.
    maxScale: 1.2 // Avoid oversized UI elements
  }
};
scaler.configureArtboard(artboardDims, artboardScaleFactor, artboardProjectionParams);

// Kick off

createApp(utils.e('game'), true, 1.0, 0x000000, () => {  
  gsap.to(utils.e('spinner'), 0.4, {alpha:0.0, ease:Linear.easeNone, onComplete:function(){
    utils.e('spinner').remove();
  }});
});

```


### Docs

- Check out the [jixi documentation here](https://github.com/loksland/jixi/wiki).

### Dependencies

- PixiJS (v5.3.7)
- GSAP with PixiPlugin (v3.6.0)
- Google Webfont API (v1.6.26)

**Also:**
- Webpack (v5)
- Photoshop 2020
- [Choppy - command line PSD publishing utility](https://www.npmjs.com/package/choppy)

### Release History 

- [CHANGELOG.md](CHANGELOG.md)

