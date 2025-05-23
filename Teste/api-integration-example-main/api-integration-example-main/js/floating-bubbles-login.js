// Floating Bubbles animation for login background
// Adaptado de floating-bubbles/src/script.js

(function() {
  "use strict";
  var ge1doot = {
    screen: {
      elem:     null,
      callback: null,
      ctx:      null,
      width:    0,
      height:   0,
      left:     0,
      top:      0,
      init: function (id, callback, initRes) {
        this.elem = document.getElementById(id);
        this.callback = callback || null;
        if (this.elem && this.elem.tagName == "CANVAS") this.ctx = this.elem.getContext("2d");
        window.addEventListener('resize', function () {
          this.resize();
        }.bind(this), false);
        this.elem.onselectstart = function () { return false; }
        this.elem.ondrag        = function () { return false; }
        initRes && this.resize();
        return this;
      },
      resize: function () {
        var o = this.elem;
        this.width  = window.innerWidth;
        this.height = window.innerHeight;
        this.left = 0;
        this.top = 0;
        if (this.ctx) {
          this.elem.width  = this.width;
          this.elem.height = this.height;
        }
        this.callback && this.callback();
      }
    }
  }
  var Point = function(x, y) {
    this.x = x;
    this.y = y;
    this.magnitude = x * x + y * y;
    this.computed = 0;
    this.force = 0;
  };
  Point.prototype.add = function(p) {
    return new Point(this.x + p.x, this.y + p.y);
  };
  var Ball = function(parent) {
    var min = .5; // Aumenta o tamanho mínimo das bolhas
    var max = 1.5;
    this.vel = new Point(
      (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.25), (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random())
    );
    this.pos = new Point(
      parent.width * 0.2 + Math.random() * parent.width * 0.6,
      parent.height * 0.2 + Math.random() * parent.height * 0.6
    );
    this.size = (parent.wh / 15) + ( Math.random() * (max - min) + min ) * (parent.wh / 15);
    this.width = parent.width;
    this.height = parent.height;
  };
  Ball.prototype.move = function() {
    if (this.pos.x >= this.width - this.size) {
      if (this.vel.x > 0) this.vel.x = -this.vel.x;
      this.pos.x = this.width - this.size;
    } else if (this.pos.x <= this.size) {
      if (this.vel.x < 0) this.vel.x = -this.vel.x;
      this.pos.x = this.size;
    }
    if (this.pos.y >= this.height - this.size) {
      if (this.vel.y > 0) this.vel.y = -this.vel.y;
      this.pos.y = this.height - this.size;
    } else if (this.pos.y <= this.size) {
      if (this.vel.y < 0) this.vel.y = -this.vel.y;
      this.pos.y = this.size;
    }
    this.pos = this.pos.add(this.vel);
  };
  var LavaLamp = function(width, height, numBalls, c0, c1) {
    this.step = 5;
    this.width = width;
    this.height = height;
    this.wh = Math.min(width, height);
    this.numBalls = numBalls;
    this.balls = [];
    this.c0 = c0;
    this.c1 = c1;
    for (var i = 0; i < numBalls; i++) {
      this.balls.push(new Ball(this));
    }
    this.canvas = null;
    this.ctx = null;
  };
  LavaLamp.prototype.draw = function(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
    for (var i = 0; i < this.numBalls; i++) {
      var b = this.balls[i];
      var g = ctx.createRadialGradient(b.pos.x, b.pos.y, b.size * 0.2, b.pos.x, b.pos.y, b.size);
      g.addColorStop(0, this.c0);
      g.addColorStop(1, this.c1);
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.size, 0, 2 * Math.PI);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };
  LavaLamp.prototype.move = function() {
    for (var i = 0; i < this.numBalls; i++) {
      this.balls[i].move();
    }
  };
  function startBubbles() {
    var canvas = document.getElementById('bubble');
    if (!canvas) return;
    var width = window.innerWidth;
    var height = window.innerHeight;
    // Diminui o número de bolhas e aumenta o tamanho mínimo para espaçamento maior
    var lamp = new LavaLamp(width, height, 10, '#60a5fa', '#16213e');
    lamp.canvas = canvas;
    lamp.ctx = canvas.getContext('2d');
    function animate() {
      lamp.move();
      lamp.draw(lamp.ctx);
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', function() {
      lamp.width = window.innerWidth;
      lamp.height = window.innerHeight;
      lamp.wh = Math.min(lamp.width, lamp.height);
      lamp.canvas.width = lamp.width;
      lamp.canvas.height = lamp.height;
    });
  }
  document.addEventListener('DOMContentLoaded', startBubbles);
})();
