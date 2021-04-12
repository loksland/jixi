const objectAssignDeep = require(`object-assign-deep`);
export { objectAssignDeep}


export function getFontFamilyFromGoogleFontURL(ff) {
    const start = ff.indexOf('family=');
    if (start === -1) return 'sans-serif';
    let end = ff.indexOf('&', start);
    if (end === -1) end = undefined;
    var fam = ff.slice(start + 7, end).split('+').join(' ');
    //return fam + ':600'
    return fam;
}

export function fontWeightStrToNum(fontWeightStr){

  let str = fontWeightStr.trim().toLowerCase();

  if (str.split('thin').length > 1){
    return 100;
  }
  
  if (str.split('light').length > 1){
    if (str.split('ultra').length > 1 || str.split('extra').length > 1){
        return 200;
    }
    return 300;
  }
  
  if (str.split('normal').length > 1 || str.split('regular').length > 1){
    
    return 400;
  }

  if (str.split('medium').length > 1){
    return 500;
  }
  
  if (str.split('bold').length > 1){
    
    if (str.split('semi').length > 1 || str.split('demi').length > 1){
      return 600;
    } else if (str.split('ultra').length > 1 || str.split('extra').length > 1){
        return 800;
    }
    return 700;
  }
  
  if (str.split('black').length > 1){
      return 900;
  }

  return 400;

/*  
100 - Thin
200 - Extra Light (Ultra Light)
300 - Light
400 - Normal
500 - Medium
600 - Semi Bold (Demi Bold)
700 - Bold
800 - Extra Bold (Ultra Bold)
900 - Black (Heavy)
*/

  // Pixi supports:
  //  ('normal', 'bold', 'bolder', 'lighter' and '100', '200', '300', '400', '500', '600', '700', '800' or '900')
  
  
}
  
export function getProp(ele, prop){
	var style = window.getComputedStyle(ele, null);
	var val = parseInt(style[prop]);
	return(val);
}

export function e(id){
  return id ? document.getElementById(id) : null;
}

export function rnd(num){
  return Math.round(num);
}

// Shallow clone only
export function cloneObj(obj){
  return Object.assign({}, obj);
}

export function coverScale(srcW, srcH, boundsW, boundsH) {

	var ratioSrc = srcW/srcH;
	var ratioBounds = boundsW/boundsH;
	
	if (ratioSrc<ratioBounds) {
		return boundsW/srcW;
	} else {
		return boundsH/srcH;
	}
	
};

export function containScale(srcW, srcH, boundsW, boundsH) {

	var ratioSrc = srcW/srcH;
	var ratioBounds = boundsW/boundsH;
	
	if (ratioSrc>=ratioBounds) {
		return boundsW/srcW;
	} else {
		return boundsH/srcH;
	}
	
};



// If |defineSingleAxisMode| is set to false:
//   Both x and y will resolve, C applies to both x and y, M means centered on y axis, will default to 0 (centered)
// If |defineSingleAxisMode| is set to true:
//   C means centered on x axis, M means centered on y axis and any unset axis will return null. 
export function alignmentStringToXY(alignmentStr, defineSingleAxisMode = false){
  
  // let alignment = defaultAlignment ? defaultAlignment : {x:0,y:0};
  
  alignmentStr = alignmentStr.trim().toUpperCase();
  
  if (!defineSingleAxisMode && alignmentStr.length == 1 && alignmentStr == 'C'){
    return {x:0,y:0};
  } 
  
  if (alignmentStr == 'CC'){
    return {x:0,y:0};
  } 
  
  let alignment = {x:null,y:null}
  
  if (alignmentStr.split('L').length == 2){
    alignment.x = -1;
  } else if (alignmentStr.split('R').length == 2){
    alignment.x = 1;
  } else if (defineSingleAxisMode && alignmentStr.split('C').length == 2){
    alignment.x = 0;
  }
  
  if (alignmentStr.split('T').length == 2){
    alignment.y = -1;
  } else if (alignmentStr.split('B').length == 2){
    alignment.y = 1; 
  } else if (alignmentStr.split('M').length == 2){
    alignment.y = 0;
  } 
  
  // Interpret ambiguous `C`, eg `CT` will resolve `C` to x axis, `CR` will resolve `C` to y axis
  if (!defineSingleAxisMode){
    
    if (alignmentStr.split('C').length == 2){
      if (alignment.x === null && alignment.y !== null){
        alignment.x = 0;
      } else if (alignment.y === null && alignment.x !== null){
        alignment.y = 0;
      }
    }
    
    // Fallback to center if not set
    alignment.x = alignment.x === null ? 0 : alignment.x;
    alignment.y = alignment.y === null ? 0 : alignment.y;
    
  }
    
  return alignment;
  
}

