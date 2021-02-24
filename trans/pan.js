import { scaler,nav } from './../../jixi/jixi.js';

export const id = ['pan','parallax'];

// Usage:
// `pan:left`
// `pan:right`
// `pan:top`
// `pan:down`
// -or-
// `parallax:left`
// `parallax:right`
// `parallax:top`
// `parallax:down`
// Then set z property in PSD layers. Eg. `start.btn(reg:c,ui,z:2)`
// Confguring: 
// `trans.parallax.setParallaxOffset(1000.00)`

let parallaxOffset = 600.00;

class PanTrans {
  
  constructor(scene, scenePrev = null, isModal = false, transConfigStr = null, transID = null){
    
    this.scene = scene;
    this.scenePrev = scenePrev;
    this.isModal = isModal;
    this.isTransparent = false;
    this.isParallax = transID == 'parallax'; // Parallax trans alias
    
    transConfigStr = (!transConfigStr || transConfigStr.length == 0) ? 'r' : transConfigStr.toLowerCase().charAt(0);
    // this.dir is the camera movement direction
    if (transConfigStr == 'u'){
      this.dir = {y:-1.0,x:0.0};
    } else if (transConfigStr == 'd'){
      this.dir = {y:1.0,x:0.0};      
    } else if (transConfigStr == 'l'){
      this.dir = {y:0.0, x:-1.0};
    } else { // `right` is default
      this.dir = {y:0.0, x:1.0};
    }
    
    this.parallaxOffset = parallaxOffset ; //config.trans.parallax.parallaxOffset; // How many pixels is 1 meter z offset when scene is offset by one stage width.
    
    this.dur = 0.9; // this.parallaxOffset ? 0.9 : 0.7;
    
  }
  
  static setParallaxOffset(_parallaxOffset){
    parallaxOffset = _parallaxOffset;
  }
  
  
  performIn(onInCallback){
    
    this.scene.visible = true;
    this.scene.x = scaler.stageW * this.dir.x 
    this.scene.y = scaler.stageH * this.dir.y
    
    if (!nav.isScenePresentedWithTransparentBg()){
      TweenMax.to(nav.bg, this.dur, {pixi: {tint:this.scene.bgColor}, ease:Linear.easeNone});
    }
    
    if (this.scenePrev){
      TweenMax.to(this.scenePrev, this.dur, {pixi: {x: scaler.stageW * -this.dir.x, y: scaler.stageH * -this.dir.y}, ease:Power3.easeInOut});
    }
    var tw = {pixi: {x: 0.0, y: 0.0}, ease:Power3.easeInOut, onComplete: this.onIn.bind(this), onCompleteParams: [onInCallback]};
    
    if (this.isParallax){
      let eles = [this.scene];
      if (this.scenePrev){
        eles.push(this.scenePrev);
      }
      tw.onUpdate = this.applyParallax.bind(this);
      tw.onUpdateParams = [eles];
      this.applyParallax(eles, true);
    }
    
    TweenMax.to(this.scene, this.dur, tw);
    
  }
  
  onIn(onInCallback){
    
    let eles = [this.scene]
    if (this.scenePrev){
      this.scenePrev.x = 0.0;
      this.scenePrev.y = 0.0;
      this.scenePrev.visible = false; // Hide incase is modal for performance
      eles.push(this.scenePrev)
    }
    
    if (this.isParallax){
      this.resetParallax(eles)
    }
    
    onInCallback();    
    
  }
  
  applyParallax(scenes, firstRun = false){
    
    for (const scene of scenes){
      
      const percX = scene.x/scaler.stageW;
      const percY = scene.y/scaler.stageH;
      
      for (const dispo of scene.children){
        if (dispo.txInfo){
          if (firstRun){
            dispo.txInfo._parallax_x = dispo.x;
            dispo.txInfo._parallax_y = dispo.y;
          }
          dispo.x = dispo.txInfo._parallax_x + dispo.txInfo.z * percX * this.parallaxOffset;
          dispo.y = dispo.txInfo._parallax_y + dispo.txInfo.z * percY * this.parallaxOffset;
        }
      }
      
    }
    
  }
  
  resetParallax(scenes){
    
    for (const scene of scenes){
      
      for (const dispo of scene.children){
        if (dispo.txInfo){
          
          dispo.x = dispo.txInfo._parallax_x;
          dispo.y = dispo.txInfo._parallax_y;
          
          delete dispo.txInfo._parallax_x;
          delete dispo.txInfo._parallax_y;
          
        }
      }
      
    }
    
  }
  
  performOut(onOutCallback){
    
    this.scenePrev.visible = true;
    this.scenePrev.x = scaler.stageW * this.dir.x * -1.0;
    this.scenePrev.y = scaler.stageH * this.dir.y * -1.0;
    
    TweenMax.to(nav.bg, this.dur, {pixi: {tint:this.scenePrev.bgColor}, ease:Linear.easeNone});
    
    TweenMax.to(this.scene, this.dur, {pixi: {x: scaler.stageW * -this.dir.x * -1.0, y: scaler.stageH * -this.dir.y * -1.0}, ease:Power3.easeInOut});
    
    var tw = {pixi: {x: 0.0, y: 0.0}, ease:Power3.easeInOut, onComplete: this.onOut.bind(this), onCompleteParams: [onOutCallback]}
    if (this.isParallax){
      tw.onUpdate = this.applyParallax.bind(this);
      tw.onUpdateParams = [[this.scene,this.scenePrev]];
      this.applyParallax(eles, true);
    }
    
    TweenMax.to(this.scenePrev, this.dur, tw);
    
  }
  
  onOut(onOutCallback){
    
    this.scene.visible = false;
    this.scene.x = 0.0;
    this.scene.y = 0.0;
    
    if (this.isParallax){
      this.resetParallax([this.scene,this.scenePrev])
    }
    
    onOutCallback();        
    
  }
  
}

export default PanTrans
