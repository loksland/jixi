const { utils, scaler } = require('/Users/maker/Dropbox/Projects/jixi/jixi.js'); // require(`jixi`);

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
    
    this.speedX = 10*Math.random()-5;
    this.speedY = 10*Math.random()-5;
    
  }
  
  tick(dt){
    
    this.x += this.speedX
    this.y += this.speedY
    
    // Bounce
    
    let bouncedX = false;
    let bouncedY = false;
        
    if (this.x > scaler.stageW - this.width*0.5){
      this.x = scaler.stageW - this.width*0.5
      this.speedX = -1 * this.speedX
      this.tint = Math.random()*0xffffff
      bouncedX = true;
    }
  
    if (this.x < this.width*0.5){
      this.x = this.width*0.5
      this.speedX = -1 * this.speedX
      this.tint = Math.random()*0xffffff
      bouncedX = true;
    }
    
    if (this.y > scaler.stageH - this.height*0.5){
      this.y = scaler.stageH - this.height*0.5
      this.speedY = -1 * this.speedY
      this.tint = Math.random()*0xffffff
      bouncedY = true;
    }
  
    if (this.y < this.height*0.5){
      this.y = this.height*0.5
      this.speedY = -1 * this.speedY
      this.tint = Math.random()*0xffffff
      bouncedY = true;
    }
    
    
  }
    
  
  // Clean up 
  // --------
  
  dispose(){

    this.off('removed',  this.dispose);
    
  }
  
}