import { scaler } from './../jixi.js';

// Eg. if set to 0.5 then will try to keep trackees within
// 0.5 of camera dims. 
// Lower = tigher tracking
const VISIBLE_DIM_FACTOR = 0.1;       

// Base camera tracking speed.
// - Lower = Faster, tighter, more eratic
// - Higher = Smoother, looser 
const BASE_CHANGE_FACTOR = 80.0;

// How fast the camera tracking speed can adjust when items off shot.
// - This applies to moving trackees only
// - Lower = Faster, tighter, more eratic
// - Higher = Smoother, looser 
const BASE_CHANGE_CHANGE_FACTOR = 10.0;


// Lower = slower off the mark, smoother ease out
// Higher = more responsive, bouncier settling
const VELOCITY_DAMPENING_FACTOR = 0.75;

export default class Camera extends PIXI.Container {
    
    constructor(psdID){
      
      super();
      
      this.psdID = psdID;      
      this.tickBound = this.tick.bind(this);      
      
      this.dims = {width:scaler.stageW,height:scaler.stageH}
      this.centerPt = new Point(this.dims.width*0.5, this.dims.height*0.5); // Where to aim camera 
      
      // Whether camera is allowed to temporarily pop out of visual limits
      // during tracking to preserve momentum
      this.hardLimitVisibleBounds = false;
      
      // Limits to camera position 
      this.maxVisibleY = false;
      this.minVisibleY = false;
      this.maxVisibleX = false;
      this.minVisibleX = false;
      
      this.parallaxItems = [];
      
      // Camera 
      
      this.delta = new Point()
      this.targetPos = new Point();
      this.velocity = new Point(0.0,0.0)
      
      this._tmp = new Point();
      //this.prevTrackeePos = new Point();
      //this._panPos = new Point();
      
      // Tracking target
      
      this.prevTrackeePos = new Point();
      this.trackeeSpeed = new Point();
      this.futureTrackeePos = new Point();
      
      this.targetOffset = new Point();
      this.inShotFactor = new Point();
      
      this.forceFactorX = 100.0;
      this.forceFactorY = 100.0;
      
      this.zeroPt = new Point(0.0,0.0);
      this.trackeePos = new Point(0.0,0.0)
      
      this.on('removed',  this.dispose);
      
    }
    
    set centerPt(pt){
      this._centerPt = pt
    }
    
    translatePtToCameraPos(internalTargetPt){
      
      this._tmp.x = this.applyVisibleLimitX(internalTargetPt.x, true);
      this._tmp.y = this.applyVisibleLimitY(internalTargetPt.y, true);
      
      this._tmp.x = -this._tmp.x+this._centerPt.x;
      this._tmp.y = -this._tmp.y+this._centerPt.y;
      
      return this._tmp;
      // this.targetPos.set(-this._tmp.x+this._centerPt.x, -this._tmp.y+this._centerPt.y);
      
    }
    
    applyVisibleLimitX(posX, isInternalPos = false){
      
      if (this._minVisibleX !== false){
        posX = isInternalPos ? Math.max(posX, this._minVisibleX + this._centerPt.x) : Math.min(posX, this._minVisibleX);
      }
      
      if (this._maxVisibleX !== false){
        posX = isInternalPos ? Math.min(posX,this._maxVisibleX-(this.dims.width-this._centerPt.x)) : Math.max(posX, this._maxVisibleX-this.dims.width);
      }
      
      return posX;
    }
    
    applyVisibleLimitY(posY, isInternalPos = false){
      
      if (this._minVisibleY !== false){
        posY = isInternalPos ? Math.max(posY,this._minVisibleY + this._centerPt.y) : Math.min(posY,this._minVisibleY)
      }
      
      if (this._maxVisibleY !== false){
        posY = isInternalPos ? Math.min(posY,this._maxVisibleY-(this.dims.height-this._centerPt.y)) : Math.max(posY, this._maxVisibleY-this.dims.height)
      }
      
      return posY;
    }
    
    // Limit props 
    // -----------
    
    set maxVisibleY(y) {
      this._maxVisibleY = y;
    }
    
    set minVisibleY(y) {
      this._minVisibleY = y;
    }
    
