import { Utils } from "./utils";

export function Vector(x,y){
	this.x = x;
	this.y = y;
}
Vector.prototype.set = function(x,y){
	this.x = x;
	this.y = y;
}
Vector.prototype.copy = function(vect){
	return new Vector(this.x, this.y);
}
Vector.prototype.add = function(v2){
	return new Vector(this.x + v2.x, this.y + v2.y);
}
Vector.prototype.addApply = function(v2){
	this.x += v2.x;
	this.y += v2.y;
}
Vector.prototype.subtract = function(v2){
	return new Vector(this.x - v2.x, this.y - v2.y);
}
Vector.prototype.subtractApply = function(v2){
	this.x -= v2.x;
	this.y -= v2.y;
}
Vector.prototype.divide = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		return new Vector(this.x / a.x, this.y / a.y);
	} else if(typeof a == "number"){
		return new Vector(this.x / a, this.y / a);
	}
}
Vector.prototype.divideApply = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		this.x /= a.x;
		this.y /= a.y;
	} else if(typeof a == "number"){
		this.x /= a;
		this.y /= a;
	}
}
Vector.prototype.multiply = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		return new Vector(this.x * a.x, this.y * a.y);
	} else if(typeof a == "number"){
		return new Vector(this.x * a, this.y * a);
	}
}
Vector.prototype.multiplyApply = function(a){
	// a can be a scalar value or a vector
	if(typeof a == "object"){
		this.x *= a.x;
		this.y *= a.y;
	} else if(typeof a == "number"){
		this.x *= a;
		this.y *= a;
	}
}
Vector.prototype.normalise = function(){
	return this.divide(Utils.getDist(new Vector(0,0), this));
}
Vector.prototype.normaliseApply = function(){
	return this.divideApply(Utils.getDist(new Vector(0,0), this));
}
Vector.prototype.getMagnitude = function(){
	return Utils.getDist(new Vector(0,0), this);
}