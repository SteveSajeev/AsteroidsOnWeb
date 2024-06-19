[1mdiff --git a/game.js b/game.js[m
[1mindex 3c64eb0..f7eb9c5 100644[m
[1m--- a/game.js[m
[1m+++ b/game.js[m
[36m@@ -1,4 +1,5 @@[m
 class Game {[m
[32m+[m	[32mprevstamp = 0;[m
     constructor(ctx){[m
         this.ctx = ctx;[m
         this.rocket = new Rocket();[m
[36m@@ -24,18 +25,14 @@[m [mclass Game {[m
         [m
     }[m
 [m
[32m+[m	[32mfps = 0[m
     update(){[m
 		// Calculates time passed for timer based functions (bullet time left, etc)[m
[31m-		let timestamp = window.performance.now()[m
[31m-		if(timestamp === undefined){[m
[31m-			timestamp = 0;[m
[31m-		}[m
[31m-[m
[31m-		if(this.prevstamp === undefined){[m
[31m-			this.prevstamp = timestamp;[m
[31m-		}[m
[32m+[m		[32mlet timestamp = window.performance.now() || 0; // || 0 eliminated undefined condition[m
[32m+[m
 		let delta = (timestamp - this.prevstamp)/1000;  // around 60fps[m
[31m-		delta = delta==0?1:delta[m
[32m+[m		[32m//delta = delta==0?1:delta[m
[32m+[m		[32mdelta = Math.min(delta, 0.04);[m
 		[m
 		this.prevstamp = timestamp;[m
 [m
[36m@@ -54,22 +51,20 @@[m [mclass Game {[m
 		// Draw[m
 		this.draw();[m
 [m
[31m-		let fps = Math.round(1000/(delta));[m
[32m+[m		[32mthis.fps = Math.random()<0.9?this.fps:Math.round(1/delta);[m
 		ctx.fillText("Delt " + delta, 10, 30);[m
[31m-		ctx.fillText("FPS " + fps, 10, 40);[m
[32m+[m		[32mctx.fillText("FPS " + this.fps, 10, 40);[m
 		ctx.fillText("xx " + this.xx, 10, 50);[m
 		ctx.fillText("xy " + this.xy, 10, 60);[m
 [m
[31m-        requestAnimationFrame(this.update.bind(this));[m
[31m-		/*[m
[31m-		let wantedfps = fps[m
[32m+[m[32m        //requestAnimationFrame(this.update.bind(this));[m
[32m+[m		[32mlet wantedfps = this.fps[m
 		if(this.xx <= 0){this.xy = +1}[m
 		if(this.xx >= 100){this.xy = -1}[m
[31m-		this.xx += this.xy * delta;[m
[31m-		wantedfps = 10 + 20*(this.xx/100);[m
[32m+[m		[32mthis.xx += this.xy * delta * 10;[m
[32m+[m		[32mwantedfps = 20 + 80*(this.xx/100);[m
 		[m
[31m-		setTimeout(this.update.bind(this), 1/wantedfps*1000);[m
[31m-		*/[m
[32m+[m		[32msetTimeout(this.update.bind(this), (1/wantedfps)*1000);[m
     }[m
     draw(){[m
 [m
[1mdiff --git a/objects.js b/objects.js[m
[1mindex f09cea7..e7f3a83 100644[m
[1m--- a/objects.js[m
[1m+++ b/objects.js[m
[36m@@ -46,7 +46,7 @@[m [mclass Rocket { //{{{[m
     v = new Vector(0,0); // Velocity[m
     a = new Vector(0,0); // Acceleration[m
 [m
[31m-	friction = 0.05;[m
[32m+[m	[32mfriction = 0.15;[m
 	bullets = [];[m
 [m
     constructor(x,y){[m
[36m@@ -57,15 +57,15 @@[m [mclass Rocket { //{{{[m
 		this.a.set(0,0);[m
 [m
 		this.xRatio = 1 + (delta * this.friction);[m
[31m-		this.v.divideApply(this.xRatio)[m
[32m+[m		[32m//this.v.divideApply(this.xRatio)[m
[32m+[m		[32mthis.v.multiplyApply(Math.pow(this.friction, delta))[m
 		[m
 [m
         if(key[38] == true){[m
             // Thrust forward[m
             let thrustAcc = Utils.getForceByAngle(this.rotation);[m
[31m-			this.a = thrustAcc.copy();[m
[31m-			this.a.normaliseApply();[m
[31m-			this.a.multiplyApply(10000);[m
[32m+[m			[32mthis.a = thrustAcc.copy().normalise();[m
[32m+[m			[32mthis.a.multiplyApply(3000)[m
         }else {[m
 			this.a.set(0,0);[m
         }[m
[36m@@ -111,14 +111,19 @@[m [mclass Rocket { //{{{[m
 [m
 		}[m
 [m
[31m-		if(this.v.getMagnitude() >= 1000){[m
[32m+[m		[32mif(this.v.getMagnitude() > 700){[m
[32m+[m			[32m/*j[m
 			this.v.normaliseApply();[m
[31m-			this.v.multiply(1000);[m
[32m+[m			[32mthis.v.multiplyApply(700);[m
[32m+[m			[32m*/[m
[32m+[m		[32m} else if(this.v.getMagnitude() < 1){[m
[32m+[m			[32mthis.v.set(0,0);[m
 		}[m
 [m
 [m
[31m-		this.v.addApply(this.a.multiply(delta));[m
[32m+[m
 		this.p.addApply(this.v.multiply(delta));    // delta is not multiply 'applied'[m
[32m+[m		[32mthis.v.addApply(this.a.multiply(delta));[m
     }[m
 [m
 	shoot(angle){[m
[36m@@ -130,7 +135,7 @@[m [mclass Rocket { //{{{[m
 			p: this.p.copy(),[m
 			radius: 3,[m
 			v: force,[m
[31m-			timeRemaining: 7000,[m
[32m+[m			[32mtimeRemaining: 7,[m
 		});[m
 		game.camera.shake();[m
 	}[m
