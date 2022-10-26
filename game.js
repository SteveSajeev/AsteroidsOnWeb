
class Game {
    constructor(ctx){
        this.ctx = ctx;
        this.rocket = new Rocket();

    }

    update(){
        requestAnimationFrame(this.update.bind(this));
        //setTimeout(this.update.bind(this), 500);

        this.rocket.update();
        this.draw();
    }
    draw(){

        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";


        this.rocket.draw();
    }
}

