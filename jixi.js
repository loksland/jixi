
// PixiJS convenience aliases 
window.Sprite = PIXI.Sprite;
window.Point = PIXI.Point;
window.Rectangle = PIXI.Rectangle;
window.Text = PIXI.Text
window.Graphics = PIXI.Graphics
window.Container = PIXI.Container;
window.loader = PIXI.Loader.shared; //PIXI.Loader.shared; //.  new PIXI.Loader(); // Using shared was causing bug with hot reload.
window.resources = loader.resources;
window.ticker = PIXI.Ticker.shared;

import * as _ext from './utils/extensions.js'
import * as utils from './utils/utils.js';

import Scene from './class/scene.js';
import Camera from './class/camera.js';
import Btn from './class/btn.js';

import * as nav from './core/nav.js';
import * as scaler from './core/scaler.js';
import * as ui from './core/ui.js';

// Props 
let app; // PIXI app instance
let isProd = process.env.NODE_ENV != 'development';  // Set in package.json: eg. "start:dev": "webpack serve --mode development"
let htmlEle; // The element containing the game

//let stageW = 0; // Stage dims 
//let stageH = 0; // Stage dims 

export function createApp(_htmlEle, fullScreen = false, bgAlpha = 1.0, onLoadCallback = null) {
  
    htmlEle = _htmlEle;
    
    // Docs: http://pixijs.download/release/docs/PIXI.Application.html#Application
    app = new PIXI.Application({
      //  width: window.innerWidth, 
      //  height: window.innerHeight,                       
        autoDensity: true, //  Adjusts the canvas using css pixels so it will scale properly (it was the default behavior in v4)
        antialias: window.devicePixelRatio == 1, //(), 
        transparent: bgAlpha < 1.0,
        resolution: window.devicePixelRatio, // Resolution controls scaling of content (sprites, etc.) 
        resizeTo: fullScreen ? window : htmlEle
    });
    
    //app.renderer.view.style.touchAction = 'inherit'
    //app.renderer.plugins.interaction.autoPreventDefault = false;
    
    //document.body.addEventListener("mouseover", ()=>{
    //  console.log('ho')
    //});
    
    
    //https://github.com/pixijs/pixi.js/issues/4824
    //app.renderer.plugins.interaction.autoPreventDefault = false;
    //app.renderer.view.style.touchAction = 'auto';
    
    scaler.setup();
    
    ui.loadAssets(function(){
      
      if (onLoadCallback){
        onLoadCallback();
      }
      
      setup(bgAlpha);
      
    })
    
}
//window.createGame = createGame; // Make public

// All assets are loaded by this point and the stage is empty
function setup(bgAlpha){ 
  
  // Attach canvas to the DOM 
  htmlEle.appendChild(app.view);
  
  //app.view.style.pointerEvents = 'auto';
  //htmlEle.style.pointerEvents = 'none';
  
  // Attach core display objects 
  nav.setupStage(app.stage, bgAlpha);
  
  // Debug TF
  if (isProd){
    // Disable right click - this menu may be confusing to user
    htmlEle.setAttribute('oncontextmenu', 'return false');
  } else {
    const debugTf = new PIXI.Text('X', {fontFamily : 'Arial', fontSize: 13, fill : 0xffffff, align : 'left', dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 0.0,
    dropShadowDistance: 2.0});  
    debugTf.x = 3.0;
    debugTf.y = 3.0;    
    app.stage.addChild(debugTf);
    ticker.add(function(time){
        debugTf.text = PIXI.Ticker.shared.FPS.toFixed(2);
    }); 
  }
  
  // Get default scene and load it
  if (!nav.openDefaultScene()){
    throw new Error('Default scene not found.')
  }
  
}

// Utils 

// Keyboard 
// --------
/*

See: https://github.com/kittykatattack/learningPixi#keyboard

let keyCodes = {};
keyCodes.ESCAPE = 27;
keyCodes.LEFT = 37;
keyCodes.RIGHT = 39;
keyCodes.UP = 38;
keyCodes.DOWN = 40;
keyCodes.SPACE = 32;
keyCodes.CMD = 91;
keyCodes.CNTRL = 17;

window.keyCodes = keyCodes;

*/

// Ref: https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export

// export {stageW, stageH} from './core/scaler.js'; // Convenience alias
export {app};
export {Scene, Camera, Btn}; // Classes
export {utils, nav, ui, scaler}; // Core 

