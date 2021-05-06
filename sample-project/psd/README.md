
Choppy
------

NPM lib `choppy` is required to publish textures. This requires Node + NPM installed.

Texture props
-------------

These properties can be looked up from within the app: 

- *name*
	Name without extension. Also do not include frame numbers for sequence. 
- *x*
	Position relative to art pts
- *y*
	Position relative to art pts
- *regPercX*
	Reg point. Float. Required. 0-1
- *regPercY*  
	Reg point. Float. Required. 0-1
- *hug*  
	Hug stage. String. Optional. Eg. `TL`, `C`, `BR`
- *z*  
	Z-index for parallax transitions. 0 is the background, -1 behind the background, then
	1,2,3,4 etc. Floats ok too. Think of it as in metres.
- *clone*
	Point at texture that will be cloned.
	Must be placholder. 
	Reg must be set as the same as clone target.
- *class*
	Optional styling class - only Btn uses this property for now.

