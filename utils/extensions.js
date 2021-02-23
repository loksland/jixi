import { stageW, stageH, utils } from './../jixi.js';
 
// Extensions
// ----------

Object.defineProperty(PIXI.Sprite.prototype, 'localWidth', {
    get: function () {
        return this.width/this.scale.x;
    }
});

Object.defineProperty(PIXI.Sprite.prototype, 'localHeight', {
    get: function () {
        return this.height/this.scale.y;
    }
});

// Gets the local coord of the center point. 
// Calculation takes into account anchor position.
// - `pt` optional point to assign values to 
PIXI.Sprite.prototype.getLocalCenter = function(pt = null){
  
  pt = pt ? pt : new Point();
  pt.x = this.localWidth*0.5 - this.anchor.x * this.localWidth;
  pt.y = this.localHeight*0.5 - this.anchor.y * this.localHeight;
  return pt;
  
};

// Gets the local coord of the specified corner of sprite.
// Calculation takes into account anchor position.
// - `hoz` (-1,0,1) -1 = left, 0 = center, 1 = right
// - `vert` (-1,0,1) -1 = top, 0 = middle, 1 = bottom
// - `pt` optional point to assign values to 
PIXI.Sprite.prototype.getLocalCornerPos = function(hozAlign, vertAlign, pt = null){
  
  pt = pt ? pt : new Point();
  pt.x = this.localWidth*0.5 + hozAlign*this.localWidth*0.5  - this.anchor.x * this.localWidth;
  pt.y = this.localHeight*0.5 + vertAlign*this.localHeight*0.5  -this.anchor.y * this.localHeight;
  return pt;
  
};


PIXI.Sprite.prototype.getLocalCenter = function(pt = null){
  
  pt = pt ? pt : new Point();
  pt.x = this.localWidth*0.5 - this.anchor.x * this.localWidth;
  pt.y = this.localHeight*0.5 - this.anchor.y * this.localHeight;
  return pt;
  
};

PIXI.Sprite.prototype.hitTestRect = function(globalPos){
  
  const localPos = this.toLocal(globalPos);
  const topLeft = this.getLocalCornerPos(-1, -1);
  const dX = localPos.x - topLeft.x;
  const dY = localPos.y - topLeft.y;
  return dX >= 0.0 && dX <= this.localWidth && dY >= 0.0 && dY <= this.localHeight
  
}

PIXI.Sprite.prototype.hitTestEllipse = function(globalPos){
  
  let localPos = this.toLocal(globalPos);

  // Un-elipticise localPos
  if (this.width > this.height){
    localPos.y *= this.width/this.height
  } else {
    localPos.x *= this.height/this.width
  }
  
  return utils.distanceBetweenPoints(localPos, this.getLocalCenter()) < 0.5*Math.max(this.localWidth, this.localHeight)
  
}

// Note: will not work with sprites with scale flipped 
PIXI.Sprite.prototype.enterTestRect = function(startPosGlobal, endPosGlobal, globalResults = true, checkMidpoint = false){
  
  // If end pos is not over rect then test mid/quarter point etc.
  let endIsHit = this.hitTestRect(endPosGlobal);
  if (!endIsHit && checkMidpoint){   
    if (!this.ptMids){
      this.ptMids = [0.5]; // [0.5, 0.25, 0.75]
    }
    for (const mid of this.ptMids){     
      let _epX = endPosGlobal.x
      let _epY = endPosGlobal.y
      endPosGlobal.x = startPosGlobal.x + (endPosGlobal.x-startPosGlobal.x)*mid;
      endPosGlobal.y = startPosGlobal.y + (endPosGlobal.y-startPosGlobal.y)*mid;
      endIsHit = this.hitTestRect(endPosGlobal);
      if (endIsHit){
        break;
      } else {
        endPosGlobal.x = _epX;
        endPosGlobal.y = _epY;        
      }
    }
  }
  if (!endIsHit){
    return {hit:false};
  }
  
  let localStartPos = this.toLocal(startPosGlobal); //.clone()
  let localEndPos = this.toLocal(endPosGlobal); //.clone()

  const cornerTL = this.getLocalCornerPos(-1, -1);
    
  const dX = localEndPos.x - cornerTL.x;
  const dY = localEndPos.y - cornerTL.y;

  let intersectionPosInternal;
  let surfaceNormalAngleInternal;

  //if (dX >= 0.0 && dX <= this.localWidth && dY >= 0.0 && dY <= this.localHeight){
  
  const cornerTR = new Point(cornerTL.x+this.localWidth, cornerTL.y);
  const cornerBL = new Point(cornerTL.x, cornerTL.y+this.localHeight);
  const cornerBR = new Point(cornerTL.x+this.localWidth, cornerTL.y+this.localHeight);
  
  if (localStartPos.x < cornerTL.x) { 
    
    // Left hand side
    intersectionPosInternal = utils.intersectSegmentSegment(localStartPos, localEndPos, cornerTL, cornerBL) 
    surfaceNormalAngleInternal = 180.0;
    
  } else if (localStartPos.x > cornerTR.x) { 
    
    // Right hand side
    intersectionPosInternal = utils.intersectSegmentSegment(localStartPos, localEndPos, cornerTR, cornerBR) 
    surfaceNormalAngleInternal = 0.0;
    
  } 
  
  if (!intersectionPosInternal){
    if (localStartPos.y > cornerTL.y) { 
      
      // Bottom
      intersectionPosInternal = utils.intersectSegmentSegment(localStartPos, localEndPos, cornerBL, cornerBR) 
      surfaceNormalAngleInternal = 90.0;
      
    } else if (localStartPos.y < cornerBL.y) { 
      
      // Top
      intersectionPosInternal = utils.intersectSegmentSegment(localStartPos, localEndPos, cornerTL, cornerTR) 
      surfaceNormalAngleInternal = -90.0;
      
    }
  }
  
  if (intersectionPosInternal){
  
    if (globalResults){
      return {hit:true, intersectionPos:this.toGlobal(intersectionPosInternal), surfaceNormalAngle:this.angleToGlobal(surfaceNormalAngleInternal)};
    } else {
      return {hit:true, intersectionPos:intersectionPosInternal, surfaceNormalAngle:surfaceNormalAngleInternal};
    }
    
  }
  
  //}

  return {hit:false};
  
}

