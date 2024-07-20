class Game {
	prevstamp = 0;
	initialStamp = 0;
	lastrocktime = 0;
    constructor(ctx){
        this.ctx = ctx;
        this.rocket = new Rocket();
        this.stars = [];
        this.rocks = [];
		this.camera = new Camera(0,0,canvas.width,canvas.height);

		this.xx = 10;
		this.xy = +1;


        for(let i = 0; i < 100; i++){
            this.stars.push({
				p: new Vector(  Math.random()*canvas.width, Math.random()*canvas.height  ),
				radius:0.3+Math.pow(((Math.random()*4)), 4)/400,
            });
        }

		// Initial rocks
        for(let i = 0; i < 5; i++){
            this.rocks.push(new Rock(this, new Vector(Math.random()*canvas.width, Math.random()*canvas.height)));
        }

        
    }

	fps = 0
    update(){
		// Calculates time passed for timer based functions (bullet time left, etc)
		let timestamp = window.performance.now() || 0; // || 0 eliminated undefined condition
		if(this.initialStamp == 0){
			this.initialStamp = timestamp; // Marks First frame
		} 
		let timerun = timestamp - this.initialStamp;

		let delta = (timestamp - this.prevstamp)/1000;  // around 60fps
		delta = Math.min(delta, 0.04); // Minimum value to make sure delta does not go too high
		
		this.prevstamp = timestamp;




		// Adding rocks to scene
		if(this.lastrocktime + 4000 < timerun){
			for(let i = 0; i < 4; i++){
				this.rocks.push(new Rock(this));
			}
			this.lastrocktime = timerun;
		}


		// Object updates
        this.rocket.update(delta);
        this.rocks.forEach((r)=>{
            r.update();
        });


		// Camera
		this.camera.target = this.rocket.p.copy();
		this.camera.update();


		// Draw
		this.draw();

		this.fps = Math.random()<0.9?this.fps:Math.round(1/delta);
		ctx.fillText("Delt " + delta, 10, 30);
		ctx.fillText("FPS " + this.fps, 10, 40);
		ctx.fillText("xx " + this.xx, 10, 50);
		ctx.fillText("xy " + this.xy, 10, 60);

        requestAnimationFrame(this.update.bind(this));
		/* Debugging: Simulate fps
		let wantedfps = this.fps
		if(this.xx <= 0){this.xy = +1}
		if(this.xx >= 100){this.xy = -1}
		this.xx += this.xy * delta * 10;
		wantedfps = 20 + 80*(this.xx/100);
		
		setTimeout(this.update.bind(this), (1/wantedfps)*1000);
		*/
    }
    draw(){

		ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";

        this.stars.forEach((star)=>{
            star.p.x += star.radius/12;
            star.p.y += star.radius/12;
			let sPos = this.camera.calcPosParallax(star.p, 1/star.radius); // Calculates the positions on the screen according to camera
            if(sPos.x > canvas.width){
				star.p.x -= canvas.width
			};
            if(sPos.x < 0){
				star.p.x += canvas.width
			};
            if(sPos.y > canvas.height){
				star.p.y -= canvas.height;
			};
            if(sPos.y < 0){
				star.p.y +=  canvas.height;
			};

            ctx.beginPath();
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

