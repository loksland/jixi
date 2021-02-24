import { nav,scaler } from './../../jixi/jixi.js';

export const id = 'over';

export default class OverTrans {
  
  constructor(scene, scenePrev = null, isModal = false, transConfigStr = null){
    
    this.scene = scene;
    this.scenePrev = scenePrev;
    this.isModal = isModal;
    this.isTransparent = this.isModal;
    
    this.maxBlur = 1;
    
  }
  
  performIn(onInCallback){
    
    const dur = 0.6;
    
    this.scene.visible = true;
    
    if (this.scenePrev){
    
      const filterOut = new PIXI.filters.AlphaFilter(1.0);
      this.scenePrev.filters = [filterOut];
      gsap.to(filterOut, dur, {pixi:{alpha: this.isModal ? 0.5 : 0.0}, ease: Linear.easeNone});      
      gsap.to(this.scenePrev, dur, {pixi: {blur:14}, ease:Power3.easeIn});
      
    }

    if (!this.isModal && !nav.isScenePresentedWithTransparentBg()){
      gsap.to(nav.bg, dur, {pixi: {tint:this.scene.bgColor}, ease:Linear.easeNone});
    }
    
    const filterIn = new PIXI.filters.AlphaFilter(0.0);
    this.scene.filters = [filterIn];
    gsap.to(filterIn, dur, {pixi:{alpha:1.0}, ease:Linear.easeNone});
    
    this.scene.position.set(scaler.stageW*0.5, scaler.stageH*0.5)
    this.scene.pivot.set(scaler.stageW*0.5, scaler.stageH*0.5)
    gsap.from(this.scene, dur, {pixi: {scale: 1.3, blur:this.maxBlur} , ease:Power3.easeOut, onComplete:this.onIn.bind(this), onCompleteParams: [onInCallback]});
    
  }
  
  onIn(onInCallback){
    
    this.scene.filters = [];
    
    this.scene.position.set(0.0, 0.0)
    this.scene.pivot.set(0.0, 0.0)
    
    if (this.scenePrev && !this.isModal){
        this.scenePrev.filters = [];
    }
    
    onInCallback();    
    
  }
  
  performOut(onOutCallback){
    
    let dur = 0.4;
    
    this.scene.position.set(scaler.stageW*0.5, scaler.stageH*0.5)
    this.scene.pivot.set(scaler.stageW*0.5, scaler.stageH*0.5)
    
    const filterOut = new PIXI.filters.AlphaFilter(1.0);
    this.scene.filters = [filterOut];
    gsap.to(filterOut, dur, {pixi:{alpha:0.0}, ease:Linear.easeNone});
    gsap.to(this.scene, dur, {pixi: {scale: 0.9}, ease:Sine.easeIn});
    gsap.to(this.scene, dur, {pixi: {blur:this.maxBlur}, ease:Power3.easeOut});
      
    const delay = 0.0;
    dur = 0.8;
    
    gsap.to(this.scenePrev.filters[0], dur, {pixi:{alpha:1.0}, ease:Linear.easeNone, delay:delay});
    gsap.to(this.scenePrev, dur, {pixi: {blur:0}, ease:Power3.easeIn, delay:delay, onComplete:this.onOut.bind(this), onCompleteParams: [onOutCallback]});
    
  }
  
  onOut(onOutCallback){
    
    this.scene.position.set(0.0, 0.0)
    this.scene.pivot.set(0.0, 0.0)
    
    this.scene.filters = [];
    this.scenePrev.filters = [];
    
    onOutCallback();    
    
  }
  
}