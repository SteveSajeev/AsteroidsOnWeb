export class Bullet {
	radius = 3;
	timeRemaining = 7;
	constructor(position, velocity){
		this.p = position;
		this.oldScreenP = null;  // This is not world position, it is the position on the canvas (ie after camera is involved)
		this.v = velocity;
	}
}