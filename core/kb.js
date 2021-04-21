
// Keyboard input class


// USAGE:
/*
kb.onceKeyDown(this, this.onKeyDown, 'ENTER')
kb.onKeyUp(this, this.onKeyUp, 'ENTER')
kb.off(this)
onKeyDown(key, keyCode, ev){
  console.log('onKeyDown', ev)
  
}
onKeyUp(key, keyCode, ev){
  console.log('onKeyUP', ev)
}
*/

// Event emitter:
// https://github.com/primus/eventemitter3
// See https://keycode.info/

// NOTE: Props cannot be less than 2 chars in length
const KEYS = {};
KEYS.ENTER = 13;
KEYS.SPACE = 32;

KEYS.ESC = 27;

KEYS.LEFT = 37;
KEYS.RIGHT = 39;
KEYS.UP = 38;
KEYS.DOWN = 40;

KEYS.META = 91; //(COMMAND)
KEYS.CNTRL = 17;

let keyLookup = {};
for (let p in KEYS){
  keyLookup['kc:' + String(KEYS[p])] = p;
}

// Key event types

const KEYDOWN = 'keydown';
const KEYUP = 'keyup';

// Emitter method types 

const EMIT_ON = 'on'
const EMIT_ONCE = 'once'

export default class KB extends PIXI.utils.EventEmitter {
  
  constructor(){   
    
    super();
    
    this.downKeys = {};
    
    this._keydown = this.keydown.bind(this);
    window.addEventListener(
      'keydown', this._keydown, false
    );
    
    this._keyup = this.keyup.bind(this);
    window.addEventListener(
      'keyup', this._keyup, false
    );
    
  }
  
  // Incoming keyboard events
  // ------------------------
  
  keydown(ev){
    this._keyEvent(KEYDOWN, ev);
  };
  
  keyup(ev){
    this._keyEvent(KEYUP, ev);
  };
  
  _keyEvent(evType, ev){
    
    const keyProp = keyLookup['kc:' + String(ev.keyCode)];
    const key = keyProp ? keyProp : String(ev.key);
    const evName = evType + '|' + key;
    // console.log('Firing event:`'+evName+'` (keycode:`'+ev.keyCode+'`)');
    this.downKeys[key] = evType == KEYDOWN;
    this.emit(evName, key, ev);
    // Fire wildcard
    const evNameWild = evType + '|' + '*';
    this.emit(evNameWild, key, ev.keyCode, ev);
    
    // event.preventDefault();
  }
  
  // Register listeners
  // ------------------
  
  // |keys| May be an integer key code, KEY.* prop name or single character string.
  // Can be an asterix for all (`*`)
  onKeyDown(context, listener, ...keys){
    for (let key of keys){
      this._registerKeyEvent(EMIT_ON, KEYDOWN, key, listener, context);
    }
  }
  
  onKeyUp(context, listener, ...keys){
    for (let key of keys){
      this._registerKeyEvent(EMIT_ON, KEYUP, key, listener, context);
    }
  }
  
  onceKeyDown(context, listener, ...keys){
    for (let key of keys){
      this._registerKeyEvent(EMIT_ONCE, KEYDOWN, key, listener, context);
    }
  }
  
  onceKeyUp(context, listener, ...keys){
    for (let key of keys){
      this._registerKeyEvent(EMIT_ONCE, KEYUP, key, listener, context);
    }
  }
  
  _registerKeyEvent(emitterMethod, evType, key, listener, context){
    
    key = this.parseKey(key);
    const evName = evType + '|' + key
    // console.log('Registering listener:`'+evName+'`');
    this[emitterMethod](evName, listener, context); // Key code
    
  }
  
  // Unregister listeners
  // --------------------
  // |keys| Optional 
  // |listener| Optional
  // |context| Optional
  // If none set will clear all
  offKeyDown(context, listener, ...keys){
    if (keys && keys.length > 0){
      for (let key of keys){
        this._off(KEYDOWN, key, listener, context);
      }
    } else {
      this._off(KEYDOWN, null, listener, context);
    }
  }
  
  offKeyUp(context, listener, ...keys){
    if (keys && keys.length > 0){
      for (let key of keys){
        this._off(KEYUP, key, listener, context);
      }
    } else {
      this._off(KEYUP, null, listener, context);
    }
  }
  
  // Will remove key up and key down for 
  // either just context, just listener, just key
  off(context, listener, ...keys){
    
    if (keys && keys.length > 0){
      for (let key of keys){
        this._off(null, key, listener, context);
      }
    } else {
      this._off(null, null, listener, context);
    }
  }
  
  _off(evType, key, listener, context){
    
    let evTypes = evType == null ? [KEYDOWN,KEYUP] : [evType];
    
    for (let _evType of evTypes){
    
      if (key != null && key != '*'){
        key = this.parseKey(key);      
        const evName = _evType + '|' + key;
        console.log('BYe', evName)
        super.off(evName, listener, context);
      
      } else {
    
        //this.off(null, listener, context);
        let evNames = [];
        for (let evName in this._events){ // https://github.com/primus/eventemitter3/blob/master/index.js        
          const parts = evName.split('|');
          if (parts[0] == _evType){
            evNames.push(evName);
          }
        }
        for (let _evName of evNames){
          super.off(_evName, listener, context);
        }
        
      }
    }
  }
  
  
  
  // - - -
  
  isDown(key){
    return this.downKeys[this.parseKey(key)]
  }
  
  // Utils 
  // -----
  
  parseKey(key){
    
    let keyProp;
    if (typeof key == 'number'){
      keyProp = keyLookup['kc:' + String(key)];
      key = keyProp ? keyProp : String.fromCharCode(key);
    } else {    
      key = String(key)
      if (key.length == 1){
        // Eg. Replace ' ' with 'SPACE' - only want 1 event associated with each key
        keyProp = keyLookup['kc:' + String(key.charCodeAt(0))];
        key = keyProp ? keyProp : key;
      } else if (key.length > 1 && !KEYS[String(key)]){
        throw new Error('kb: Key `'+key+'` not found');
      }
    }
    
    return key;
    
  }
  
  // To be called manually
  dispose(){
    if (this._keydown){
      window.removeEventListener('keydown', this._keydown);
      this._keydown = null;
    }
    if (this._keyup){
      window.removeEventListener('keyup', this._keyup);
      this._keyup = null;
    }
  }
  
  
}
