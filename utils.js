
function Vector(x,y){
	this.x = x;
	this.y = y;
}
Vector.prototype.set = function(x,y){
	this.x = x;
	this.y = y;
}
Vector.prototype.copy = function(vect){
	return new Vector(this.x, this.y);
}
Vector.prototype.add = function(v2){
	return new Vector(this.x + v2.x, this.y + v2.y);
}
Vector.prototype.addApply = function(v2){
	this.x += v2.x;
	this.y += v2.y;
}
Vector.prototype.subtract = function(v2){
	return new Vector(this.x - v2.x, this.y - v2.y);
}
Vector.prototype.subtractApply = function(v2){
	this.x -= v2.x;
	this.y -= v2.y;
}
Vector.prototype.divide = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		return new Vector(this.x / a.x, this.y / a.y);
	} else if(typeof a == "number"){
		return new Vector(this.x / a, this.y / a);
	}
}
Vector.prototype.divideApply = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		this.x /= a.x;
		this.y /= a.y;
	} else if(typeof a == "number"){
		this.x /= a;
		this.y /= a;
	}
}
Vector.prototype.multiply = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		return new Vector(this.x * a.x, this.y * a.y);
	} else if(typeof a == "number"){
		return new Vector(this.x * a, this.y * a);
	}
}
Vector.prototype.multiplyApply = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		this.x *= a.x;
		this.y *= a.y;
	} else if(typeof a == "number"){
		this.x *= a;
		this.y *= a;
	}
}

/*
class Vector {
	constructor(x=0,y=0) {
		this.x = x;
		this.y = y;
	}

	// Static: Call this to return a new vector with same properties of the passed on vector  (for copying a vector to a new vector)
	static fromVect(v){
		return new this(v.x, v.y);
	}
	static add(a, b){
		// Returns the added result of two vectors
		return new Vector(a.x + b.x, a.y + b.y);
	}
	static subtract(a, b){
		// Returns the added result of two vectors
		return new Vector(a.x - b.x, a.y - b.y);
	}
	static multiply(a,b){
		return new Vector(a.x * b.x, a.y * b.y);
	}
	static divide(a,b){
		// a divided by b
		return new Vector(a.x / b.x, a.y / b.y);
	}


	set(x,y){
		this.x = x;
		this.y = y;
	}
}
*/
class Utils {
    static rotatePoint (Vect,a){
        var {x,y} = Vect;
        y = -y;
        let X = (x * Math.cos(a)) + (y *Math.sin(a));
        let Y = (y * Math.cos(a)) - (x *Math.sin(a));
        Y = -Y;
        return new Vector(X,Y);
    }
    static rotatePoints (VectArr,a){
        let newPoints = [];
        VectArr.forEach((p) => {
            newPoints.push(this.rotatePoint(p,a))
        });
        return newPoints;
    }
    static getForceByAngle(angle){
        let rad = Math.PI / 180 * angle;
        let x = Math.cos(rad);
        let y = Math.sin(rad);
        return new Vector(x,y);
    }
    static getAngleBetweenPoints(origin, target){
        let a = (Math.atan2(target.y - origin.y, target.x - origin.x)) * 180 / Math.PI;
        return a;
    }

    static DrawPoints(origin, points, ctx, method="stroke"){
        /* points -> array of {x,y} objects or Vector
         * ctx    -> Context of canvas to draw to
         * method -> "stroke" or "fill" will be called */

        ctx.beginPath();
        points.forEach((p,i)=>{
			let screenP = game.camera.calcPos(origin.add(p));
            if(i == 0){
                ctx.moveTo(screenP.x, screenP.y);
                return;
            }
            ctx.lineTo(screenP.x, screenP.y);
            if(i == points.length-1){
				screenP = game.camera.calcPos(origin.add(points[0]));
				ctx.lineTo(screenP.x, screenP.y);
            }
        })
        ctx.stroke();
    }

} 