export function setObjPathVal(obj, path, val){

	var ref = obj;
	var pathParts = path.split('.');
  for (let i = 0; i < pathParts.length; i++){
    pathParts[i] = pathParts[i].split('(dot)').join ('.');
  }

	for (var i = 0; i < pathParts.length; i++){
		if (i == pathParts.length - 1){
			ref[pathParts[i]] = val;
		}	else if (ref[pathParts[i]] == undefined) {
			ref[pathParts[i]] =  {};
		}	
		ref = ref[pathParts[i]];
	}
	
	return obj;

}

export function getObjPath(obj, path){

	var ref = obj;
	var pathParts = path.split('.');

	for (var i = 0; i < pathParts.length; i++){

		var path = pathParts[i]

		if (ref[path] == undefined) {

			// Return object length
			if (path == 'length' && typeof obj == 'object' && !Array.isArray(ref)) {
				var k = 0;
				for (var p in ref){
					k++;
				}
				return k;
			}

			// Return array by [index]
			if (path.charAt(path.length-1) == ']' && path.split('[').length == 2){
				var parts = path.split('[');
				var index = parts[1].substr(0, parts[1].length-1);
				if (index >= 0 && ref[parts[0]] != undefined && Array.isArray(ref[parts[0]]) && ref[parts[0]].length > index) {
					return ref[parts[0]][index];
				}
			}

			return undefined;

		}
		ref = ref[path];

		if (i == pathParts.length - 1){

			return ref; // Made it to end
		}
	}

	return undefined;

}

export function pad(subject, padChar, targetLength, padBefore = true){
  
  subject = String(subject);
  
  const padPart = targetLength>subject.length ? padChar.repeat(targetLength-subject.length) : '';
  
  return padBefore ? padPart + subject : subject + padPart;
}

// Maths 
// -----

export function distanceBetweenPoints(ptA, ptB) {
  
  const dx = ptA.x - ptB.x;
  const dy = ptA.y - ptB.y;
  
  return Math.sqrt(dx * dx + dy * dy);
  
}

export function clamp01(value){
  return value < 0 ? 0 : (value > 1 ? 1 : value);
}
export function clampNeg1Pos1(value){
  return value < -1 ? -1 : (value > 1 ? 1 : value);
}

export function angleRadsBetweenPoints(ptA, ptB){
  
  return Math.atan2(ptB.y - ptA.y, ptB.x - ptA.x);
  
}

export function angleDegsBetweenPoints(ptA, ptB){
  
  return radToDeg(angleRadsBetweenPoints(ptA, ptB));
  
}

export function projectFromPointRad(pt, angleRads, dist) {

  return new Point(pt.x + dist * Math.cos(angleRads), pt.y + dist * Math.sin(angleRads));			
  
}

export function projectFromPointDeg(pt, angleDegs, dist) {

  return projectFromPointRad(pt, degToRad(angleDegs), dist);
  
}

// Projects from |ptA| to |ptB| at set distance
export function projectDistance(ptA, ptB, dist){
  
  const dx = ptA.x - ptB.x;
  const dy = ptA.y - ptB.y;
  const fullDist = Math.sqrt(dx * dx + dy * dy);

  return new Point(ptA.x - dx*(dist/fullDist), ptA.y - dy*(dist/fullDist));			
  
}

export function rotatePtAroundPtRad(centerPt, pt, angRads, overwrite = false){
  
  if (overwrite){
    pt.set(Math.cos(angRads) * (pt.x - centerPt.x) - Math.sin(angRads) * (pt.y-centerPt.y) + centerPt.x, Math.sin(angRads) * (pt.x - centerPt.x) + Math.cos(angRads) * (pt.y - centerPt.y) + centerPt.y);
  } else {
    return new Point(Math.cos(angRads) * (pt.x - centerPt.x) - Math.sin(angRads) * (pt.y-centerPt.y) + centerPt.x, Math.sin(angRads) * (pt.x - centerPt.x) + Math.cos(angRads) * (pt.y - centerPt.y) + centerPt.y);
  }
  
}