PIXI.Sprite.prototype.enterTestEllipse = function(startPosGlobal, endPosGlobal, globalResults = true, checkMidpoint = false){
  
  // If end pos is not over ellipse then test mid/quarter point etc.
  let endIsHit = this.hitTestEllipse(endPosGlobal);
  if (!endIsHit && checkMidpoint){   
    if (!this.ptMids){
      this.ptMids = [0.5]; // [0.5, 0.25, 0.75]
    }
    for (const mid of this.ptMids){     
      let _epX = endPosGlobal.x
      let _epY = endPosGlobal.y
      endPosGlobal.x = startPosGlobal.x + (endPosGlobal.x-startPosGlobal.x)*mid;
      endPosGlobal.y = startPosGlobal.y + (endPosGlobal.y-startPosGlobal.y)*mid;
      endIsHit = this.hitTestEllipse(endPosGlobal);
      if (endIsHit){
        break;
      } else {
        endPosGlobal.x = _epX;
        endPosGlobal.y = _epY;        
      }
    }
  }
  if (!endIsHit){
    return {hit:false};
  }
  
  let localStartPos = this.toLocal(startPosGlobal); //.clone()
  let localEndPos = this.toLocal(endPosGlobal); //.clone()
   
  // Un-elipticise localEndPos
  let scaleFactorX = 1.0;
  let scaleFactorY = 1.0;
  if (this.height > this.width){
    scaleFactorX = this.height/this.width
  } else {
    scaleFactorY = this.width/this.height
  } 

  localEndPos.x *= scaleFactorX
  localEndPos.y *= scaleFactorY

  localStartPos.x *= scaleFactorX
  localStartPos.y *= scaleFactorY

  const rad = 0.5*Math.max(this.localWidth, this.localHeight);
  const c = this.getLocalCenter()
  // const dist = utils.distanceBetweenPoints(c, localEndPos);

  //if (dist < rad){
 
  const result = utils.intersectionPtsBetweenCircleAndLineSeg(localStartPos, localEndPos, c, rad);
  
  if (result.length > 0){
    let intersectionPosInternal = result[0];
          
    let surfaceNormalAngleInternal = utils.angleDegsBetweenPoints(c, intersectionPosInternal); 
          
    // Convert to eliptical position
    intersectionPosInternal.x*=(1.0/scaleFactorX)
    intersectionPosInternal.y*=(1.0/scaleFactorY)
    
    if (globalResults){
      return {hit:true, intersectionPos:this.toGlobal(intersectionPosInternal), surfaceNormalAngle:this.angleToGlobal(surfaceNormalAngleInternal)};
    } else {
      return {hit:true, intersectionPos:intersectionPosInternal, surfaceNormalAngle:surfaceNormalAngleInternal};
    }
    
  }
    
  //} 

  return {hit:false};
  
}

Math.sinDeg = function(deg){
  
  return Math.sin(deg / 180.0 * Math.PI);   
  
}

Math.cosDeg = function(deg){
  
  return Math.cos(deg / 180.0 * Math.PI);   
  
}

