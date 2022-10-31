
class Game {
    constructor(ctx){
        this.ctx = ctx;
        this.rocket = new Rocket();
        this.stars = [];
        this.rocks = [];


        for(let i = 0; i < 40; i++){
            this.stars.push({
                x:Math.random()*canvas.width,
                y:Math.random()*canvas.height,
                radius:Math.random()+0.2,
            });
        }

        for(let i = 0; i < 1; i++){
            this.rocks.push(new Rock(this));
        }

        
    }

    update(){
        requestAnimationFrame(this.update.bind(this));
        //setTimeout(this.update.bind(this), 500);
        
        this.rocket.update();

        this.rocks.forEach((r)=>{
            r.update();
        });
        this.draw();
    }
    draw(){

        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";

        this.stars.forEach((s)=>{
            s.x += s.radius/12;
            s.y += s.radius/8;
            if(s.x > canvas.width){s.x = 0}
            if(s.x < 0){s.x = canvas.width}
            if(s.y > canvas.height){s.y = 0}
            if(s.y < 0){s.y = canvas.height}

            ctx.beginPath();
            ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);
            ctx.fill();
            ctx.closePath();
        });

        this.rocks.forEach((r)=>{
            r.draw();
        });
        this.rocket.draw();
    }
}

