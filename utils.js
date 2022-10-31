class Utils {
    static Vector (x,y){return {x:x,y:y}}
    static rotatePoint (Vect,a){
        var {x,y} = Vect;
        y = -y;
        let X = (x * Math.cos(a)) + (y *Math.sin(a));
        let Y = (y * Math.cos(a)) - (x *Math.sin(a));
        Y = -Y;
        return this.Vector(X,Y);
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
        return this.Vector(x,y);
    }
    static getAngleBetweenPoints(origin, target){
        let a = (Math.atan2(target.y - origin.y, target.x - origin.x)) * 180 / Math.PI;
        return a;
    }

    static DrawPoints(origin, points, ctx, method="stroke"){
        /* points -> array of {x,y} objects or Utils.Vector
         * ctx    -> Context of canvas to draw to
         * method -> "stroke" or "fill" will be called */

        ctx.beginPath();
        points.forEach((p,i)=>{
            if(i == 0){
                ctx.moveTo(origin.x + p.x, origin.y + p.y);
                return;
            }
            ctx.lineTo(origin.x + p.x, origin.y + p.y);
            if(i == points.length-1){
                ctx.lineTo(origin.x+points[0].x, origin.y+points[0].y)
            }
        })
        ctx.stroke();
    }

} 
