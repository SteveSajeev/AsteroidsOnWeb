import { Vector } from "./vector";

export class Utils {
    static rotatePoint (Vect,a){
        var {x,y} = Vect;
        y = -y;
        let X = (x * Math.cos(a)) + (y *Math.sin(a));
        let Y = (y * Math.cos(a)) - (x *Math.sin(a));
        Y = -Y;
        return new Vector(X,Y);
    }

	static getDist(v1,v2){
		let x = v2.x - v1.x;
		let y = v2.y - v1.y;
		let dist = Math.sqrt(x*x + y*y);
		return dist;
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


} 