    set maxVisibleX(x) {
      this._maxVisibleX = x;
    }
    
    set minVisibleX(x) {
      this._minVisibleX = x;
    }
    
    // Tracking 
    // --------
    
    // Can be set to null to remove tracking
    // - offset (point) Optionally offset trackee position when targetting
    // - limitTrackVelX (int) Optionally disable camera moving in certain direction. -1 = only move to left, 1 = only move to right, 0 = free movement
    // - limitTrackVelY (int) Optionally disable camera moving in certain direction. -1 = only move up, 1 = only move down, 0 = free movement
    
    track(trackee, offset = null, jump = false, limitTrackVelX = 0, limitTrackVelY = 0){
      
      if (!offset){
        this.offset = this.zeroPt.clone();
      } else {
        this.offset = offset;
      }
      
      this.limitTrackVelX = limitTrackVelX;
      this.limitTrackVelY = limitTrackVelY;
      
      if (this.trackee == trackee){
        return;
      }
      
      if (!trackee && this.trackee){
        this.killTracking();    
      }
      
      const wasTracking = Boolean(this.trackee)
      this.trackee = trackee; 
      
      if (this.trackee){
                
        this.prevTrackeePos.set(this.trackee.x + this.offset.x, this.trackee.y + this.offset.y);
        
        this.trackee = trackee;
        if (!wasTracking){
          this.resumeTracking();
        }
        
        if (jump){
          this.velocity.x = 0.0;
          this.velocity.y = 0.0;
          const jumpPos = this.translatePtToCameraPos(this.prevTrackeePos); // Was calculated immediately above
          this.setPos(jumpPos.x, jumpPos.y);
        }
        
      }
    }
    
    pauseTracking(){
      ticker.remove(this.tickBound); 
    }
    
    resumeTracking(){
      ticker.add(this.tickBound); 
    }
    
    killTracking(){
      gsap.killTweensOf(this);
      this.pauseTracking();
      this.target = null;
    }
    
    tick(){
        
        // Convert trackee's position to global scope
        this.trackee.toGlobal(this.zeroPt, this.trackeePos)
        
        // Apply offset 
        this.trackeePos.plus(this.offset)
        
        // Account for camera's position
        this.trackeePos.minus(this.position)
        
        this.trackeeSpeed.x = this.trackeePos.x - this.prevTrackeePos.x;
        this.trackeeSpeed.y = this.trackeePos.y - this.prevTrackeePos.y;      
        this.futureTrackeePos.x = this.trackeePos.x + this.trackeeSpeed.x;
        this.futureTrackeePos.y = this.trackeePos.y + this.trackeeSpeed.y;
        this.prevTrackeePos.x = this.trackeePos.x;
        this.prevTrackeePos.y = this.trackeePos.y;
        this.targetPos.copyFrom(this.translatePtToCameraPos(this.trackeePos)); 
      
      
        
      
      //this.targetPos.copyFrom(this.translatePtToCameraPos(this.trackee.position));    
      
      // In shot factor
      
      // Where (0-1) is `in shot` and (1+) is `out of shot`
      // `VISIBLE_DIM_FACTOR` calibrates to what is considered in shot.
      
      this.targetOffset.x = this.targetPos.x - this.x;
      if (Math.abs(this.trackeeSpeed.x) > 1.0){
        if (this.targetOffset.x > 0){
          this.inShotFactor.x = this.targetOffset.x/this._centerPt.x
        } else {
          this.inShotFactor.x = this.targetOffset.x/-(this.dims.width-this._centerPt.x)
        }
        this.inShotFactor.x *= (1.0/VISIBLE_DIM_FACTOR)
      } else {
        this.inShotFactor.x = 0;
      }
      
      this.targetOffset.y = this.targetPos.y - this.y;  
      if (Math.abs(this.trackeeSpeed.y) > 1.0){
        if (this.targetOffset.y > 0){
          this.inShotFactor.y = this.targetOffset.y/this._centerPt.y
        } else {
          this.inShotFactor.y = this.targetOffset.y/-(this.dims.height-this._centerPt.y)
        }
        this.inShotFactor.y *= (1.0/VISIBLE_DIM_FACTOR)
      } else {
        this.inShotFactor.y = 0;
      }
      
      // Adjust the tracking speed based off whether the trakee is out of shot 
      this.forceFactorX += ((BASE_CHANGE_FACTOR/Math.max(this.inShotFactor.x, 1.0))-this.forceFactorX)/BASE_CHANGE_CHANGE_FACTOR;
      this.forceFactorY += ((BASE_CHANGE_FACTOR/Math.max(this.inShotFactor.y, 1.0))-this.forceFactorY)/BASE_CHANGE_CHANGE_FACTOR;
      
      this.velocity.x += this.targetOffset.x/this.forceFactorX;
      this.velocity.y += this.targetOffset.y/this.forceFactorY;
      
      // Dampen
      
      this.velocity.x *= VELOCITY_DAMPENING_FACTOR;
      this.velocity.y *= VELOCITY_DAMPENING_FACTOR;
      
      // Apply limits
    
      if (this.limitTrackVelX < 0){
        this.velocity.x = Math.max(0.0, this.velocity.x)
      } else if (this.limitTrackVelX > 0){
        this.velocity.x = Math.min(0.0, this.velocity.x)
      }
      
      
      this.setPos(this.x + this.velocity.x, this.y + this.velocity.y);
      
    }
    
