const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");
let key = [];



function main(){

    handleResize();
    let game = new Game(ctx);
    window.game = game;
    game.update();

}
var a = 0;
function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0,0,canvas.width, canvas.height);

    ctx.fillRect(c.x, c.y, 2,2);
    point.forEach((p) => {
        ctx.fillRect(c.x + p.x, c.y + p.y, 5,5);
    })
    point = Utils.rotatePoints(point, a/180);
}

const handleResize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
const handleKeydown = (e) => {
    key[e.keyCode] = true;
    console.log(e.keyCode)
}
const handleKeyup = (e) => {
    key[e.keyCode] = false;
}
window.addEventListener("load", main);
window.addEventListener("resize", handleResize);
window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
