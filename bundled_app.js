(() => {
  // src/utils.js
  var Utils = class {
    static rotatePoint(Vect, a) {
      var { x, y } = Vect;
      y = -y;
      let X = x * Math.cos(a) + y * Math.sin(a);
      let Y = y * Math.cos(a) - x * Math.sin(a);
      Y = -Y;
      return new Vector(X, Y);
    }
    static getDist(v1, v2) {
      let x = v2.x - v1.x;
      let y = v2.y - v1.y;
      let dist = Math.sqrt(x * x + y * y);
      return dist;
    }
    static rotatePoints(VectArr, a) {
      let newPoints = [];
      VectArr.forEach((p) => {
        newPoints.push(this.rotatePoint(p, a));
      });
      return newPoints;
    }
    static getForceByAngle(angle) {
      let rad = Math.PI / 180 * angle;
      let x = Math.cos(rad);
      let y = Math.sin(rad);
      return new Vector(x, y);
    }
    static getAngleBetweenPoints(origin, target) {
      let a = Math.atan2(target.y - origin.y, target.x - origin.x) * 180 / Math.PI;
      return a;
    }
  };

  // src/vector.js
  function Vector(x, y) {
    this.x = x;
    this.y = y;
  }
  Vector.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
  };
  Vector.prototype.copy = function(vect) {
    return new Vector(this.x, this.y);
  };
  Vector.prototype.add = function(v2) {
    return new Vector(this.x + v2.x, this.y + v2.y);
  };
  Vector.prototype.addApply = function(v2) {
    this.x += v2.x;
    this.y += v2.y;
  };
  Vector.prototype.subtract = function(v2) {
    return new Vector(this.x - v2.x, this.y - v2.y);
  };
  Vector.prototype.subtractApply = function(v2) {
    this.x -= v2.x;
    this.y -= v2.y;
  };
  Vector.prototype.divide = function(a) {
    if (typeof a == "object") {
      return new Vector(this.x / a.x, this.y / a.y);
    } else if (typeof a == "number") {
      return new Vector(this.x / a, this.y / a);
    }
  };
  Vector.prototype.divideApply = function(a) {
    if (typeof a == "object") {
      this.x /= a.x;
      this.y /= a.y;
    } else if (typeof a == "number") {
      this.x /= a;
      this.y /= a;
    }
  };
  Vector.prototype.multiply = function(a) {
    if (typeof a == "object") {
      return new Vector(this.x * a.x, this.y * a.y);
    } else if (typeof a == "number") {
      return new Vector(this.x * a, this.y * a);
    }
  };
  Vector.prototype.multiplyApply = function(a) {
    if (typeof a == "object") {
      this.x *= a.x;
      this.y *= a.y;
    } else if (typeof a == "number") {
      this.x *= a;
      this.y *= a;
    }
  };
  Vector.prototype.normalise = function() {
    return this.divide(Utils.getDist(new Vector(0, 0), this));
  };
  Vector.prototype.normaliseApply = function() {
    return this.divideApply(Utils.getDist(new Vector(0, 0), this));
  };
  Vector.prototype.getMagnitude = function() {
    return Utils.getDist(new Vector(0, 0), this);
  };

  // src/rocket.js
  var Rocket = class {
    //{{{
    points = [new Vector(13, 0), new Vector(-13, -10), new Vector(-13, 10)];
    // the points are aligned horizontally, resulting in the rocket to be facing right side
    p = new Vector(0, 0);
    // Position   (initialised in constructor)
    v = new Vector(0, 0);
    // Velocity
    a = new Vector(0, 0);
    // Acceleration
    friction = 1;
    // Inverse (more of this value, less friction)
    bullets = [];
    avgRadius = 10;
    // Only for collision
    rotation = 270;
    rotationVel = 0;
    isAlive = true;
    justShot = false;
    constructor(game2, x = 0, y = 0) {
      this.game = game2;
      this.p = new Vector(x, y);
      for (let i = 0; i < 3; i++) {
        this.points[i].x += 5;
      }
    }
    update(delta) {
      this.a.set(0, 0);
      this.v.multiplyApply(Math.pow(this.friction, delta));
      if (this.isAlive) {
        if (key[87] == true) {
          let thrustAcc = Utils.getForceByAngle(this.rotation);
          this.a = thrustAcc.copy().normalise();
          this.a.multiplyApply(200);
        } else {
          this.a.set(0, 0);
        }
        if (key[65] == true) {
          if (this.rotationVel > 0) {
            this.rotationVel = 0;
          }
          if (this.rotationVel > -200) {
            this.rotationVel -= 50;
          }
        }
        if (key[68] == true) {
          if (this.rotationVel < 0) {
            this.rotationVel = 0;
          }
          if (this.rotationVel < 200) {
            this.rotationVel += 50;
          }
        }
        if (key[65] != true && key[68] != true) {
          if (this.rotationVel > 1) {
            this.rotationVel -= 50;
          } else if (this.rotationVel < -1) {
            this.rotationVel += 50;
          } else {
            this.rotationVel = 0;
          }
        }
        if (this.rotation < 0) {
          this.rotation += 360;
        }
        if (this.rotation >= 360) {
          this.rotation -= 360;
        }
        if (key[38] && !this.justShot) {
          this.shoot(this.rotation);
          this.justShot = true;
        }
        if (key[38] == false && this.justShot) {
          this.justShot = false;
        }
      } else {
        if (this.rotationVel > 1) {
          this.rotationVel -= 10;
        } else if (this.rotationVel < -1) {
          this.rotationVel += 10;
        } else {
          this.rotationVel = 0;
        }
      }
      for (let i = 0; i < this.bullets.length; i++) {
        let bullet = this.bullets[i];
        let hit = false;
        for (let a = 0; a < game.rocks.length; a++) {
          let rock = game.rocks[a];
          let dist = Utils.getDist(bullet.p, rock.p);
          if (dist < rock.radius + bullet.radius) {
            game.rocks.splice(a, 1);
            hit = true;
            game.camera.shake(15);
            break;
          } else if (dist < rock.radius + bullet.radius + 30) {
            let halfdist = Utils.getDist(bullet.p.subtract(bullet.v.divide(2).multiply(delta)), rock.p);
            if (halfdist < rock.radius + bullet.radius) {
              game.rocks.splice(a, 1);
              hit = true;
              game.camera.shake(15);
              break;
            }
          }
        }
        if (hit == true) {
          this.bullets.splice(i, 1);
          continue;
        }
        this.bullets[i].oldScreenP = this.bullets[i].p.copy();
        this.bullets[i].p.addApply(this.bullets[i].v.multiply(delta));
        this.bullets[i].timeRemaining -= delta;
        if (this.bullets[i].timeRemaining < 0) {
          this.bullets.splice(i, 1);
          i -= 1;
        }
      }
      for (let a = 0; a < game.rocks.length; a++) {
        let rock = game.rocks[a];
        let dist = Utils.getDist(rock.p, this.p);
        if (dist < this.avgRadius + rock.radius) {
          this.onCrashed();
        }
      }
      if (this.v.getMagnitude() < 2) {
        this.v.set(0, 0);
      }
      if (this.v.getMagnitude() > 600) {
        this.v.normaliseApply();
        this.v.multiplyApply(600);
      }
      this.rotation += this.rotationVel * delta;
      this.p.addApply(this.v.multiply(delta));
      this.v.addApply(this.a.multiply(delta));
    }
    shoot(angle) {
      let vel = Utils.getForceByAngle(angle);
      vel.normaliseApply();
      this.v.addApply(vel.multiply(-5));
      const POWER = 3e3;
      vel.multiplyApply(POWER);
      vel.addApply(this.v);
      let pos = this.p.copy();
      this.bullets.push(new Bullet(pos, vel));
      game.camera.shake(4);
      game.camera.pull(angle, 20);
    }
    draw(delta) {
      let points = Utils.rotatePoints(this.points, Math.PI / 180 * this.rotation);
      this.game.camera.drawPath(this.p, points, "stroke");
      this.game.renderer.text("Acc " + Math.round(this.a.x) + "  " + Math.round(this.a.y), 10, 200);
      this.game.renderer.text("Vel " + Math.round(this.v.x) + "  " + Math.round(this.v.y), 10, 220);
      this.game.renderer.text("Mag " + this.v.getMagnitude(), 10, 240);
      this.game.renderer.text("Rot " + this.rotation, 10, 250);
      this.game.camera.fillRect(this.p.x, this.p.y, 10, 10);
      for (let i = 0; i < this.bullets.length; i++) {
        if (this.bullets[i].oldScreenP != null) {
          let bulletPos = game.camera.calcPos(this.bullets[i].p);
          let bulletOldPos = game.camera.calcPos(this.bullets[i].oldScreenP);
          this.game.ctx.beginPath();
          this.game.ctx.moveTo(bulletPos.x, bulletPos.y);
          this.game.ctx.lineTo(bulletOldPos.x, bulletOldPos.y);
          this.game.ctx.stroke();
          this.game.ctx.closePath();
        }
      }
    }
    onCrashed() {
      this.isAlive = false;
      game.camera.shake(20);
    }
  };

  // src/rock.js
  var Rock = class {
    p = new Vector(0, 0);
    // Position Vector
    v = new Vector(0, 0);
    // Velocity Vector
    points = [];
    // Points (autogenerated)
    constructor(game2, position) {
      this.game = game2;
      if (position == void 0) {
        while (true) {
          let x2 = Math.random() * game2.camera.width * 3 - game2.camera.width;
          let y = Math.random() * game2.camera.height * 3 - game2.camera.height;
          if (!(x2 > 0 && x2 < game2.camera.width && y > 0 && y < game2.camera.height)) {
            this.p.x = game2.rocket.p.x + x2 - game2.camera.width / 2;
            this.p.y = game2.rocket.p.y + y - game2.camera.height / 2;
            break;
          }
        }
      } else {
        this.p = position.copy();
      }
      let r = Math.random() * 15 + 10;
      this.sr = r;
      let individualRadii = [];
      for (let i = 0; i < 6; i += 6 / 9) {
        let individualRadius = r + (Math.random() * r - r / 2);
        let x2 = Math.sin(i) * individualRadius;
        let y = Math.cos(i) * individualRadius;
        individualRadii.push(individualRadius);
        this.points.push(new Vector(x2, y));
      }
      let sum = 0;
      individualRadii.forEach((indR) => {
        sum += indR;
      });
      this.radius = sum / individualRadii.length;
      let angle = Math.abs(Utils.getAngleBetweenPoints(this.p, game2.rocket.p));
      let x = Math.random() * 100;
      let rockAngle = angle - (50 - x) ^ 2;
      let f = Utils.getForceByAngle(rockAngle);
      this.v.x = f.x;
      this.v.y = f.y;
    }
    update() {
      this.p.addApply(this.v);
    }
    draw() {
      this.game.camera.drawPath(this.p, this.points, "stroke");
      return;
    }
  };

  // src/camera.js
  var Camera = class {
    // {{{
    constructor(x, y, width, height, ctx3) {
      this.ctx = ctx3;
      this.target = new Vector(0, 0);
      this.op = new Vector(x, y);
      this.p = this.op.copy();
      this.width = width;
      this.height = height;
      this.shaking = 0;
      this.originalPos = this.p.copy();
    }
    update() {
      this.op.x += (this.target.x - this.op.x - this.width / 2) * 0.5;
      this.op.y += (this.target.y - this.op.y - this.height / 2) * 0.5;
      this.p.set(this.op.x, this.op.y);
      if (this.shaking > 0) {
        this.p.x += this.shaking * (Math.random() - 0.5);
        this.p.y += this.shaking * (Math.random() - 0.5);
        this.shaking--;
      } else {
        this.shaking = 0;
      }
    }
    shake(power = 15) {
      this.shaking = this.shaking * 0.1 + power;
    }
    pull(angle, power = 10) {
      this.op.addApply(Utils.getForceByAngle(angle).multiply(power));
    }
    calcPos(vect) {
      return vect.subtract(this.p);
    }
    calcPosParallax(vect, parallax) {
      return vect.subtract(this.p.divide(parallax));
    }
    fillRect(x, y, width, height) {
      let pos = this.calcPos(new Vector(x, y));
      this.ctx.fillRect(pos.x, pos.y, width, height);
    }
    drawPath(origin, points, method = "stroke") {
      this.ctx.beginPath();
      points.forEach((p, i) => {
        let screenP = this.calcPos(origin.add(p));
        if (i == 0) {
          this.ctx.moveTo(screenP.x, screenP.y);
          return;
        }
        this.ctx.lineTo(screenP.x, screenP.y);
        if (i == points.length - 1) {
          screenP = this.calcPos(origin.add(points[0]));
          this.ctx.lineTo(screenP.x, screenP.y);
        }
      });
      if (method == "stroke") {
        this.ctx.stroke();
      } else if (method == "fill") {
        this.ctx.fill();
      }
    }
    fillText(string, x, y) {
      let pos = this.calcPos(new Vector(x, y));
      this.ctx.fillText(string, pos.x, pos.y);
    }
  };

  // src/renderer.js
  var Renderer = class {
    constructor(game2, ctx3) {
      this.game = game2;
      this.ctx = ctx3;
      this.currentState = "home";
      this.targetState = "home";
    }
    text(string, x, y) {
      this.game.ctx.fillText(string, x, y);
    }
    drawGame(delta) {
      this.game.stars.forEach((star) => {
        let sPos = this.game.camera.calcPosParallax(star.p, 1 / star.radius);
        if (star.lastCalcPos == void 0) {
          star.lastCalcPos = sPos;
        }
        if (sPos.x > this.game.canvas.width) {
          star.p.x -= this.game.canvas.width;
          star.lastCalcPos.x -= this.game.canvas.width;
          sPos.x -= this.game.canvas.width;
        }
        ;
        if (sPos.x < 0) {
          star.p.x += this.game.canvas.width;
          star.lastCalcPos.x += this.game.canvas.width;
          sPos.x += this.game.canvas.width;
        }
        ;
        if (sPos.y > this.game.canvas.height) {
          star.p.y -= this.game.canvas.height;
          star.lastCalcPos.y -= this.game.canvas.height;
          sPos.y -= this.game.canvas.height;
        }
        ;
        if (sPos.y < 0) {
          star.p.y += this.game.canvas.height;
          star.lastCalcPos.y += this.game.canvas.height;
          sPos.y += this.game.canvas.height;
        }
        ;
        this.game.ctx.beginPath();
        this.game.ctx.arc(sPos.x, sPos.y, star.radius, 0, Math.PI * 2);
        this.game.ctx.fill();
        if (star.radius > 1) {
          this.game.ctx.beginPath();
          this.game.ctx.moveTo(sPos.x, sPos.y);
          this.game.ctx.lineTo(star.lastCalcPos.x, star.lastCalcPos.y);
          this.game.ctx.stroke();
        }
        this.game.ctx.closePath();
        star.lastCalcPos = sPos;
      });
      this.game.rocks.forEach((r) => {
        r.draw();
        let dist = Math.sqrt((this.game.rocket.p.x - r.p.x) ** 2 + (this.game.rocket.p.y - r.p.y) ** 2);
        this.game.camera.fillText(dist, r.p.x, r.p.y);
      });
      this.game.rocket.draw(delta);
    }
  };

  // src/game.js
  var Game = class {
    prevstamp = 0;
    initialStamp = 0;
    lastrocktime = 0;
    constructor(canvas2, ctx3) {
      this.canvas = canvas2;
      this.ctx = ctx3;
      this.rocket = new Rocket(this);
      this.stars = [];
      this.rocks = [];
      this.camera = new Camera(-this.canvas.width / 2, -this.canvas.height / 2, this.canvas.width, this.canvas.height, ctx3);
      this.renderer = new Renderer(this, ctx3);
      this.xx = 10;
      this.xy = 1;
      this.gameStarted = false;
      this.homeButtons = [
        {
          p: new Vector(300, 400),
          width: 100,
          height: 100,
          text: "Start Game",
          action: () => {
            this.gameStarted = true;
          }
        }
      ];
      for (let i = 0; i < 100; i++) {
        this.stars.push({
          p: new Vector(Math.random() * this.canvas.width, Math.random() * this.canvas.height),
          radius: 0.3 + Math.pow(Math.random() * 4, 4) / 400
        });
      }
      for (let i = 0; i < 8; i++) {
        this.rocks.push(new Rock(this, new Vector(Math.random() * this.canvas.width, Math.random() * this.canvas.height)));
      }
    }
    fps = 0;
    update() {
      let timestamp = window.performance.now() || 0;
      if (this.initialStamp == 0) {
        this.initialStamp = timestamp;
      }
      let timerun = timestamp - this.initialStamp;
      let delta = (timestamp - this.prevstamp) / 1e3;
      delta = Math.min(delta, 0.04);
      this.prevstamp = timestamp;
      if (!this.gameStarted) {
        this.homeButtons.forEach((btn) => {
          if (this.mouse) {
          }
        });
      } else if (this.gameStarted) {
        this.rocket.update(delta);
        let countRocksNear2 = 0;
        for (let i = 0; i < this.rocks.length; i++) {
          let r = this.rocks[i];
          r.update();
          let dist = (this.rocket.p.x - r.p.x) ** 2 + (this.rocket.p.y - r.p.y) ** 2;
          if (dist < this.canvas.width ** 2) {
            countRocksNear2 += 1;
          }
          if (dist > (this.canvas.width * 2) ** 2) {
            this.rocks.splice(i, 1);
            i -= 1;
          }
        }
        if (countRocksNear2 < 20) {
          this.rocks.push(new Rock(this));
        }
        this.camera.target = new Vector(0, 0);
      }
      this.camera.update();
      this.draw(delta);
      this.fps = Math.random() < 0.9 ? this.fps : Math.round(1 / delta);
      this.ctx.fillText("Delt " + delta, 10, 30);
      this.ctx.fillText("FPS " + this.fps, 10, 40);
      this.ctx.fillText("xx " + this.xx, 10, 50);
      this.ctx.fillText("xy " + this.xy, 10, 60);
      if (this.gameStarted) {
        ctx.fillText("rocksNear " + countRocksNear, 10, 70);
      }
      requestAnimationFrame(this.update.bind(this));
    }
    draw(delta) {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "white";
      this.ctx.strokeStyle = "white";
      this.renderer.drawGame(delta);
    }
  };
  var game_default = Game;

  // src/app.js
  var canvas = document.getElementById("canvas");
  var ctx2 = canvas.getContext("2d");
  var info = document.getElementById("info");
  var key2 = [];
  var mouse = {
    x: 0,
    y: 0,
    left: false,
    right: false
  };
  function main() {
    handleResize();
    let game2 = new game_default(canvas, ctx2);
    window.game = game2;
    game2.update();
  }
  var handleResize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };
  var handleKeydown = (e) => {
    key2[e.keyCode] = true;
  };
  var handleKeyup = (e) => {
    key2[e.keyCode] = false;
  };
  var handleMouseDown = (e) => {
    if (e.buttons == 0) {
      mouse.left = false;
      mouse.right = false;
    } else if (e.buttons == 1) {
      mouse.left = true;
    } else if (e.buttons == 2) {
      mouse.right = true;
    } else if (e.buttons == 3) {
      mouse.left = true;
      mouse.right = true;
    }
  };
  var handleMouseMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    console.log(mouse.left, mouse.right);
  };
  var handleMouseUp = (e) => {
    if (e.buttons == 0) {
      mouse.left = false;
      mouse.right = false;
    } else if (e.buttons == 1) {
      mouse.left = true;
    } else if (e.buttons == 2) {
      mouse.right = true;
    } else if (e.buttons == 3) {
      mouse.left = true;
      mouse.right = true;
    }
  };
  window.addEventListener("load", main);
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("keyup", handleKeyup);
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
})();
