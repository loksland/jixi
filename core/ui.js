// Layout helpers
// --------------
// - Projection / scale aware extensions of Pixi display object classes

import { Scene, Btn, scaler, Camera, utils } from './../jixi.js';

let fontMapping; // Lookup PSD font to get pixi (css) font family list 
let googleFontFamilies;

function registerFonts(fonts){
  
  fontMapping = {};
  googleFontFamilies = [];
  for (const fontID in fonts){    
    if (!fontMapping[fonts[fontID].psdFontName]){
      const fontFamily = utils.getFontFamilyFromGoogleFontURL(fonts[fontID].fontURL);         
      googleFontFamilies.push(fontFamily);
      fontMapping[fonts[fontID].psdFontName] = [fontFamily].concat(fonts[fontID].fallbacks);        
    }
  }
  
  
}

// Index textures

let psdInfo;
let txInfo;

function registerPsdInfo(_psdInfo){
  
  psdInfo = {}
  for (let psdData of _psdInfo) {
    psdInfo[psdData.doc.name] = psdData; // Retain `.psd` ext
  }
  
  txInfo = {};
  for (let psdID in psdInfo){
    for (let i = psdInfo[psdID].doc.txs.length - 1; i >=0 ; i--) {
      
      psdInfo[psdID].doc.txs[i].psdID = psdID; // Create a ref back to the PSD
      psdInfo[psdID].doc.txs[i].path = psdID + '/' + psdInfo[psdID].doc.txs[i].name;
      psdInfo[psdID].doc.txs[i].index = i; // Save index
      psdInfo[psdID].doc.txs[i].projID = psdInfo[psdID].doc.txs[i].flags.split(',').indexOf('ui') != -1 ? 'ui' : 'default' // Interpret flags as projections
      psdInfo[psdID].doc.txs[i].children = []; // Will be added to in subsequent loops of children
      
      if (psdInfo[psdID].doc.txs[i].tfParams.length > 0){
        psdInfo[psdID].doc.txs[i].tfParams = JSON.parse(psdInfo[psdID].doc.txs[i].tfParams); // Convert from JSON string to obj
      }
      if (psdInfo[psdID].doc.txs[i].parent){
        txInfo[psdInfo[psdID].doc.name + '/' + psdInfo[psdID].doc.txs[i].parent].children.unshift(psdInfo[psdID].doc.txs[i].name);
      }
      txInfo[psdInfo[psdID].doc.name + '/' + psdInfo[psdID].doc.txs[i].name] = psdInfo[psdID].doc.txs[i]; // Allow texture look up (with `psdname.psd/` prefix)
    }
  }

}

let totLoadsComplete = 0;
let initialLoadItemCount = 0;
let loadAssetCallback;

export function loadAssets(_loadAssetCallback){
  
  if (!psdInfo){
    throw new Error('PSD info never registered. Call `ui.registerPsdInfo(..)` before initiating app.')
  }
  
  loadAssetCallback = _loadAssetCallback;
  
  // Wait for loader
  initialLoadItemCount++;
  
  // 1) Load Google web fonts     
  
  if (googleFontFamilies.length > 0){
    initialLoadItemCount++;
    
    // https://github.com/typekit/webfontloader
    WebFont.load({
        google: {
            families: googleFontFamilies
        },
        loading: function() { 
        },
        active: function() { 
          onLoadComplete(); 
        },
        inactive: function() { 
          onLoadComplete(); // Failed load will fallback
        } 
    });
    
  }
  
  // 2) Load all images
  //for (let p in content.images){
  //  if (content.images[p]){
  //    loader.add(p, content.images[p]);  
  //  }
  //}
  
  for (let txPath in txInfo){
    if (txInfo[txPath].type == 'img'){
      loader.add(txPath, txInfo[txPath].src); 
    }
  }
  
  loader.load(onLoadComplete);
  
}

// Wait for webfonts and assets to both load before starting

function onLoadComplete(){
  totLoadsComplete++;
  if (totLoadsComplete == initialLoadItemCount){
    if (loadAssetCallback){
      loadAssetCallback();
    }
  }
}

