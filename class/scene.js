import {stageW, stageH, Camera} from './../jixi.js';


export default class Scene extends PIXI.Container {
  
  constructor(sceneData, psdID = null, bgColor = 0x000000, createCamera = false){   
     
    super();
    
    this.sceneData = sceneData;
    this.psdID = psdID ; // If PSD not set use scene id as fallback 

    this.name = sceneData.sceneID + '_' + sceneData.instanceID;
  
    this.bgColor = bgColor;
    this.camera = null; // createCamera ? : null;
    if (createCamera){
      this.camera = new Camera(psdID);
      this.addChild(this.camera);
    }
    
    this.on('added', this.didLoad);
    
  }
  
  didLoad(ev){
    
    this.off('added',  this.didLoad);
    this.on('removed',  this.dispose);
    
    // Prevent tapping on scenes below
    const inputScreen = new Sprite(PIXI.Texture.EMPTY);﻿
    inputScreen.interactive = true;
    inputScreen.width = stageW;
    inputScreen.height = stageH;
    this.addChild(inputScreen);
    
  }
  
  ready(){
    
    this.emit('ready', this);
    
  }
  
  // Overwrite to customise Mario transitions.
  
  getMarioTransPt(forArrive){
    return new Point(stageW*0.5, stageH*0.5);
  }
  
  // Return 0.0 for none
  getMarioTransFocusRad(forArrive){
    return 100.0;
  }
  
  onWillArrive(fromModal){
  }
  
  onDidArrive(fromModal){
  }
  
  onWillExit(fromModal){
  }
  
  onDidExit(fromModal){
  }
  
  // Overwrite to capture all button clicks 
  onBtn(btn){
    console.log('Clicked btn `'+btn.name+'`.');
  }
  
  dispose(){
    
    this.off('removed',  this.dispose);
    this.killTweens();
    
    // Once removed from stage, destroy and use no more.
    this.destroy({children:true});  // Keep textures though destroys children
    
  }
  
  // Remove all animations
  killTweens(dispo = null){
    dispo = dispo !== null ? dispo : this;
    TweenMax.killTweensOf(dispo);
    if (this.art){
      this.art = null;
    }
    for (var child of dispo.children){
      this.killTweens(child)
    }
  }
  
}