export function rotatePtAroundPtDeg(centerPt, pt, angDegs, overwrite = false){
  
  return rotatePtAroundPtRad(centerPt, pt, degToRad(angDegs), overwrite);
  
}


// result is in radians, NOT degress
export function angularDeltaFromAnglesRad(sourceAngRads, targetAngRads){
  
  return Math.atan2(Math.sin(targetAngRads-sourceAngRads), Math.cos(targetAngRads-sourceAngRads)); 
  
}

export function angularDeltaFromAnglesDeg(sourceAngDegs, targetAngDegs){
  
  return radToDeg(angularDeltaFromAnglesRad(degToRad(sourceAngDegs), degToRad(targetAngDegs)));
  
}

export function degToRad(deg){
	
	return deg / 180.0 * Math.PI;   

}

export function radToDeg(rad){

	return rad / Math.PI * 180.0;  

}

// Supports '!pattern','pattern*','!dingo*','*dingo' etc
let _globMatchCache = {}; // Caches regex
export function globMatch(subject, glob){
  
  let inverseResults;
  let pattern;
  
  if (!_globMatchCache[glob]){
    
    let _glob = glob;
    inverseResults = false;
    if (_glob.startsWith('!')){
      inverseResults = true;
      _glob = _glob.substr(1)
    }
    
    let asteriskParts = _glob.split('*');
    if (asteriskParts.length == 1){ 
      // Simple case insenstive string match
      pattern = _glob.toLowerCase();
    } else {
      _glob = asteriskParts.join('__asterisk__');
      _glob = escapeRegExp(_glob);
      _glob = _glob.split('__asterisk__').join('.*');
      pattern = new RegExp(_glob, 'i');
    }
    
    _globMatchCache[glob] = {inverseResults:inverseResults, pattern:pattern}
    
  } else {
    
    inverseResults = _globMatchCache[glob].inverseResults
    pattern = _globMatchCache[glob].pattern
    
  }

  const result = typeof pattern === 'string' ? subject.toLowerCase() == pattern : subject.match(pattern);
  return inverseResults ? !result : result;
  
}

export function escapeRegExp(string) {
  
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
  
}


// Returns the intersection point between two infinite length lines,
// defined by a1 -> a2 and b1 -> b2.
export function intersectLineLine(a1, a2, b1, b2) {
  
  let res = null;
  const ua_t = (b2.x-b1.x)*(a1.y-b1.y)-(b2.y-b1.y)*(a1.x-b1.x);
  const ub_t = (a2.x-a1.x)*(a1.y-b1.y)-(a2.y-a1.y)*(a1.x-b1.x);
  const u_b = (b2.y-b1.y)*(a2.x-a1.x)-(b2.x-b1.x)*(a2.y-a1.y);
  if (u_b != 0) {
    const ua = ua_t/u_b;
    const ub = ub_t/u_b;
    res = new Point(a1.x+ua*(a2.x-a1.x), a1.y+ua*(a2.y-a1.y));
  } 
  return res;
}

// Returns the intersection point between two closed lines.
export function intersectSegmentSegment(a1, a2, b1, b2) {
  
  var res = null;
  var ua_t = (b2.x-b1.x)*(a1.y-b1.y)-(b2.y-b1.y)*(a1.x-b1.x);
  var ub_t = (a2.x-a1.x)*(a1.y-b1.y)-(a2.y-a1.y)*(a1.x-b1.x);
  var u_b = (b2.y-b1.y)*(a2.x-a1.x)-(b2.x-b1.x)*(a2.y-a1.y);
  if (u_b != 0) {
    var ua = ua_t/u_b;
    var ub = ub_t/u_b;
    if (0<=ua && ua<=1 && 0<=ub && ub<=1) {
      res = new Point(a1.x+ua*(a2.x-a1.x), a1.y+ua*(a2.y-a1.y));
    } 
  } 
  
  return res;
};

