const { utils, scaler } = require(`jixi`);

export default class Ball extends PIXI.Sprite {
  
  constructor(tx){   
     
    super(tx);
    
    
  }
  
  // Called after PSD projection is applied
  init(){
    
    this.on('removed',  this.dispose);
  
    this.tint = Math.random()*0xffffff;
  
    this.x = scaler.stageW*Math.random()
    this.y = scaler.stageH*Math.random()
    
    this.speedX = 100*Math.random()-50;
    this.speedY = 100*Math.random()-50;
    
  }
  
  tick(dt){
    
    this.x += this.speedX
    this.y += this.speedY
    
    // Bounce
    
    let bouncedX = false;
    let bouncedY = false;
        
    if (this.x > scaler.stageW){
      this.speedX = -1 * this.speedX
      this.tint = Math.random()*0xffffff
      bouncedX = true;
    }
  
    if (this.x < 0){
      this.speedX = -1 * this.speedX
      this.tint = Math.random()*0xffffff
      bouncedX = true;
    }
    
    if (this.y > scaler.stageH){
      this.speedY = -1 * this.speedY
      this.tint = Math.random()*0xffffff
      bouncedY = true;
    }
  
    if (this.y < 0){
      this.speedY = -1 * this.speedY
      this.tint = Math.random()*0xffffff
      bouncedY = true;
    }
    
    if (bouncedX && bouncedY){
      this.speedX = 0.0;
      this.speedY = 0.0;
      this.tint = 0xffffff
    }
    
  }
    
  
  // Clean up 
  // --------
  
  dispose(){
      
    this.off('removed',  this.dispose);
    this._healthbar = null;
    
  }
  
}