PIXI.DisplayObject.fromTx = function(txPath){
  
  if (!txInfo[txPath]){
    throw new Error('Texture info not found `'+txPath+'`')
  }
  
  let dispo;
  
  if (this == Btn){
    
    dispo = new Btn(txPath);
      
  } else if (this == Graphics){
    
    dispo = new Graphics();
    
  } else if (this == Text){
    
    dispo = new Text(txInfo[txPath].tfParams.text, {
      fontFamily: fontMapping[txInfo[txPath].tfParams.font],
      fontSize: txInfo[txPath].tfParams.fontSize * scaler.proj[txInfo[txPath].projID].scale, // Apply projection scale to font size
      fill: txInfo[txPath].tfParams.color,
      fontWeight: utils.fontWeightStrToNum(txInfo[txPath].tfParams.fontStyle),
      align: txInfo[txPath].tfParams.align // Only affects multi-line fields, use reg to control alignment
    });
  
    
  } else  if (this == Sprite || this.prototype instanceof Sprite){ // Custom Sprite class
    
    if (!resources[txPath]){
      throw new Error('Sprite texture not found `'+txPath+'`')
    }
    dispo = new this(resources[txPath].texture);
  
  } else if (this == Container || (this.prototype instanceof Container)){ // Custom container class
    
    dispo = new this();
    
  } else {

    throw new Error('Unable to initialize from texture `'+txPath+'`')
  }
  
  // Extra prop that art aware display objects posess.
  dispo.txInfo = txInfo[txPath];  
  dispo.name = dispo.txInfo.name; // Optional, for convenience

  dispo.applyProj();
  
  // Add children
  dispo.addArt();
  
  // If `setup` function exists then call now after applying projection and adding children
  if (typeof dispo.init === 'function'){
    dispo.init(); // Setup based on `txInfo`
  }
  
  return dispo;
  
}

// gfxParams
// - line
//  - width
//  - color
//  - alpha
//  - alignment (0 = inner, 0.5 = middle, 1 = outter)
// - fill
//  - color
//  - alpha
// - bevel (corner radius)
// Optionally send width/height overrides
//PIXI.Graphics.prototype.setup = function(){
//  this.renderRect();
//}
PIXI.Graphics.prototype.init = function(){
  this.renderRect();
}

PIXI.Graphics.prototype.renderRect = function(x = null, y = null, width = null, height = null){
  
  const gfxParams = this.txInfo.gfxParams ? this.txInfo.gfxParams : {
    line: {
      width: 0,
      color: 0x000000,
      alpha: 1.0,
      alignment: 0
    },
    fill: {
      color: 0xffffff,
      alpha: 0.5
    },
    bevel: 3.0
  }
  
  this.clear();
  if (gfxParams.line.width > 0.0 && gfxParams.line.alpha > 0.0){
    this.lineStyle(gfxParams.line.width,gfxParams.line.color,gfxParams.line.alpha,gfxParams.line.alignment);
  }
  this.beginFill(gfxParams.fill.color, gfxParams.fill.alpha);
  const _x = x ? x : this.txInfo._proj.tlX - this.txInfo._proj.x;
  const _y = y ? y : this.txInfo._proj.tlY - this.txInfo._proj.y;
  const _w = width ? width : this.txInfo._proj.width;
  const _h = height ? height : this.txInfo._proj.height;
  if (gfxParams.bevel > 0.0){
    this.drawRoundedRect(_x,_y,_w,_h,gfxParams.bevel);
  } else {
    this.drawRect(_x,_y,_w,_h);
  }
  this.endFill();
  
}

PIXI.DisplayObject.prototype.applyProj = function(){
  
  const projID = this.txInfo.projID;
  
  // Store a pure representation of the position and scale as it relates to the stage.
  this.txInfo._proj = {};
  this.txInfo._proj.x = scaler.proj[projID].transArtX(this.txInfo.x);
  this.txInfo._proj.y = scaler.proj[projID].transArtY(this.txInfo.y);
  this.txInfo._proj.width = scaler.proj[projID].scale * this.txInfo.width;
  this.txInfo._proj.height = scaler.proj[projID].scale * this.txInfo.height;
  
  // Add bounds 
  this.txInfo._proj.tlX = this.txInfo._proj.x - this.txInfo._proj.width*this.txInfo.regPercX;
  this.txInfo._proj.tlY = this.txInfo._proj.y - this.txInfo._proj.height*this.txInfo.regPercY;
  this.txInfo._proj.brX = this.txInfo._proj.tlX + this.txInfo._proj.width
  this.txInfo._proj.brY = this.txInfo._proj.tlY + this.txInfo._proj.height
  
  // Apply anchor. Containers don't use anchors.
  if (this.isSprite){
    this.anchor.set(this.txInfo.regPercX, this.txInfo.regPercY);
  } 
  
  if (this.txInfo.parent){ // Don't manage alignment of children    
    this.x = scaler.proj[projID].scale * this.txInfo.x;
    this.y = scaler.proj[projID].scale * this.txInfo.y;    
  } else {
    this.x = this.txInfo._proj.x
    this.y = this.txInfo._proj.y
  }
  if (this.txInfo.hug){
    this.hug(this.txInfo.hug); 
  }

  if (this.isSprite && !(this instanceof Text)){ 
    // - Text fields need no limit on dimensions
    // - Containers are positional pins and do not need to be scaled
    this.width = this.txInfo._proj.width;
    this.height = this.txInfo._proj.height;
  }
  
}

