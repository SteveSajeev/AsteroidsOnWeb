class Rocket {
    points = [Utils.Vector(15,0),Utils.Vector(-15,-12),Utils.Vector(-15,12)];
    // the points are aligned horizontally, resulting in the rocket to be facing right side
    rotation = 270;
    v = Utils.Vector(0,0);
    a = Utils.Vector(0,0);

    constructor(x,y){
        this.x = canvas.width/2;
        this.y = canvas.height/2;
    }

    draw (){
        let points = Utils.rotatePoints(this.points, Math.PI/180 * this.rotation);
        ctx.beginPath();
        points.forEach((p,i)=>{
            if(i == 0){
                ctx.moveTo(this.x + p.x, this.y + p.y);
                return;
            }
            ctx.lineTo(this.x + p.x, this.y + p.y);
            if(i == points.length-1){
                ctx.lineTo(this.x+points[0].x, this.y+points[0].y)
            }
        })
        ctx.stroke();
    }
    update (){

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


        if(this.x > canvas.width){this.x = 0}
        if(this.x < 0){this.x = canvas.width}
        if(this.y > canvas.height){this.y = 0}
        if(this.y < 0){this.y = canvas.height}
        
        
        

        this.v.x += this.a.x;
        this.v.y += this.a.y;
        this.x += this.v.x;
        this.y += this.v.y;
    }
}


