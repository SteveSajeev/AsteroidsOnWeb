import { Utils } from "./utils";
import { Vector } from "./utils";

export class Camera { // {{{


	constructor(x,y,width,height,ctx){
		this.ctx = ctx;
		this.target = new Vector(0,0);
		// Position of camera is not with respect to camera center, it is instead camera's top left corner
		this.op = new Vector(x,y); // Original Position  -> pos of actual camera, follows target
		this.p = this.op.copy();   // pos -> follows closely to op, with extra effects, shake, etc   (should be used for final translating)

		this.width = width;
		this.height = height;
		this.shaking = 0;
		this.originalPos = this.p.copy();
	}

	update(){
		this.op.x += (this.target.x - this.op.x - this.width/2) *  0.5;
		this.op.y += (this.target.y - this.op.y - this.height/2) * 0.5 ;

		this.p.set(this.op.x, this.op.y);

		if(this.shaking > 0){
			this.p.x += (this.shaking) * (Math.random()-0.5);
			this.p.y += (this.shaking) * (Math.random()-0.5);
			this.shaking--;
		} else {
			this.shaking = 0;
		}

	}

	shake(power=15){
		this.shaking = (this.shaking*0.1) + power;
	}
	pull(angle, power=10){
		// Pulls the camera towards a specific direction with power
		this.op.addApply(Utils.getForceByAngle(angle).multiply(power));
	}

	calcPos(vect){
		// Returns a calculated position that translates world positions to screen positions with respect to this camera
		return vect.subtract(this.p);
	}
	calcPosParallax(vect, parallax){
		// Returns a calculated position that translates world positions to screen positions with respect to this camera
		return vect.subtract(this.p.divide(parallax));
	}


	fillRect(x,y,width,height){
		let pos = this.calcPos(new Vector(x,y));
		this.ctx.fillRect(pos.x, pos.y, width, height);
	}

    drawPath(origin, points, method="stroke"){
        /* points -> array of {x,y} objects or Vector
         * ctx    -> Context of canvas to draw to
         * method -> "stroke" or "fill" will be called */

        this.ctx.beginPath();
        points.forEach((p,i)=>{
			let screenP = this.calcPos(origin.add(p));
            if(i == 0){
                this.ctx.moveTo(screenP.x, screenP.y);
                return;
            }
            this.ctx.lineTo(screenP.x, screenP.y);
            if(i == points.length-1){
				screenP = this.calcPos(origin.add(points[0]));
				this.ctx.lineTo(screenP.x, screenP.y);
            }
        })
		if(method == "stroke"){
        	this.ctx.stroke();
		} else if (method == "fill"){
			this.ctx.fill();
		}
    }

	fillText(string, x,y){
		let pos = this.calcPos(new Vector(x,y));
		this.ctx.fillText(string, pos.x,pos.y);
	}
} // }}}

export class Renderer { ///{{{
	constructor(game, ctx){
		this.game = game;
		this.ctx = ctx;
		this.currentState = "home";
		this.targetState = "home";
	}

	text(string, x,y){
		this.game.ctx.fillText(string, x,y);
	}


	drawGame(delta){
		// Draw Game
		this.game.stars.forEach((star)=>{
			let sPos = this.game.camera.calcPosParallax(star.p, 1/star.radius); // Calculates the positions on the screen according to camera
			if(star.lastCalcPos == undefined){
				star.lastCalcPos = sPos;
			}
			if(sPos.x > this.game.canvas.width){
				star.p.x -= this.game.canvas.width
				star.lastCalcPos.x -= this.game.canvas.width; // for the trailing effect also to work when the star crosses the borders
				sPos.x -= this.game.canvas.width;
			};
			if(sPos.x < 0){
				star.p.x += this.game.canvas.width
				star.lastCalcPos.x += this.game.canvas.width;
				sPos.x += this.game.canvas.width;
			};
			if(sPos.y > this.game.canvas.height){
				star.p.y -= this.game.canvas.height;
				star.lastCalcPos.y -= this.game.canvas.height;
				sPos.y -= this.game.canvas.height;
			};
			if(sPos.y < 0){
				star.p.y +=  this.game.canvas.height;
				star.lastCalcPos.y += this.game.canvas.height;
				sPos.y += this.game.canvas.height;
			};

			this.game.ctx.beginPath();
			this.game.ctx.arc(sPos.x, sPos.y, star.radius,0,Math.PI*2);
			this.game.ctx.fill();

			if(star.radius > 1){
				// Only trail for considerably big stars
				this.game.ctx.beginPath();
				this.game.ctx.moveTo(sPos.x, sPos.y);
				this.game.ctx.lineTo(star.lastCalcPos.x, star.lastCalcPos.y);
				this.game.ctx.stroke();
			}
			this.game.ctx.closePath();
			
			// For trail effect
			star.lastCalcPos = sPos;
		});

		this.game.rocks.forEach((r)=>{
			r.draw();
			let dist = Math.sqrt((this.game.rocket.p.x-r.p.x)**2 + (this.game.rocket.p.y-r.p.y)**2)
			this.game.camera.fillText(dist, r.p.x, r.p.y)
		});


		this.game.rocket.draw(delta);
	}

} ///}}}

