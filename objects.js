class Camera { // {{{

	target = Utils.Vector(0,0);
	constructor(x,y,width,height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	update(){
		this.x += (this.target.x - this.x - this.width/2) * 0.3;
		this.y += (this.target.y - this.y - this.height/2) * 0.3;
	}

	calcPos(x,y){
		return {
			x: x - this.x,
			y: y - this.y,
		}
	}
} // }}}

class Rocket { //{{{
    points = [Utils.Vector(15,0),Utils.Vector(-15,-12),Utils.Vector(-15,12)];
    
	// the points are aligned horizontally, resulting in the rocket to be facing right side
    rotation = 270;

    v = Utils.Vector(0,0);
    a = Utils.Vector(0,0);


	bullets = [];

    constructor(x,y){
        this.p = Utils.Vector(canvas.width/2, canvas.height/2);
    }

    update(elapsed){
        this.a.y *= 1;
        this.a.x *= 1;
        this.v.y *= 0.95;
        this.v.x *= 0.95;

        if(key[38] == true){
            // Thrust forward
            let thrustAcc = Utils.getForceByAngle(this.rotation);
            this.a.x = thrustAcc.x;
            this.a.y = thrustAcc.y;
        }else {
            this.a.x = 0;
            this.a.y = 0;
        }
        if(key[37] == true){
            this.rotation -= 8;
            if(this.rotation < 0){this.rotation += 360}
        }
        if(key[39] == true){
            this.rotation += 8;
            if(this.rotation >= 360){this.rotation -= 360}
        }

		console.log(this.bullets.length);
		// updating all bullets
		for(let i = 0; i < this.bullets.length; i++){
			this.bullets[i].p.x += this.bullets[i].v.x;
			this.bullets[i].p.y += this.bullets[i].v.y;

			this.bullets[i].v.x *= 0.99;
			this.bullets[i].v.y *= 0.99;

			this.bullets[i].timeRemaining -= elapsed;

			if(this.bullets[i].timeRemaining < 0){
				this.bullets.splice(i, 1);
				i -= 1;
			}

		}

        this.v.x += this.a.x;
        this.v.y += this.a.y;
        this.p.x += this.v.x;
        this.p.y += this.v.y;
    }

	shoot(angle){
		let force = Utils.getForceByAngle(angle);
		force.x *= 30;
		force.y *= 30;


		this.bullets.push({
			p: {...this.p},
			v: force,
			timeRemaining: 7000,
		});
	}

    draw (){
        let points = Utils.rotatePoints(this.points, Math.PI/180 * this.rotation);
        Utils.DrawPoints(this.p, points, ctx, "stroke");
		
		// drawing all bullets
		for(let i = 0; i < this.bullets.length; i++){
			ctx.beginPath();
			ctx.arc(this.bullets[i].p.x - game.camera.x, this.bullets[i].p.y - game.camera.y, 5, 0, Math.PI*2);
			ctx.fill();
			ctx.closePath();
		}
    }
}
// }}}
class Rock { // {{{
    p = [];                 // Position Vector
    v = Utils.Vector(0,0);  // Velocity Vector
    points = [];            // Points (autogenerated)

    constructor(game){
        let x,y = 0;
        if(Math.random()>=0.5){
            x = -(Math.random()*100);
        } else {
            x = canvas.width + (Math.random()*100);
        }
        if(Math.random()>=0.5){
            y = -(Math.random()*100);
        } else {
            y = canvas.height + (Math.random()*100);
        }
        this.p = Utils.Vector(x,y);

        
        let r = Math.random()*30+10; // approx. radius

        // Constructing random rock figure
        for(let i = 0; i < 6; i+=0.7){
            let x = Math.sin(i)*r;
            let y = Math.cos(i)*r;
            let a =Math.random();
            x += a*x
            y += a*y
            this.points.push(Utils.Vector(
                x,y
            ));
        }


        // Initial velocity
        let f = Utils.getForceByAngle(Utils.getAngleBetweenPoints(this.p,game.rocket.p));
        this.v.x = f.x;
        this.v.y = f.y;

    }

    update(){
        this.p.x += this.v.x;
        this.p.y += this.v.y;
    }

    draw(){
        Utils.DrawPoints(this.p, this.points, ctx, "stroke");
    }
}
// }}}
