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
}
