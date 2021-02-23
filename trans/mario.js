import { stageW,stageH,nav,config } from './../../jixi/jixi.js';

export const id = 'mario';

// Usage: 
// - `mario`
// - `mario:ff3300`

// Configuring:
// `trans.mario.setDefaultBgCol(0x00ff00);`

let defaultBgCol = 0x000000;

export default class MarioTrans {
  
  constructor(scene, scenePrev = null, isModal = false, transConfigStr = null){
    
    this.scene = scene;
    this.scenePrev = scenePrev;
    this.isModal = isModal;
    this.isTransparent = false;
    
    this.dur = 0.6;
    
    this.focusDelay = 0.2;
    this.focusDurPerc = 0.3;
    this.midwayDelay = 0.3;
    
    this.bgCol = transConfigStr ? PIXI.utils.string2hex(transConfigStr) : defaultBgCol;
    
  }
  
  //static defaultBgCol = 0x0000ff;
  
  static setDefaultBgCol(_defaultBgCol){
    defaultBgCol = _defaultBgCol;
  }
  
  performIn(onInCallback, reverse = false){
    
    const sceneIn = reverse ? this.scenePrev : this.scene;
    const sceneOut = reverse ? this.scene : this.scenePrev;
    
    sceneIn.visible = false;

    this.maxRad = Math.sqrt(Math.pow(stageW,2)+Math.pow(stageH,2))*0.5;

    this.posIn = sceneIn.getMarioTransPt(false)
    this.posOut = sceneOut ? sceneOut.getMarioTransPt(true) : new PIXI.Point(stageW*0.5, stageH*0.5); 

    this.focusRadIn = sceneIn.getMarioTransFocusRad(false)
    this.focusRadOut = sceneOut ? sceneOut.getMarioTransFocusRad(true) : 100.0;

    this.screen = new PIXI.Graphics()
    this.screen.x = stageW*0.5-this.maxRad;
    this.screen.y = stageH*0.5-this.maxRad;

    nav.sceneHolder.parent.addChildAt(this.screen, nav.sceneHolder.parent.getChildIndex(nav.sceneHolder)+1)

    this.props = {};
    this.props.posX = stageW*0.5;
    this.props.posY = stageH*0.5;
    this.props.rad = this.maxRad; // this.maxRad

    const dur = this.focusRadIn != 0 ? this.dur*(1.0-this.focusDurPerc) : this.dur;
    const rad = this.focusRadIn != 0 ? this.focusRadIn : 0.0;
    const onCompleteFn = this.focusRadIn != 0 ? this.onQuarterWay : this.onHalfWay;
    TweenMax.to(this.props, dur, {rad:rad, posX:this.posIn.x, posY:this.posIn.y, ease:Power3.easeOut, delay:0.0, onUpdate:this.render.bind(this), onComplete:onCompleteFn.bind(this), onCompleteParams:[onInCallback,reverse]});

  }
  
  render() {
    
    this.screen.clear()
      .lineStyle(0) // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
      .beginFill(this.bgCol, 1)
      .drawRect(0, 0, this.maxRad*2.0, this.maxRad*2.0)
      
    if (this.props.rad > 1.0){
      this.screen.beginHole()
        .drawCircle(this.maxRad - stageW*0.5 + this.props.posX, this.maxRad - stageH*0.5 + this.props.posY, Math.max(this.props.rad, 1.0))
        .endHole()
    }
    
    this.screen.endFill()
    
  }
  
  onQuarterWay(onInCallback, reverse = false){
    
    TweenMax.to(this.props, this.dur*this.focusDurPerc, {rad:0.0, ease:Power3.easeIn, delay:this.focusDelay, onUpdate:this.render.bind(this), onComplete:this.onHalfWay.bind(this), onCompleteParams:[onInCallback,reverse]});
    
  }
  
  onHalfWay(onInCallback, reverse = false){

    const sceneIn = reverse ? this.scenePrev : this.scene;
    const sceneOut = reverse ? this.scene : this.scenePrev;
    
    if (!nav.isScenePresentedWithTransparentBg()){
      TweenMax.set(nav.bg, {pixi: {tint:sceneIn.bgColor}});
    }
    
    sceneIn.visible = true;
    if (sceneOut){
      sceneOut.visible = false;
    }
    
    this.props.posX = this.posOut.x;
    this.props.posY = this.posOut.y;

    const dur = this.focusRadOut != 0 ? this.dur*this.focusDurPerc : this.dur;
    const rad = this.focusRadOut != 0 ? this.focusRadOut : this.maxRad;
    const onCompleteFn = this.focusRadOut != 0 ? this.on2QuarterWay : this.onIn;
    const ease = this.focusRadOut != 0 ? Power3.easeOut : Power3.easeIn;
    let tw = {rad:rad, ease:ease, delay:this.midwayDelay, onUpdate:this.render.bind(this), onComplete:onCompleteFn.bind(this), onCompleteParams:[onInCallback,reverse]}
    
    if (this.focusRadOut == 0){
      tw.posX = stageW*0.5;
      tw.posY = stageH*0.5;      
    }
        
    TweenMax.to(this.props, dur, tw);
    
  }
  
  on2QuarterWay(onInCallback, reverse = false){
    
    TweenMax.to(this.props, this.dur*(1.0-this.focusDurPerc), {rad:this.maxRad, posX:stageW*0.5, posY:stageH*0.5, ease:Power3.easeIn, delay:this.focusDelay, onUpdate:this.render.bind(this), onComplete:this.onIn.bind(this), onCompleteParams:[onInCallback,reverse]});
    
  }
  
  onIn(onInCallback, reverse = false){
    
    this.screen.destroy();
    nav.sceneHolder.parent.removeChild(this.screen)
    this.screen = null;
    
    onInCallback();    
    
  }
  
  performOut(onOutCallback){
    
    this.performIn(onOutCallback, true)
    
  }
  
}