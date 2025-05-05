import { Utils } from "./utils";
import { Vector } from "./vector";

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