// Scenes can update texture info with dynamic content 
Scene.prototype.mapTxInfo = function(txInfoMapping, _psdID = null){
  
  if (!_psdID){
    _psdID = this.psdID; // Remove extension
  }
  
  // Update paths to include path to texture info 
  
  let del = [];
  for (const writePath in txInfoMapping){
    del.push(writePath);
    txInfoMapping['txInfo.' + _psdID + '/' + writePath] = txInfoMapping[writePath];    
  }
  for (const delPath of del){
    delete txInfoMapping[delPath]
  }
  
  performValuePathMapping(txInfoMapping)
  
}

// If caller is a scene then all top level items are added 
// otherwise will add chidren
// |txNameGlob| is an optional texture name pattern, can add multiple arguments, will add textures that match any condition
// Accepts wildcard filtering Eg. `*_tx_suffix`, `!tf_match*`, `tx_prefix_*`
// Display objects can optionally declare a method called `addArtTxNameGlobs` that returns an array of txNameGlobs.
// This will be used if none are sent to this method.
PIXI.DisplayObject.prototype.addArt = function(txNameGlob){
  
  if (!((this instanceof Scene) || (this instanceof Camera)) && this.txInfo && this.txInfo.children.length == 0){   
    // No children to add
    return
  }
    
  let added = [];
  let psdID; 
  let txs;
  let startIndex = null;
  let endIndex = null;
  let addTopLevelOnly;
  
  if (!((this instanceof Scene) || (this instanceof Camera)) && this.txInfo){
    
    psdID = this.txInfo.psdID;    
    // Only loop the subset of textures for this item. May include children of children that will not be added.
    startIndex = txInfo[psdID + '/' + this.txInfo.children[this.txInfo.children.length-1]].index;
    endIndex = txInfo[psdID + '/' + this.txInfo.children[0]].index;
    addTopLevelOnly = false;
        
  } else {
    
    // Use scene psdID property 
    if (!psdID && ((this instanceof Scene) || (this instanceof Camera))){
      psdID = this.psdID; 
    }
    
    addTopLevelOnly = true;
    
  }
  
  if (!psdInfo[psdID]){
    throw new Error('psdID not found `'+psdID+'`');
  }
  txs = psdInfo[psdID].doc.txs;
  startIndex = startIndex === null ? txs.length-1 : startIndex;
  endIndex = endIndex === null ? 0 : endIndex;
  
  let txNameGlobs = Array.from(arguments);
  if (txNameGlobs.length == 0 && typeof this.addArtTxNameGlobs === 'function'){
    // Use caller's custom txNameGlobs list
    txNameGlobs = this.addArtTxNameGlobs();
  }
  // Put ! criterea first to optimise pattern matching later
  txNameGlobs.sort(function(a, b) {
    const aIsNot = a.startsWith('!');
    const bIsNot = b.startsWith('!')
    if (aIsNot && !bIsNot) {
      return -1;
    }
    if (bIsNot && !aIsNot) {
      return 1;
    }
    return 0;
  });
  
  if (!this.art){
    this.art = {}  
  }
  
  let addedTx = {};
  
  for (let i = startIndex; i >= endIndex; i--){ 
    
    let addOK = false;
    if (addTopLevelOnly) {
      addOK = !txs[i].parent;
    } else {
      addOK = txs[i].parent == this.txInfo.name; 
    }
    
    if (addOK){ 
      
      // Check for tx name pattern matching
      let nameMatchOK = txNameGlobs.length > 0 ? false : true;    
      for (const txNameGlob of txNameGlobs){ 
        const isNot = txNameGlob.startsWith('!');
        nameMatchOK = utils.globMatch(txs[i].name, txNameGlob); 
        if (isNot){
          if (!nameMatchOK){ // Must match ALL not (!) criterea
            break;
          } 
        } else if (nameMatchOK){ // Can match ANY standard criterea
          break;
        }
      }
      
      if (nameMatchOK){
        
        let dispo = null;
        if (txs[i].type == 'div'){ // btn
          dispo = Container.fromTx(psdID + '/' + txs[i].name);      
        } else if (txs[i].type == 'img'){      
          dispo = Sprite.fromTx(psdID + '/' + txs[i].name);      
        } else if (txs[i].type == 'tf'){      
          dispo = Text.fromTx(psdID + '/' + txs[i].name);   
        } else if (txs[i].type == 'btn'){
          dispo = Btn.fromTx(psdID + '/' + txs[i].name);
        } else if (txs[i].type == 'rect'){
          dispo = Graphics.fromTx(psdID + '/' + txs[i].name);  
        }
        
        if (dispo != null){
          
          if (txs[i].parent){
            
            // If parent is a spite counter act the effect of its scale on children
            if (this.isSprite){
              dispo.x *= (1.0/this.scale.x);
              dispo.y *= (1.0/this.scale.y);
              dispo.scale.x *= (1.0/this.scale.x);
              dispo.scale.y *= (1.0/this.scale.y);
            }
            
          }
          
          this.addChild(dispo);
          
          //console.log('- Added `'+txs[i].name+'`')
          
          this.art[txs[i].name] = dispo;
          addedTx[txs[i].name] = txs[i];
          
          added.push(dispo);
          
        }
      }
    }
  }
  
  return added; 
  
}

