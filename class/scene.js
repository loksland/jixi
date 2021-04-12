import { scaler, Camera} from './../jixi.js';

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
    this.bgScreen = new Sprite(PIXI.Texture.EMPTY);﻿ // WHITE
    this.bgScreen.interactive = true;
    this.bgScreen.width = scaler.stageW;
    this.bgScreen.height = scaler.stageH;
    this.addChild(this.bgScreen);
    
  }
  
  ready(){
    
    this.emit('ready', this);
    
  }
  
  shouldReloadOnStageResize(stageW, stageH){
    
    this.bgScreen.width = stageW
    this.bgScreen.height = stageH
    
    return true;
    
  }
  
  // Overwrite to customise Mario transitions.
  
  getMarioTransPt(forArrive){
    return new Point(scaler.stageW*0.5, scaler.stageH*0.5);
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
    
    this.bgScreen = null;
    
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