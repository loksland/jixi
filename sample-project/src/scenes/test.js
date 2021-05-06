const {Scene, utils} = require(`jixi`);

import Ball from './../sprites/ball.js';

export default class TemplateScene extends Scene {
    
    constructor(sceneData){
      
      super(sceneData, 'test.psd', 0x000000, false); 
      
    }
    
    didLoad(ev){
      
      super.didLoad(ev)
      
      //this.addArt();
      this.balls = [];
      
      while(this.balls.length < 100){
        let ball = Ball.fromTx(this.psdID + '/ball');
        this.addChild(ball);
        this.balls.push(ball)
      }
      
      this.ready();
      
    }
    
    shouldReloadOnStageResize(stageW, stageH){
  
      this.layout();
      
      return false; // Cancel automatic reload
      
    }
        
    layout(){
      
      
    }
    
    onBtn(btn){
      
    }
    
    onWillArrive(fromModal){
      
      super.onWillArrive(fromModal);
      
    }
    
    onDidArrive(fromModal){
    
      super.onDidArrive(fromModal);
        
      this.resumeTick();
      
    }
    
    pauseTick(){
      ticker.remove(this.tick, this);
    }

    resumeTick(){
      this.pauseTick();
      ticker.add(this.tick, this);
    }

    tick(dt){
      
      for (let ball of this.balls){
        ball.tick(dt)
      }
      
    }
    
    onWillExit(fromModal){
      
      super.onWillExit(fromModal);
      
    }
    
    onDidExit(fromModal){
      
      super.onDidExit(fromModal);
      
      
    }
    
    // Clean up
    // --------
    
    dispose(){
      
      // Do dispose 1st 
      
      super.dispose();
      
    }
    
}


