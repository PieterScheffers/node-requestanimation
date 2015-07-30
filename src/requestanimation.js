var EventEmitter = require('events').EventEmitter;
var util = require('util');
var GameMath = require('game-math');


// Constructor function
function RequestAnimation(fps, callback) {
    EventEmitter.call(this);

    this.changeFPS(fps || 60);

    this._raf = null;
    this._callback = this.changeCallback(callback);
    this._stop = true;
}

// Inherit from EventEmitter
util.inherits(RequestAnimation, EventEmitter);

// Private
RequestAnimation.prototype._loop = function() {
    var now = Date.now();
    var dt = GameMath.deltaTime(this.oldTime, now);

    // requestAnimationFrame defaults to 60 fps
    if( this._fps === 60 || dt > this.interval ) {

        // Emit frame event for event handling
        this.emit('frame', dt);

        // Call callback
        if( this._callback ) this._callback(dt);

        // Set oldTime on actual time
        this.oldTime = this._fps === 60 ? now : now - (dt % this.interval);
    }

    if( !this._stop ) {
        this._raf = requestAnimationFrame(this._loop);
    } else {
        this._raf = null;
    }
};

// Public
RequestAnimation.prototype.start = function() {
    if( !this._stop ) return;

    this._stop = false;
    this.oldTime = Date.now();
    
    this._loop();

    this.emit('start');
};

RequestAnimation.prototype.stop = function() {
    this._stop = true;

    if( this._raf !== null ) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
    }

    this.emit('stop');
};

RequestAnimation.prototype.changeFPS = function(fps) {
    this._fps = Number(fps);
    this.interval = GameMath.interval(this._fps);
};

RequestAnimation.prototype.getFPS = function() {
    return this._fps;
};

RequestAnimation.prototype.changeCallback = function(callback) {
    if( typeof callback === 'function' ) {
        this._callback = callback;
    } else {
        this._callback = null;
    }
};

RequestAnimation.prototype.hasCallBack = function() {
    return this._callback !== null;
};


module.exports = RequestAnimation;
