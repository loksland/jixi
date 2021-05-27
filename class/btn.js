import { utils, scaler } from './../jixi.js';

let btnClasses = {};
// Will overwrite txInfo of btn
btnClasses.default = { 
  gfxParams: {
    line: {
      width: 0,
      color: 0x000000,
      alpha: 1.0,
      alignment: 0
    },
    fill: {
      color: 0x00203a,
      alpha: 1.0
    },
    bevel: 0.0
  },
  tfParams: {
    color: 0xffffff
  }
}

// Configuration:
/*
Btn.registerClass('simple', { 
  gfxParams: {
    line: {
      width: 0,
      color: 0x000000,
      alpha: 1.0,
      alignment: 0
    },
    fill: {
      color: 0xffffff,
      alpha: 1.0
    },
    bevel: 0.0
  },
  tfParams: {
    color: 0xff3300
});
*/
// `Btn.setBtnTintOn(0x333333)`

let btnTintOn = 0x000000;

export default class Btn extends PIXI.Graphics {  
  
  constructor(){
    super();    
  }
  
  static registerClass(className, btnClassDefinition){    
    btnClasses[className] = btnClassDefinition;
  }
  
  static setBtnTintOn(col){
    btnTintOn = col;
  }
  
  init() {
    
    if (!this.txInfo){
      throw new Error('Btn `txInfo` not set');
    }
    
    // Style with default button style
    if (this.txInfo.class){
      if (!btnClasses[this.txInfo.class]){
        throw new Error('Button class `'+this.txInfo.class+'` not found. Call `Btn.registerClass(..)` before initiating app.');
      }
    }
    utils.objectAssignDeep(this.txInfo, btnClasses[this.txInfo.class || 'default']);

    this.tf = Text.fromTx(this.txInfo.path);   
    this.tf.anchor.set(0.5,0.5);
    
    this.addChild(this.tf);
    this.makeBtn();
    
    this.paddingW = Math.ceil((this.txInfo.width - this.txInfo.tfParams.visBoundsW)*0.5*scaler.proj[this.txInfo.projID].scale);
    this.paddingH = Math.ceil((this.txInfo.height - this.txInfo.tfParams.visBoundsH)*0.5*scaler.proj[this.txInfo.projID].scale);
    
    this.origW = this.txInfo._proj.width;    
    this.origH = this.txInfo._proj.height;    
    this.origX = this.txInfo._proj.tlX - this.txInfo._proj.x
    this.origY = this.txInfo._proj.tlY - this.txInfo._proj.y
    
    this.renderBg(); 
    
  }
  
  renderBg(){
    
    const w = this.tf.width + this.paddingW * 2.0;
    const h = this.tf.height + this.paddingH * 2.0;
    const x = this.origX + (this.origW-w)*this.txInfo.regPercX;  
    const y = this.origY + (this.origH-h)*this.txInfo.regPercY  
    
    if (this.isMultiline){
      this.renderRect(x, y, w, h);
    } else {
      this.renderRect(x, null, w, null); // Lock to art height if single line
    }
    
    this.tf.x = x + w * 0.5;
    this.tf.y = y + h * 0.5;
    
  }
  
  get isMultiline(){
    return this.tf.text.indexOf('\n') != -1 || this.tf.text.indexOf('\r') != -1
  }
  
  get text() {
    return this.tf.text;
  }

  set text(str) {
    this.tf.text = str;
    this.renderBg();    
  }
  
}

// Helper 
// ------
PIXI.DisplayObject.prototype.killBtn = function(){
  this.off('pointerdown');
  this.off('pointerupoutside');
  this.off('pointerup');
  this.interactive = false;
  this.buttonMode = false;
  let hit = this.getChildByName('__btnhit');
  if (hit){
    this.removeChild(hit);
  }
  
}

PIXI.DisplayObject.prototype.makeBtn = function(clickCallback = null, stateChangeCallback = null){
  
  const tintOn = btnTintOn;
  this.interactive = true;
  this.buttonMode = true;
  
  const isContainer = !this.isSprite && !(this instanceof Graphics) && !(this instanceof Btn);
  if (!stateChangeCallback){
    if (isContainer){
      const debugHitBtn = false;
      // Add a layer to collect hit events for the button, as containers have no bounds.
      const hit = new Sprite(debugHitBtn ? PIXI.Texture.WHITE : PIXI.Texture.EMPTY);﻿
      hit.name = '__btnhit';
      hit.width = this.txInfo._proj.width;
      hit.height = this.txInfo._proj.height;
      hit.x = this.txInfo._proj.tlX - this.txInfo._proj.x;
      hit.y = this.txInfo._proj.tlY - this.txInfo._proj.y;
      this.addChild(hit);
    }
  }
  
  this 
  .on('pointerdown', function(){    
    
    if (stateChangeCallback){
      stateChangeCallback(true, this);
    } else {
      this.tint = tintOn;
      if (isContainer){
        for (const child of this.children){
          if (child.isSprite){
            child.tint = tintOn;
          }
        }
      }
    }
    
    this.on('pointerupoutside', function(){
      this.off('pointerup');
      this.off('pointerupoutside');
      if (stateChangeCallback){
        stateChangeCallback(false, this);
        return;
      }
      this.tint = 0xffffff;
      if (isContainer){
        for (const child of this.children){
          if (child.isSprite){
            child.tint = 0xffffff;
          }
        }
      }
    }, this)
    
    this.on('pointerup', function(){
      this.off('pointerup');
      this.off('pointerupoutside');
      if (stateChangeCallback){
        stateChangeCallback(false, this);
      } else {
        this.tint = 0xffffff;
        if (isContainer){
          for (const child of this.children){
            if (child.isSprite){
              child.tint = 0xffffff;
            }
          }
        }
      }
      if (clickCallback){
        clickCallback(this);
      } else if (typeof this.parent.onBtn === 'function'){
        this.parent.onBtn.bind(this.parent)(this);
      }
    }, this)
    
  }, this)

}
