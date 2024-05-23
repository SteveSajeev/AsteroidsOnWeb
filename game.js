class Game {
    constructor(ctx){
        this.ctx = ctx;
        this.rocket = new Rocket();
        this.stars = [];
        this.rocks = [];
		this.camera = new Camera(0,0,canvas.width,canvas.height);


        for(let i = 0; i < 40; i++){
            this.stars.push({
				p: new Vector(  Math.random()*canvas.width, Math.random()*canvas.height  ),
                radius:Math.random()+0.2,
            });
        }

        for(let i = 0; i < 1; i++){
            this.rocks.push(new Rock(this));
        }

        
    }

    update(timestamp){
		// Calculates time passed for timer based functions (bullet time left, etc)
		if(timestamp === undefined){
			timestamp = 0;
		}
		if(this.prevstamp === undefined){
			this.prevstamp = timestamp;
		}
		const elapsed = timestamp - this.prevstamp; 
		this.prevstamp = timestamp;

		// Object updates
        this.rocket.update(elapsed);
        this.rocks.forEach((r)=>{
            r.update();
        });


		// Camera
		this.camera.target = this.rocket.p.copy();
		this.camera.update();


		// Draw
		this.draw();

        requestAnimationFrame(this.update.bind(this));
        //setTimeout(this.update.bind(this), 80);
    }
    draw(){

        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";

        this.stars.forEach((star)=>{
            star.p.x += star.radius/12;
            star.p.y += star.radius/12;
            if(star.p.x > canvas.width){star.p.x = 0};
            if(star.p.x < 0){star.p.x = canvas.width};
            if(star.p.y > canvas.height){star.p.y = 0};
            if(star.p.y < 0){star.p.y = canvas.height};

            ctx.beginPath();
			let sPos = this.camera.calcPos(star.p); // Calculates the positions on the screen according to camera
            ctx.arc(sPos.x, sPos.y, star.radius,0,Math.PI*2);
            ctx.fill();
            ctx.closePath();
        });

        this.rocks.forEach((r)=>{
            r.draw();
        });
        this.rocket.draw();
    }
}

