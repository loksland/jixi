
import { app, utils, nav } from './../jixi.js';

let proj; // Artboard projections 

let stageW = 0;
let stageH = 0;
let scaleFactor;
let uiScaleFactor;

// Defaults
export let artboardDims = {width: Math.round(756.0*0.5), height:Math.round(1334.0*0.5)}; // PSD dimensions
let artboardScaleFactor = 2.0; // How many px in a pt in art
let artboardProjectionParams = {
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

export function configureArtboard(_artboardDims, _artboardScaleFactor, _artboardProjectionParams){
  if (_artboardDims){
    artboardDims = _artboardDims;
  }
  if (_artboardScaleFactor){
    artboardScaleFactor = _artboardScaleFactor;
  }
  if (_artboardProjectionParams){
    artboardProjectionParams = _artboardProjectionParams;
  }
}

function setup(){ // Called once on init for now
  
  // Points to pixel conversion factors
  
  initResizeListener();
  onResizeThrottled();
  
}

// Artboard projection class
// -------------------------

class ArtboardProjection {
  
  constructor(alignment = null, scaleToFit = null, matchProjScale = null, pinToProj = null, stretchPosMode = false, minDensity = null, minScale = null, maxScale = null){
    
    // A projection has 3 properties.
    // - this.scale 
    // - this.topLeft
    // - this.stretchPosMode (true/false) Will distribute position throughout stage based relatively to art board position.
    // - this.positionScale the scale used to position in top level only.
    
    this.stretchPosMode = stretchPosMode;
    
    // Determine scale 
      
    if (scaleToFit !== null){
      
      scaleToFit = scaleToFit.toLowerCase();
      // `w` / `h` / `contain` / 'cover' (case insensitive). 
      if (scaleToFit == 'contain'){
        // Make entire artboard visible to up to stage bounds, will use letterboxing
        this.scale = utils.containScale(artboardDims.width, artboardDims.height, stageW, stageH);
      } else if (scaleToFit == 'cover'){
        // Cover stage bounds entirely, clipping tops or bottoms as necessary
        this.scale = utils.coverScale(artboardDims.width, artboardDims.height, stageW, stageH);
      } else if (scaleToFit == 'w'){
        this.scale = stageW/artboardDims.width;
      } else if (scaleToFit == 'h'){
        this.scale = stageH/artboardDims.height;
      }
      
    } else if (matchProjScale){
      // Get scale from another projection
      if (matchProjScale && !proj[matchProjScale]){
        throw new Error('Scale match projection not found `'+matchProjScale+'`. Check declaration order.')
      }
      this.scale = proj[matchProjScale].scale;            
    }
    
    // Apply scale limits
    
    if (minDensity !== null){
      // Limits up scaling. Eg. 1.0 will scale no larger than SD on retina. 
      this.scale = this.scaleForPxDensity(Math.max(this.pxDensity, minDensity))
    }
    
    if (minScale !== null){
      this.scale = Math.max(this.scale, minScale)
    }
    
    if (maxScale !== null){
      this.scale = Math.min(this.scale, maxScale)
    }
    
    this.positionScale = this.scale;
    
    /// Translate alignment to top left coords
    
    this.topLeft = {x:0.0, y:0.0};
    if (alignment !== null){
      
      if (alignment.x == -1){
        this.topLeft.x = 0.0;
      } else if (alignment.x == 0){
        this.topLeft.x = utils.rnd(stageW*0.5-this.scale*artboardDims.width*0.5);
      } else if (alignment.x == 1){
        this.topLeft.x = utils.rnd(stageW-this.scale*artboardDims.width);
      } 
      
      if (alignment.y == -1){
        this.topLeft.y = 0.0;
      } else if (alignment.y == 0){
        this.topLeft.y = utils.rnd(stageH*0.5-this.scale*artboardDims.height*0.5);
      } else if (alignment.y == 1){
        this.topLeft.y = utils.rnd(stageH-artboardScale*artboardDims.height);
      } 
      
    } else if (pinToProj){
      
      if (pinToProj && !proj[pinToProj]){
        throw new Error('Pin projection not found `'+pinToProj+'`. Check declaration order.')
      }
      
      this.topLeft = {x:proj[pinToProj].topLeft.x, y:proj[pinToProj].topLeft.y};
      this.positionScale = proj[pinToProj].positionScale;
      
    }
    
  }
  
  // Pixel scaling based on this.scale. Eg. If this.scale is 0.5 on @2 retina then will return 1.0
  get pxScale() { 
    return window.devicePixelRatio*(this.scale/artboardScaleFactor);
  }
  
  // Screen density based on this.scale. Eg. 2 for @2 retina.
  get pxDensity(){ 
    return (1.0/(window.devicePixelRatio*(this.scale/artboardScaleFactor)))*window.devicePixelRatio;
  }
  
  scaleForPxDensity(_pxDensity){
    return ((1.0/(_pxDensity/window.devicePixelRatio))/window.devicePixelRatio)*artboardScaleFactor;
  }
  
  transArtX(x){ // x is in art board position points 
    
    if (this.stretchPosMode){
      return this.topLeft.x + (x/artboardDims.width)*stageW;
    }
    return this.topLeft.x + this.positionScale*x;
    
  }
  
  transArtY(y){ // x is in art board position points 
    if (this.stretchPosMode){
      return this.topLeft.y + (y/artboardDims.width)*stageH;
    }
    return this.topLeft.y + this.positionScale*y;
  }
  
}

// Resize listener
// ---------------

let emitter;
const resizeThrottleDelay = 0.5;

function initResizeListener(){
  // https://nodejs.org/api/events.html
  // https://github.com/primus/eventemitter3
  emitter = new PIXI.utils.EventEmitter();
  app.renderer.on('resize', onResizeImmediate); // Listen for stage events
}

function onResizeImmediate(){
  
  let _stageW = app.renderer.view.width/window.devicePixelRatio;
  let _stageH = app.renderer.view.height/window.devicePixelRatio;
  
  if (_stageW == stageW && _stageH == stageH){
    return;
  }
  
  emitter.emit('resize_immediate', _stageW, _stageH);
  
  utils.killWaitsFor(onResizeThrottled)
  utils.wait(resizeThrottleDelay, onResizeThrottled)
  
}

function onResizeThrottled(){
  
  let _stageW = app.renderer.view.width/window.devicePixelRatio;
  let _stageH = app.renderer.view.height/window.devicePixelRatio;
  
  if (_stageW == stageW && _stageH == stageH){
    return;
  }
  stageW = _stageW;
  stageH = _stageH;
  
  proj = {};
  for (let projectionSlug in artboardProjectionParams){
    let params = artboardProjectionParams[projectionSlug];    
    proj[projectionSlug] = new ArtboardProjection(params.alignment, params.scaleToFit, params.matchProjScale, params.pinToProj, params.stretchPosMode, params.minDensity, params.minScale, params.maxScale);   
  }

  scaleFactor = proj.default.scale; 
  uiScaleFactor = proj.ui.scale;
  
  emitter.emit('resize', stageW, stageH);
  
}

function on(eventName, listener){
  return emitter.on(eventName, listener);
}

function off(eventName, listener){
  return emitter.off(type, listener);
}

export { setup, proj, stageW, stageH, on, off, resizeThrottleDelay, scaleFactor, uiScaleFactor }