export class Rocket { //{{{
    points = [new Vector(13,0), new Vector(-13,-10), new Vector(-13,10)];
    
	// the points are aligned horizontally, resulting in the rocket to be facing right side

	p = new Vector(0,0); // Position   (initialised in constructor)
    v = new Vector(0,0); // Velocity
    a = new Vector(0,0); // Acceleration

	friction = 1; // Inverse (more of this value, less friction)
	bullets = [];

	avgRadius = 10; // Only for collision

    rotation = 270;
	rotationVel = 0;


	isAlive = true;
	justShot = false;

    constructor(game,x=0,y=0){
		// Game holds a reference to mostly everything, so objects can access other objects 
		this.game = game;
		// If position is not passed, it defaults to (0,0)
		// (No reason to accept a custom position for rocket, it should always spawn at 0,0)
        this.p = new Vector(x,y);
		for(let i = 0; i < 3; i++){
			this.points[i].x += 5;
		}
    }

    update(delta){
		this.a.set(0,0);

		this.v.multiplyApply(Math.pow(this.friction, delta))
		
		if(this.isAlive){
			if(key[87] == true){
				// Thrust forward
				let thrustAcc = Utils.getForceByAngle(this.rotation);
				this.a = thrustAcc.copy().normalise();
				this.a.multiplyApply(200);
			} else {
				this.a.set(0,0);
			}
			if(key[65] == true){
				if(this.rotationVel > 0){
					this.rotationVel = 0;
				}
				if(this.rotationVel  > -200){
					this.rotationVel -= 50;
				}
			}
			if(key[68] == true){
				if(this.rotationVel < 0){
					this.rotationVel = 0;
				}
				if(this.rotationVel < 200){
					this.rotationVel += 50;
				}
			}
			if(key[65] != true && key[68] != true){
				if(this.rotationVel > 1){
					this.rotationVel -= 50;
				} else if (this.rotationVel < -1){
					this.rotationVel += 50;
				} else {
					this.rotationVel = 0;
				}
			}
			if(this.rotation < 0){this.rotation += 360}
			if(this.rotation >= 360){this.rotation -= 360}
			if(key[38] && !this.justShot){
				this.shoot(this.rotation);
				this.justShot = true;
			}
			if(key[38] == false && this.justShot){
				this.justShot = false;
			}
		} else {
			if(this.rotationVel > 1){
				this.rotationVel -= 10;
			} else if (this.rotationVel < -1){
				this.rotationVel += 10;
			} else {
				this.rotationVel = 0;
			}
		}



		// updating all bullets
		for(let i = 0; i < this.bullets.length; i++){

			let bullet = this.bullets[i];

			let hit = false;
			for(let a = 0; a < game.rocks.length; a++){
				let rock = game.rocks[a];

				let dist = Utils.getDist(bullet.p, rock.p);

				if(dist < rock.radius + bullet.radius){
					game.rocks.splice(a, 1);
					hit = true;
					game.camera.shake(15);
					break;
				} else if (dist < rock.radius + bullet.radius + 30){
					// Extra check that divides the previus velocity by 2, and finds the new pos, and uses the half pos to check collision
					let halfdist = Utils.getDist(bullet.p.subtract(bullet.v.divide(2).multiply(delta)), rock.p);
					if(halfdist < rock.radius + bullet.radius){
						game.rocks.splice(a, 1);
						hit = true;
						game.camera.shake(15);
						break;
					}
				}

			}
			if(hit == true){
				this.bullets.splice(i, 1);
				continue;
			}

			// Bullet Update
			this.bullets[i].oldScreenP = this.bullets[i].p.copy();
			this.bullets[i].p.addApply(this.bullets[i].v.multiply(delta));


			this.bullets[i].timeRemaining -= delta;
			if(this.bullets[i].timeRemaining < 0){
				this.bullets.splice(i, 1);
				i -= 1;
			}

		}

		for(let a = 0; a < game.rocks.length; a++){
			let rock = game.rocks[a];
			let dist = Utils.getDist(rock.p, this.p);
			if(dist < this.avgRadius + rock.radius){
				this.onCrashed();
			}

		}


		if(this.v.getMagnitude() < 2){
			this.v.set(0,0);
		}
		if(this.v.getMagnitude() > 600){	
			this.v.normaliseApply();
			this.v.multiplyApply(600);
		}


		this.rotation += this.rotationVel * delta;

		this.p.addApply(this.v.multiply(delta));    // delta is not multiply 'applied'
		this.v.addApply(this.a.multiply(delta));
            
    }

