import { Vector } from "./utils"
import { Renderer, Rocket, Rock, Camera } from "./objects";
class Game {
	prevstamp = 0;
	initialStamp = 0;
	lastrocktime = 0;
    constructor(canvas, ctx){
		this.canvas = canvas;
        this.ctx = ctx;
        this.rocket = new Rocket(this);
        this.stars = [];
        this.rocks = [];
		// Camera is offset by half of screen size to set the camera focussed at rocket, which is at (0,0)
		// Camera position is of top left corner of camera size
		this.camera = new Camera(-this.canvas.width/2,-this.canvas.height/2,this.canvas.width,this.canvas.height,ctx);
		this.renderer = new Renderer(this, ctx)
		this.xx = 10;
		this.xy = +1;

		//currentState = "home"; // One of home, game, paused
		this.gameStarted = false;
		this.homeButtons = [
			{
				p: new Vector(300,400),
				width: 100,
				height: 100,
				text: "Start Game",
				action: ()=>{
					this.gameStarted = true;
				}
			}
		]

        for(let i = 0; i < 100; i++){
            this.stars.push({
				p: new Vector(  Math.random()*this.canvas.width, Math.random()*this.canvas.height  ),
				radius:0.3+Math.pow(((Math.random()*4)), 4)/400,
            });
        }

		// Initial rocks
        for(let i = 0; i < 8; i++){
            this.rocks.push(new Rock(this, new Vector(Math.random()*this.canvas.width, Math.random()*this.canvas.height)));
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



		if(!this.gameStarted){
			this.homeButtons.forEach((btn)=>{
				if(this.mouse){

				}
			})

		} else if(this.gameStarted){

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

				if(dist < this.canvas.width**2){
					countRocksNear += 1;
				}
				if(dist > (this.canvas.width*2)**2){
					this.rocks.splice(i,1);
					i -= 1;
				}
			}
			// Adding more rocks to scene
			if(countRocksNear < 20){
				this.rocks.push(new Rock(this))
			}


			// Camera stick to rocket
			//this.camera.target = this.rocket.p.copy();
			this.camera.target = new Vector(0,0);
		}

		// Camera
		this.camera.update();


		// Draw
		this.draw(delta);

		this.fps = Math.random()<0.9?this.fps:Math.round(1/delta);
		this.ctx.fillText("Delt " + delta, 10, 30);
		this.ctx.fillText("FPS " + this.fps, 10, 40);
		this.ctx.fillText("xx " + this.xx, 10, 50);
		this.ctx.fillText("xy " + this.xy, 10, 60);
		if(this.gameStarted){
			ctx.fillText("rocksNear " + countRocksNear, 10, 70);
		}

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
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";

		this.renderer.drawGame(delta);



    }
}

export default Game;