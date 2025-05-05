import { Utils } from "./utils";
import { Vector } from "./vector";

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
}