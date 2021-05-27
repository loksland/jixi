const { createApp, utils, scaler, nav, ui, Btn } = require('/Users/maker/Dropbox/Projects/jixi/jixi.js'); // require(`jixi`);

// Nav

import Home from './scenes/home.js';
import Popup from './scenes/popup.js';
import Cam from './scenes/cam.js';

const scenes = {
  
  home: {class: Home, sceneData: {}, default:true}, //, default:true
  popup: {class: Popup, sceneData: {}}, //, default:true
  cam: {class: Cam, sceneData: {}}, //, default:true

}

nav.setScenes(scenes);

// UI 

ui.registerPsdInfo(utils.requireAll(require.context('./ui', false, /.json$/)))

let fonts = {
  standard: {psdFontNames: ['Montserrat'], googleFontName: 'Montserrat', additionalStyles:['700 italic'], fallbacks:['serif']}
};
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
    bevel: 3.0
  },
  tfParams: {
    color: 0x000000
  }
});

Btn.setBtnTintOn(0xcccccc)

// Kick off

createApp(utils.e('game'), true, 1.0, 0x00481e, ()=>{  
  TweenMax.to(utils.e('spinner'), 0.4, {alpha:0.0, ease:Linear.easeNone, onComplete:function(){
    utils.e('spinner').remove();
  }});
});