function performValuePathMapping(mapping){

  for (let writePath in mapping){
    
    // Only write to approved path roots
    const writePathBase = writePath.split('.')[0];
    let writeObj;
    //if (writePathBase == 'config'){
      // writeObj = config;      
    //} else 
    if (writePathBase == 'txInfo'){
      writeObj = txInfo;      
    }
    if (!writeObj){
      throw new Error('Invalid write path `'+writePath+'`');
    }
    
    // Only read from approved path roots
    let val;
    if (typeof mapping[writePath] == 'string'){
      const readPath = mapping[writePath];
      const readPathBase = readPath.split('.')[0];
      let readObj;
      if (readPathBase == 'content'){
        readObj = content;
      }
      if (!readObj){ // Interpret as string constant
        val = mapping[writePath]; // throw new Error('Invalid read path `'+readPath+'`');
      } else { 
        val = utils.getObjPath(readObj, readPath.substr(readPathBase.length+1));
      }
    } else {
      val = mapping[writePath];
    }
    
    utils.setObjPathVal(writeObj, writePath.substr(writePathBase.length+1).split('.psd/').join('(dot)psd/'), val)
    
  }
}


PIXI.DisplayObject.prototype.hug = function(hugStr, hugBounds = null){
  
  const hugAlign = utils.alignmentStringToXY(hugStr, true); // Result may have null for undefined
  
  hugBounds = !hugBounds ? {width:scaler.stageW, height:scaler.stageH} : hugBounds; // May be extended for artboard in future
  const retainLayoutPadding = true;
  const applyProjScaleToPadding = false;
    
  const paddingScale = applyProjScaleToPadding ? proj.default.scale : 1.0;
  if (hugAlign.x !== null){
    if (hugAlign.x == -1){
      const paddingLeftX = retainLayoutPadding ? paddingScale * (this.txInfo.x - this.txInfo.regPercX*this.txInfo.width) : 0.0;
      this.x =  this.txInfo._proj.x - this.txInfo._proj.tlX + paddingLeftX
    } else if (hugAlign.x == 0){
      this.x = hugBounds.width*0.5 - (this.txInfo._proj.brX - this.txInfo._proj.x) + this.txInfo._proj.width*0.5;
    } else if (hugAlign.x == 1){
      const paddingRightX = retainLayoutPadding ? paddingScale * (scaler.artboardDims.width - (this.txInfo.x + (1.0-this.txInfo.regPercX)*this.txInfo.width)) : 0.0;
      this.x = hugBounds.width - (this.txInfo._proj.brX - this.txInfo._proj.x + paddingRightX)  
    }
  }
  
  if (hugAlign.y !== null){
    if (hugAlign.y == -1){
      const paddingTopY = retainLayoutPadding ? paddingScale * (this.txInfo.y - this.txInfo.regPercY*this.txInfo.height) : 0.0;
      this.y =  this.txInfo._proj.y - this.txInfo._proj.tlY + paddingTopY;
    } else if (hugAlign.y == 0){
      this.y = hugBounds.height*0.5 - (this.txInfo._proj.brY - this.txInfo._proj.y) + this.txInfo._proj.height*0.5;
    } else if (hugAlign.y == 1){
      const paddingBtmY = retainLayoutPadding ? paddingScale * (scaler.artboardDims.height - (this.txInfo.y + (1.0-this.txInfo.regPercY)*this.txInfo.height)) : 0.0;
      this.y = hugBounds.height - (this.txInfo._proj.brY - this.txInfo._proj.y + paddingBtmY)  
    }
  }
  
} 


export { txInfo,registerFonts,registerPsdInfo } // Temporary?