    setPos(x, y){
      
      if (this.hardLimitVisibleBounds){
        x = this.applyVisibleLimitX(x);
        y = this.applyVisibleLimitY(y);
      }
      
      this.delta.x = x - this.x
      this.delta.y = y - this.y
      
      this.x = x;
      this.y = y;
      
      this.updateParallax(this.delta);
      
    }
    
    // Parallax 
    
    // - |adjustHeightToCoverVisBtm| assumes reg top, will meet bottom of camera visible range vertically
    registerParallaxItem(dispo, factorX, factorY = null, loopX = null, loopY = null, adjustHeightToCoverVisBtm = false){
      
      if (factorY === null){
        factorY = factorX;
      }
      
      loopX = loopX !== null ? loopX : false;
      if (loopY === null){
        loopY = loopX;
      }
      
      this.parallaxItems.push({dispo:dispo, factorX:factorX, factorY:factorY, loopX:loopX, loopY:loopY});      
      
    }
    
    adjustParallaxItemHeightToCoverVisBtm(dispo){
      for (const p of this.parallaxItems){
        if (p.dispo == dispo){
          p.adjustHeightToCoverVisBtm = true;
          return;
        }
      }
      
    }
    
    updateParallax(delta){

      for (const p of this.parallaxItems){
        p.dispo.x -= delta.x * p.factorX;
        p.dispo.y -= delta.y * p.factorY;
        
        // Calculate the offset from dispo's position to its center
        if ((p.loopX|| p.loopY) && !p._centerOffset){
          p._centerOffset = new Point();            
          p.dispo.getLocalCenter(p._centerOffset);     
          p._centerOffset.x *= p.dispo.scale.x;
          p._centerOffset.y *= p.dispo.scale.y;
        }
        
        if (p.loopX){
          if (this.x + p._centerOffset.x + p.dispo.x < -p.dispo.width*0.5){
            p.dispo.x += scaler.stageW + p.dispo.width*2.0;
          } else if (this.x + p._centerOffset.x + p.dispo.x > scaler.stageW + p.dispo.width*0.5){
            p.dispo.x -= scaler.stageW + p.dispo.width*2.0;
          }
        }
        
        if (p.loopY){
          if (this.y + p._centerOffset.y + p.dispo.y < -p.dispo.height*0.5){
            p.dispo.y += scaler.stageH + p.dispo.height*2.0;
          } else if (this.y + p._centerOffset.y + p.dispo.y > scaler.stageH + p.dispo.height*0.5){
            p.dispo.y -= scaler.stageH + p.dispo.height*2.0;
          }
        }
        
        if (p.adjustHeightToCoverVisBtm && p.dispo.y < -this.y + this.dims.height){
          p.dispo.height = -this.y + this.dims.height - p.dispo.y
        }
      }
      
    }
    
    dispose(){
      
      this.off('removed',  this.dispose);
      this.killTracking();      
      this.parallaxItems = [];
      
    }
    
}


