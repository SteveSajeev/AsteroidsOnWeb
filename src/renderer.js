export class Renderer {
	constructor(game, ctx){
		this.game = game;
		this.ctx = ctx;
		this.currentState = "home";
		this.targetState = "home";
	}

	text(string, x,y){
		this.game.ctx.fillText(string, x,y);
	}


	drawGame(delta){
		// Draw Game
		this.game.stars.forEach((star)=>{
			let sPos = this.game.camera.calcPosParallax(star.p, 1/star.radius); // Calculates the positions on the screen according to camera
			if(star.lastCalcPos == undefined){
				star.lastCalcPos = sPos;
			}
			if(sPos.x > this.game.canvas.width){
				star.p.x -= this.game.canvas.width
				star.lastCalcPos.x -= this.game.canvas.width; // for the trailing effect also to work when the star crosses the borders
				sPos.x -= this.game.canvas.width;
			};
			if(sPos.x < 0){
				star.p.x += this.game.canvas.width
				star.lastCalcPos.x += this.game.canvas.width;
				sPos.x += this.game.canvas.width;
			};
			if(sPos.y > this.game.canvas.height){
				star.p.y -= this.game.canvas.height;
				star.lastCalcPos.y -= this.game.canvas.height;
				sPos.y -= this.game.canvas.height;
			};
			if(sPos.y < 0){
				star.p.y +=  this.game.canvas.height;
				star.lastCalcPos.y += this.game.canvas.height;
				sPos.y += this.game.canvas.height;
			};

			this.game.ctx.beginPath();
			this.game.ctx.arc(sPos.x, sPos.y, star.radius,0,Math.PI*2);
			this.game.ctx.fill();

			if(star.radius > 1){
				// Only trail for considerably big stars
				this.game.ctx.beginPath();
				this.game.ctx.moveTo(sPos.x, sPos.y);
				this.game.ctx.lineTo(star.lastCalcPos.x, star.lastCalcPos.y);
				this.game.ctx.stroke();
			}
			this.game.ctx.closePath();
			
			// For trail effect
			star.lastCalcPos = sPos;
		});

		this.game.rocks.forEach((r)=>{
			r.draw();
			let dist = Math.sqrt((this.game.rocket.p.x-r.p.x)**2 + (this.game.rocket.p.y-r.p.y)**2)
			this.game.camera.fillText(dist, r.p.x, r.p.y)
		});


		this.game.rocket.draw(delta);
	}
}