// Returns the intersection point between two rays,
// Defined as an infinite line from pivot point 1 through point point 2.
export function intersectRayRay(a1, a2, b1, b2) {

  var res = null;
  var ua_t = (b2.x-b1.x)*(a1.y-b1.y)-(b2.y-b1.y)*(a1.x-b1.x);
  var ub_t = (a2.x-a1.x)*(a1.y-b1.y)-(a2.y-a1.y)*(a1.x-b1.x);
  var u_b = (b2.y-b1.y)*(a2.x-a1.x)-(b2.x-b1.x)*(a2.y-a1.y);
  if (u_b != 0) {
    var ua = ua_t/u_b;
    var ub = ub_t/u_b;
    if (ua>=0 && ub>=0) {
      res = new Point(a1.x+ua*(a2.x-a1.x), a1.y+ua*(a2.y-a1.y));
    } 
  }
  
  return res;

};


export function intersectSegmentBox(l1, l2, xb, yb, wb, hb) {
  
  return intersectSegmentSegment(l1.x, l1.y, l2.x, l2.y, xb, yb, xb, yb + hb) || 
        intersectSegmentSegment(l1.x, l1.y, l2.x, l2.y, xb + wb, yb, xb + wb, yb + hb) ||
        intersectSegmentSegment(l1.x, l1.y, l2.x, l2.y, xb, yb + hb, xb + wb, yb + hb) ||
        intersectSegmentSegment(l1.x, l1.y, l2.x, l2.y, xb, yb, xb + wb, yb) 
  
}


export function intersectSegmentRect(l1, l2, rect) {
  
  return intersectSegmentBox(l1, l1, rect.x, rect.y, rect.width, rect.height)
  
}


// Returns an array of intersection points (0-2) between a circle and line segment
export function intersectionPtsBetweenCircleAndLineSeg(lineSegP0, lineSegP1, circleCenter, circleRadius){
  
    // circle, line
    let a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    v1 = {};
    v2 = {};
    v1.x = lineSegP1.x - lineSegP0.x;
    v1.y = lineSegP1.y - lineSegP0.y;
    v2.x = lineSegP0.x - circleCenter.x;
    v2.y = lineSegP0.y - circleCenter.y;
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circleRadius * circleRadius));
    if(isNaN(d)){ // no intercept
      return [];
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;    
    retP1 = {};   // return points
    retP2 = {}  
    ret = []; // return array
    if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
        retP1.x = lineSegP0.x + v1.x * u1;
        retP1.y = lineSegP0.y + v1.y * u1;
        ret.push(retP1);
    }
    if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
        retP2.x = lineSegP0.x + v1.x * u2;
        retP2.y = lineSegP0.y + v1.y * u2;
        ret.push(retP2);
    }       
    return ret;
    
}

export function getIntersectionPointsBetweenTwoCircles(pt_circle0_pos, int_circle0_radius, pt_circle1_pos, int_circle1_radius) {

	//http://local.wasp.uwa.edu.au/~pbourke/geometry/2circle/

	var d = this.distanceBetweenPoints(pt_circle0_pos, pt_circle1_pos);

	if (d>int_circle0_radius+int_circle1_radius || d<Math.abs(int_circle0_radius-int_circle1_radius)) {

		return [];

	} else {

		var a = (Math.pow(int_circle0_radius, 2)-Math.pow(int_circle1_radius, 2)+Math.pow(d, 2))/(2*d);
		var h = Math.sqrt(Math.pow(int_circle0_radius, 2)-Math.pow(a, 2));

		var pt_p2 = new Object();
		pt_p2["x"] = pt_circle0_pos["x"]+((a*(pt_circle1_pos["x"]-pt_circle0_pos["x"]))/d);
		pt_p2["y"] = pt_circle0_pos["y"]+((a*(pt_circle1_pos["y"]-pt_circle0_pos["y"]))/d);
		var pt_p3_a = {x:pt_p2["x"]+(h*(pt_circle1_pos["y"]-pt_circle0_pos["y"]))/d, y:pt_p2["y"]-(h*(pt_circle1_pos["x"]-pt_circle0_pos["x"]))/d};
		//var pt_p3_b = {x:pt_p2["x"]  - (h * ( pt_circle1_pos["y"] - pt_circle0_pos["y"] )) / d,y:pt_p2["y"] + (h * ( pt_circle1_pos["x"] - pt_circle0_pos["x"] )) / d};
		// The above line has been optimised to the one below ->
		var pt_p3_b = {x:-pt_p3_a["x"]+(2*pt_p2["x"]), y:-pt_p3_a["y"]+(2*pt_p2["y"])};

		return [pt_p3_a, pt_p3_b];

	}
};

