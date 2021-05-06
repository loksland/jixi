
const { createApp, utils, scaler, nav, ui, Btn } = require(`jixi`);

// Nav

import Test from './scenes/test.js';

const scenes = {
  
  test: {class: Test, sceneData: {}, default:true}, //, default:true

}

nav.setScenes(scenes);

// UI 

ui.registerPsdInfo(utils.requireAll(require.context('./ui', false, /.json$/)))

let fonts = {}
ui.registerFonts(fonts);

// Scaler

const artboardDims = {width: Math.round(1000.0*0.5), height:Math.round(1000.0*0.5)}; 
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

// Btn

Btn.registerClass('red', { 
  gfxParams: {
    line: {
      width: 0,
      color: 0x0000ff,
      alpha: 1.0,
      alignment: 0
    },
    fill: {
      color: 0xff3300,
      alpha: 1.0
    },
    bevel: 5.0
  },
  tfParams: {
    color: 0x000000
  }
});

// Kick off

createApp(utils.e('game'), true, 1.0, ()=>{  
  TweenMax.to(utils.e('spinner'), 0.4, {alpha:0.0, ease:Linear.easeNone, onComplete:function(){
    utils.e('spinner').remove();
  }});
});