	shoot(angle){
		let vel = Utils.getForceByAngle(angle);  // Velocity of bullet calculated from angle
		vel.normaliseApply();
		this.v.addApply(vel.multiply(-5));  // backfiring force (ie force acting back on rocketship)

		const POWER = 3000;
		vel.multiplyApply(POWER);
		vel.addApply(this.v);  // Current velocity of ship transferred to bullet

		let pos = this.p.copy(); // Copy of rocket position

		this.bullets.push(new Bullet(pos, vel))  /// New bullet instance of Bullet

		// Screen Effects
		game.camera.shake(4);
		game.camera.pull(angle, 20);
	}

    draw (delta){
        let points = Utils.rotatePoints(this.points, Math.PI/180 * this.rotation);
        this.game.camera.drawPath(this.p, points, "stroke");
		
		this.game.renderer.text("Acc " + Math.round(this.a.x) + "  " + Math.round(this.a.y), 10, 200);
		this.game.renderer.text("Vel " + Math.round(this.v.x )+ "  " + Math.round(this.v.y), 10, 220);
		this.game.renderer.text("Mag " + this.v.getMagnitude(), 10, 240);
		this.game.renderer.text("Rot " + this.rotation, 10, 250);
		this.game.camera.fillRect(this.p.x, this.p.y, 10,10)
		// drawing all bullets
		for(let i = 0; i < this.bullets.length; i++){
			
			// If there is no previous screen position set, then dont draw
			if(this.bullets[i].oldScreenP != null){
				// Curr and Old position are different, ie draw a line
				let bulletPos = game.camera.calcPos(this.bullets[i].p);
				//let bulletOldPos = this.bullets[i].oldScreenP;
				let bulletOldPos = game.camera.calcPos(this.bullets[i].oldScreenP);
				
				this.game.ctx.beginPath();
				this.game.ctx.moveTo(bulletPos.x, bulletPos.y);
				this.game.ctx.lineTo(bulletOldPos.x, bulletOldPos.y);
				this.game.ctx.stroke();
				this.game.ctx.closePath();
			}
			//this.bullets[i].oldScreenP = game.camera.calcPos(this.bullets[i].p);
		}
    }

	onCrashed(){
		this.isAlive = false;
		game.camera.shake(20);
	}


}
// }}}

export class Rock { // {{{
	p = new Vector(0,0); 	// Position Vector
    v = new Vector(0,0);  // Velocity Vector
    points = [];            // Points (autogenerated)


    constructor(game, position){
		this.game = game;
		// If position not passed, generate random position
		// else, use passed position
		if(position == undefined){
			while(true){
				let x = (Math.random() * game.camera.width*3) - game.camera.width;
				let y = (Math.random() * game.camera.height*3) - game.camera.height;
				if(!(x > 0 && x < game.camera.width && y > 0 && y < game.camera.height)){
					this.p.x = game.rocket.p.x + x - game.camera.width/2;
					this.p.y = game.rocket.p.y + y - game.camera.height/2;
					break;
				}

			}
		} else {
			this.p = position.copy();
		}


        // Constructing random rock figure
        let r = Math.random()*15+10; // approx. radius

		this.sr = r;
		let individualRadii = []; // Each lines length (radius) is kept track to find the average radius of the rock
        for(let i = 0; i < 6; i+=6/9){
            let individualRadius = r + ( (Math.random()*r)-(r/2) );
            let x = Math.sin(i)*individualRadius;
            let y = Math.cos(i)*individualRadius;
			individualRadii.push(individualRadius);
            this.points.push(new Vector(x,y));
        }

		let sum = 0;
		individualRadii.forEach((indR) => {
			sum += indR;
		});
		this.radius = sum / (individualRadii.length); //average



        // Initial velocity
		// This calculation tries to throw the rock towards the rocket, but a slight probablity of deviating
		// I tried using desmos for a probability function, it really isn't necessary, I was just trying it for fun
		let angle = Math.abs(Utils.getAngleBetweenPoints(this.p, game.rocket.p));
		let x = Math.random()*100
		// This formula       ↓       just tries to get a value as close to angle
		let rockAngle = (angle - (50-x)^2)
        let f = Utils.getForceByAngle(rockAngle);
        this.v.x = f.x;
        this.v.y = f.y;

    }


    update(){
		this.p.addApply(this.v);
    }

    draw(){
		this.game.camera.drawPath(this.p, this.points, "stroke");
		return;
		//debug
		/*
		game.ctx.beginPath();
		game.ctx.arc(this.p.x, this.p.y, this.sr, 0, Math.PI*2);
		game.ctx.stroke();
		game.ctx.beginPath();
		game.ctx.strokeStyle = "lightgreen";
		game.ctx.arc(this.p.x, this.p.y, this.radius, 0, Math.PI*2);
		game.ctx.stroke();
		game.ctx.closePath();
		game.ctx.strokeStyle= "white";
		*/
    }
}
// }}}

export class Bullet { //{{{
	radius = 3;
	timeRemaining = 7;
	constructor(position, velocity){
		this.p = position;
		this.oldScreenP = null;  // This is not world position, it is the position on the canvas (ie after camera is involved)
		this.v = velocity;
	}
} //}}}
