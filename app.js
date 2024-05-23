const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");
let key = [];

function main(){
    handleResize(); // init browser window sizing with canvas
    let game = new Game(ctx);
    window.game = game;
    game.update();
}
var a = 0;
/*
function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0,0,canvas.width, canvas.height);

    ctx.fillRect(c.x, c.y, 2,2);
    point.forEach((p) => {
        ctx.fillRect(c.x + p.x, c.y + p.y, 5,5);
    })
    point = Utils.rotatePoints(point, a/180);

}
*/

const handleResize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
const handleKeydown = (e) => {
    key[e.keyCode] = true;
}
const handleKeyup = (e) => {
    key[e.keyCode] = false;
}
const handleMouseDown = (e) => {
	// Adds camera pos to translate screen position to world position
	let angle = Utils.getAngleBetweenPoints(game.rocket.p, new Vector(e.clientX + game.camera.p.x, e.clientY + game.camera.p.y));
	game.rocket.shoot(angle);
}
const handleMouseUp = (e) => {
}
window.addEventListener("load", main);
window.addEventListener("resize", handleResize);
window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mouseup", handleMouseUp);