// Usage: const _psdInfo = requireAll(require.context('./../../app/ui', false, /.json$/));
export function requireAll( requireContext ) {
  return requireContext.keys().map( requireContext );
}


// From underscrore.js
// Usage: app.renderer.on('resize', debounce(onResize, 1000));
export function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        let args = arguments;
        let later = () => {
            timeout = null;
            if (!immediate) {
              func.apply(this, args);
            }
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
          func.apply(this, args);
        }
    }
}


// TweenMax convenience methods

export function killWaitsFor(callback) {
  TweenMax.killTweensOf(callback);
}

// Optionally set (this) as first arg and will be used as *this* argument
export function wait(){
  
  let args = Array.from(arguments);
  
  let thisArg = null;
  if (typeof args[0] !== 'number'){
    thisArg = args.shift();
  }
  
  if (args.length == 0){
    args[0] = 0.0; // Delay
  }
  
  if (args.length == 1){
    args[1] = null; // Callback
  }
  
  if (args.length == 2){
    args[2] = null; // params
  }
  
  if (thisArg !== null){
    args[3] = thisArg;
  }
  
  TweenMax.delayedCall.apply(thisArg, args);
  
}


/*
// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
export function intersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};



public static function roundToNearest(val, step = 1) {
  
  return Math.round(val * (1 / step)) / (1 / step);
  
}

public static function closestValueInArray(target, numArray:Array) {
  
  var minDiff = -1;
  
  var closestVal = target;
  for (var i:uint = 0; i < numArray.length; i++){
    if (target == numArray[i]){
      minDiff = 0;
      closestVal = numArray[i];
      break;
    } else if (i == 0 || Math.abs(numArray[i] - target) < minDiff){
      minDiff = Math.abs(numArray[i] - target);
      closestVal = numArray[i];
    }
  }
  
  return closestVal;
  
}

// Assumes numArray items are in ascending order
public static function closestValueInArrayOverOrEqualTo(target, numArray:Array) {
  var closestVal = target;
  for (var i:uint = 0; i < numArray.length; i++){
    if (numArray[i] >= target){
      closestVal = numArray[i];
      break;
    }
    closestVal = numArray[i];
  }
  
  return closestVal;
}


// source: https://github.com/DaVikingCode/Citrus-Engine/blob/master/src/citrus/math/MathUtils.as
public static function randomInt(min:int, max:int):int {
  return Math.floor(Math.random() * (1 + max - min)) + min;
}
    
public static function random1PlusMinus() {			
  return (Math.random() * 2) - 1;			
}

// source: https://github.com/DaVikingCode/Citrus-Engine/blob/master/src/citrus/math/MathUtils.as
public static function getRandomArrayItem(arr:Array):*
{
  return arr[randomInt(0, arr.length-1)];
}

public static function midPointBetweenPoints(aX, aY, bX, bY) {
  
  return new Point(aX + (bX-aX)*0.5,	aY + (bY-aY)*0.5);
  
}


*/

export function shuffle(array) {

  let counter = array.length;
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

// Usage:
// utils.darkenCol(0xff3300, 50); // 50% darken
// - amt % int from -100 (darken) to 100 (lighten)
export function darkenCol(col, amt) {
  return lightenCol(col, -Math.abs(amt))
}
  
export function lightenCol(rgb, brite)
{
  var r;
  var g;
  var b;
  
  if (brite == 0)
    return rgb;
  
  if (brite < 0)
  {
    brite = (100 + brite) / 100;
    r = ((rgb >> 16) & 0xFF) * brite;
    g = ((rgb >> 8) & 0xFF) * brite;
    b = (rgb & 0xFF) * brite;
  }
  else // bright > 0
  {
    brite /= 100;
    r = ((rgb >> 16) & 0xFF);
    g = ((rgb >> 8) & 0xFF);
    b = (rgb & 0xFF);
    
    r += ((0xFF - r) * brite);
    g += ((0xFF - g) * brite);
    b += ((0xFF - b) * brite);
    
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);
  }

  return (r << 16) | (g << 8) | b;
}


export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

