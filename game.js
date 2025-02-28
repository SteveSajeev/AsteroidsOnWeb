class Game {
	prevstamp = 0;
	initialStamp = 0;
	lastrocktime = 0;
    constructor(ctx){

        this.ctx = ctx;
        this.rocket = new Rocket(this);
        this.stars = [];
        this.rocks = [];
		// Camera is offset by half of screen size to set the camera focussed at rocket, which is at (0,0)
		// Camera position is of top left corner of camera size
		this.camera = new Camera(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height,ctx);
		this.ui = new UI(ctx)
		this.xx = 10;
		this.xy = +1;

        for(let i = 0; i < 100; i++){
            this.stars.push({
				p: new Vector(  Math.random()*canvas.width, Math.random()*canvas.height  ),
				radius:0.3+Math.pow(((Math.random()*4)), 4)/400,
            });
        }

		// Initial rocks
        for(let i = 0; i < 8; i++){
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
		delta = Math.min(delta, 0.04); // Setting max limit at 0.04 to make sure delta does not go too high
		this.prevstamp = timestamp;




		// Object updates
  	    this.rocket.update(delta);

		// Update rocks
		let countRocksNear = 0; // Number of rocks closeby
		for(let i = 0; i < this.rocks.length; i++){
			let r = this.rocks[i];
			r.update();


			// A^2 + B^2 = C^2
			// Distance between rock and rocket  (not squared)
			// So just hard code a target distance that isnt rooted, so a large number
			let dist = (this.rocket.p.x-r.p.x)**2 + (this.rocket.p.y-r.p.y)**2

			if(dist < canvas.width**2){
				countRocksNear += 1;
			}
			if(dist > (canvas.width*2)**2){
				this.rocks.splice(i,1);
				i -= 1;
			}
		}



		// Adding more rocks to scene
		// this.rocks.push(new Rock(this));
		if(countRocksNear < 20){
			this.rocks.push(new Rock(this))
		}


		// Camera
		this.camera.target = this.rocket.p.copy();
		this.camera.update();


		// Draw
		this.draw(delta);

		this.fps = Math.random()<0.9?this.fps:Math.round(1/delta);
		ctx.fillText("Delt " + delta, 10, 30);
		ctx.fillText("FPS " + this.fps, 10, 40);
		ctx.fillText("xx " + this.xx, 10, 50);
		ctx.fillText("xy " + this.xy, 10, 60);
		ctx.fillText("rocksNear " + countRocksNear, 10, 70);

        requestAnimationFrame(this.update.bind(this));
		/* Debugging: Simulate fps (low and high framerate)
		let wantedfps = 4
		if(this.xx <= 0){this.xy = +1}
		if(this.xx >= 100){this.xy = -1}
		this.xx += this.xy * delta * 10;
		wantedfps = 20 + 80*(this.xx/100);
		
		setTimeout(this.update.bind(this), (1/wantedfps)*1000);
		*/
    }
    draw(delta){

		this.ctx.fillStyle = "black";
        this.ctx.fillRect(0,0,canvas.width,canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";

        this.stars.forEach((star)=>{
			let sPos = this.camera.calcPosParallax(star.p, 1/star.radius); // Calculates the positions on the screen according to camera
			if(star.lastCalcPos == undefined){
				star.lastCalcPos = sPos;
			}
            if(sPos.x > canvas.width){
				star.p.x -= canvas.width
				star.lastCalcPos.x -= canvas.width; // for the trailing effect also to work when the star crosses the borders
				sPos.x -= canvas.width;
			};
            if(sPos.x < 0){
				star.p.x += canvas.width
				star.lastCalcPos.x += canvas.width;
				sPos.x += canvas.width;
			};
            if(sPos.y > canvas.height){
				star.p.y -= canvas.height;
				star.lastCalcPos.y -= canvas.height;
				sPos.y -= canvas.height;
			};
            if(sPos.y < 0){
				star.p.y +=  canvas.height;
				star.lastCalcPos.y += canvas.height;
				sPos.y += canvas.height;
			};

            this.ctx.beginPath();
            ctx.arc(sPos.x, sPos.y, star.radius,0,Math.PI*2);
			this.ctx.fill();

			if(star.radius > 1){
				// Only trail for considerably big stars
				this.ctx.beginPath();
				this.ctx.moveTo(sPos.x, sPos.y);
				this.ctx.lineTo(star.lastCalcPos.x, star.lastCalcPos.y);
				this.ctx.stroke();
			}
            this.ctx.closePath();
			
			// For trail effect
			star.lastCalcPos = sPos;
        });

        this.rocks.forEach((r)=>{
            r.draw();
			let dist = Math.sqrt((this.rocket.p.x-r.p.x)**2 + (this.rocket.p.y-r.p.y)**2)
			this.camera.fillText(dist, r.p.x, r.p.y)
        });

        this.rocket.draw(delta);
    }
}

