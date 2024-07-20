
class Camera { // {{{


	target = new Vector(0,0);
	constructor(x,y,width,height){
		this.op = new Vector(x,y); // Original Position  -> pos of actual camera, follows target
		this.p = this.op.copy();   // pos -> follows closely to op, with extra effects, shake, etc   (should be used for final translating)

		this.width = width;
		this.height = height;
		this.shaking = 0;
		this.originalPos = this.p.copy();
	}

	update(){
		this.op.x += (this.target.x - this.op.x - this.width/2) * 0.3;
		this.op.y += (this.target.y - this.op.y - this.height/2) * 0.3;

		this.p.set(this.op.x, this.op.y);
		this.p.set(this.target.x-this.width/2, this.target.y-this.height/2);

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

	calcPos(vect){
		// Returns a calculated position that translates world positions to screen positions with respect to this camera
		return vect.subtract(this.p);
	}
	calcPosParallax(vect, parallax){
		// Returns a calculated position that translates world positions to screen positions with respect to this camera
		return vect.subtract(this.p.divide(parallax));
	}
} // }}}

class Rocket { //{{{
    points = [new Vector(15,0), new Vector(-15,-12), new Vector(-15,12)];
    
	// the points are aligned horizontally, resulting in the rocket to be facing right side
    rotation = 270;

	p = new Vector(0,0); // Position   (initialised in constructor)
    v = new Vector(0,0); // Velocity
    a = new Vector(0,0); // Acceleration

	friction = 0.85; // Inverse (more of this value, less friction)
	bullets = [];

	avgRadius = 10; // Only for collision


	crashed = false;

    constructor(x,y){
        this.p = new Vector(canvas.width/2, canvas.height/2);
		for(let i = 0; i < 3; i++){
			this.points[i].x += 5;
		}
    }

    update(delta){
		this.a.set(0,0);

		this.xRatio = 1 + (delta * this.friction);
		//this.v.divideApply(this.xRatio)
		this.v.multiplyApply(Math.pow(this.friction, delta))
		

        if(key[87] == true){
            // Thrust forward
            let thrustAcc = Utils.getForceByAngle(this.rotation);
			this.a = thrustAcc.copy().normalise();
			this.a.multiplyApply(600);
        }else {
			this.a.set(0,0);
        }
        if(key[65] == true){
            this.rotation -= 250 * delta; 
        }
        if(key[68] == true){
            this.rotation += 250 * delta;
        }
        if(this.rotation < 0){this.rotation += 360}
        if(this.rotation >= 360){this.rotation -= 360}

		// updating all bullets
		for(let i = 0; i < this.bullets.length; i++){
			this.bullets[i].v.multiplyApply(1);

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
			if(hit){
				this.bullets.splice(i, 1);
				continue;
			}

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


		if(this.v.getMagnitude() > 700){
			this.v.normaliseApply();
			this.v.multiplyApply(700);
		} else if(this.v.getMagnitude() < 1){
			this.v.set(0,0);
		}



		this.p.addApply(this.v.multiply(delta));    // delta is not multiply 'applied'
		this.v.addApply(this.a.multiply(delta));
    }

	shoot(angle){
		let force = Utils.getForceByAngle(angle);
		force.normaliseApply();
		force.multiplyApply(3000);
		force.addApply(this.v);


		this.bullets.push({
			p: this.p.copy(),
			radius: 3,
			v: force,
			timeRemaining: 7,
		});
		game.camera.shake();
	}

    draw (){
        let points = Utils.rotatePoints(this.points, Math.PI/180 * this.rotation);
        Utils.DrawPoints(this.p, points, ctx, "stroke");
		
		game.ctx.fillText("Acc " + Math.round(this.a.x) + "  " + Math.round(this.a.y), 10, 200);
		game.ctx.fillText("Vel " + Math.round(this.v.x )+ "  " + Math.round(this.v.y), 10, 220);
		game.ctx.fillText("Mag " + this.v.getMagnitude(), 10, 240);
		game.ctx.fillText("Rot " + this.rotation, 10, 250);
		// drawing all bullets
		for(let i = 0; i < this.bullets.length; i++){
			ctx.beginPath();
			let bulletPos = game.camera.calcPos(this.bullets[i].p);
			ctx.arc(bulletPos.x, bulletPos.y, this.bullets[i].radius, 0, Math.PI*2);
			ctx.fill();
			ctx.closePath();
		}
    }

	onCrashed(){
		this.crashed = true;
		game.camera.shake(20);
	}


}
// }}}

class Rock { // {{{
	p = new Vector(0,0); 	// Position Vector
    v = new Vector(0,0);  // Velocity Vector
    points = [];            // Points (autogenerated)

    constructor(game, position){
		if(position == undefined){
			while(true){
				let x = Math.random() * canvas.width*3;
				let y = Math.random() * canvas.height*3;
				let pos = game.camera.calcPos(new Vector(x,y));
				if(!(pos.x > 0 && pos.x < canvas.width && pos.y > 0 && pos.y < canvas.height)){
					this.p.x = x;
					this.p.y = y;
					break;
				}

			}
		} else {
			this.p = position.copy();
		}

        

        // Constructing random rock figure
        let r = Math.random()*30+10; // approx. radius

		this.sr = r;
		let individualRadii = []; // Each lines length (radius) is kept track to find the average radius of the rock
        for(let i = 0; i < 6; i+=6/9){
            let individualRadius = r + (Math.random()*20)-10;
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
        let f = Utils.getForceByAngle(Utils.getAngleBetweenPoints(this.p,game.rocket.p));
        this.v.x = f.x;
        this.v.y = f.y;

    }

    update(){
		this.p.addApply(this.v);
    }

    draw(){
        Utils.DrawPoints(this.p, this.points, ctx, "stroke");
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