PIXI.DisplayObject.prototype.angleToGlobal = function(localAngle){
  
  if (!this._angleLocalGlobalOrigin){
    this._angleLocalGlobalOrigin = new Point(0.0,0.0);
    this._angleLocalGlobalTarget = new Point(0.0,0.0);
  }
  
  this._angleLocalGlobalOrigin.set(0.0, 0.0)
  this._angleLocalGlobalTarget.set(1.0 * Math.cosDeg(localAngle), 0.0 + 1.0 * Math.sinDeg(localAngle))
  
  this.toGlobal(this._angleLocalGlobalOrigin, this._angleLocalGlobalOrigin)
  this.toGlobal(this._angleLocalGlobalTarget, this._angleLocalGlobalTarget)
  
  return utils.angleDegsBetweenPoints(this._angleLocalGlobalOrigin, this._angleLocalGlobalTarget);
  
}

PIXI.DisplayObject.prototype.angleToLocal = function(globalAngle){
  
  if (!this._angleLocalGlobalOrigin){
    this._angleLocalGlobalOrigin = new Point(0.0,0.0);
    this._angleLocalGlobalTarget = new Point(0.0,0.0);
  }
  
  this._angleLocalGlobalOrigin.set(0.0, 0.0);
  this._angleLocalGlobalTarget.set(1.0 * Math.cosDeg(globalAngle), 0.0 + 1.0 * Math.sinDeg(globalAngle));
  
  this.toLocal(this._angleLocalGlobalOrigin, null, this._angleLocalGlobalOrigin);
  this.toLocal(this._angleLocalGlobalTarget, null, this._angleLocalGlobalTarget);
  
  return utils.angleDegsBetweenPoints(this._angleLocalGlobalOrigin, this._angleLocalGlobalTarget);
  
}


PIXI.DisplayObject.prototype.bringToFront = function(){
  
  this.parent.setChildIndex(this, this.parent.children.length - 1)
  
}

PIXI.DisplayObject.prototype.sendToBack = function(){
  
  this.parent.setChildIndex(this, 0)
  
}

PIXI.DisplayObject.prototype.debugStack = function(level = 0){
  
  let output = []
  
  if (level == 0){
    output.push(this.name);
    output.push('='.repeat(this.name.length));
  } else {
    output.push('  '.repeat(level-1) + '- ' + this.name);
  }
  for (let i = this.children.length - 1; i >= 0; i--){
    let child = this.children[i];
    output = output.concat(child.debugStack(level+1));
  }
  
  
  if (level == 0){
    window['c' + 'onsole']['l' + 'og'](output.join('\n'))
  } else {
    return output;
  }
}


PIXI.DisplayObject.prototype.setPivotWithoutMoving = function(pivotX, pivotY){
  
  const pivotOffset = new Point(pivotX-this.pivot.x,pivotY-this.pivot.y);
  this.pivot.set(pivotX, pivotY);
  
  const angOffset = 0.0;
  const pivotOffsetScaled = new Point(pivotOffset.x * this.scale.x, pivotOffset.y * this.scale.y)
  const zeroPt = new Point(0.0,0.0);
  const pivotOffsetDist = utils.distanceBetweenPoints(zeroPt, pivotOffsetScaled);
  const pivotOffsetAng = utils.angleDegsBetweenPoints(zeroPt, pivotOffsetScaled);
  
  this.position = utils.projectFromPointDeg(this.position, pivotOffsetAng+this.angle, pivotOffsetDist);
  
}

PIXI.Graphics.prototype.dashedLineTo = function(fromPt, toPt, dash = 16.0, gap = 8.0, offsetPerc = 0.0) {
  
  let penDist = (gap + dash) * offsetPerc;
  if (penDist > gap){
    penDist -= gap + dash;
  }
  let penEnabled = false;
  let totalDist = utils.distanceBetweenPoints(fromPt, toPt);
  
  let penPt;
  if (penDist > 0.0){
    penPt = utils.projectDistance(fromPt, toPt, penDist);
    this.moveTo(penPt.x, penPt.y);
  } else {
    this.moveTo(fromPt.x, fromPt.y);
  }
  
  while(penDist < totalDist){
    penEnabled = !penEnabled;
    if (penEnabled){
      penDist = Math.min(totalDist, penDist + dash);
      penPt = utils.projectDistance(fromPt, toPt, penDist);
      this.lineTo(penPt.x, penPt.y);
    } else {
      penDist = Math.min(totalDist, penDist + gap);
      penPt = utils.projectDistance(fromPt, toPt, penDist);
      this.moveTo(penPt.x, penPt.y);
    }
  }
  
};



PIXI.DisplayObject.prototype.adjustForParentScale = function(){
  this.scale.x *= Math.abs(1.0/this.parent.scale.x);
  this.scale.y *= Math.abs(1.0/this.parent.scale.y);
}

PIXI.Point.prototype.plus = function(pt){
  
  this.x += pt.x
  this.y += pt.y
  return this;
}

PIXI.Point.prototype.minus = function(pt){

  this.x -= pt.x
  this.y -= pt.y
  return this;
}
