import Game from "./game";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");
let key = [];
let mouse = {
    x: 0,
    y: 0,
    left: false,
    right: false
}

function main(){
    handleResize(); // init browser window sizing with canvas
    let game = new Game(canvas, ctx);
    window.game = game;
    game.update();
}

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
    if(e.buttons == 0){
        mouse.left = false;
        mouse.right = false;
    } else if(e.buttons == 1){
        mouse.left = true;
    } else if (e.buttons == 2){
        mouse.right = true;
    } else if (e.buttons == 3){
        mouse.left = true;
        mouse.right = true;
    }
}
const handleMouseMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    console.log(mouse.left, mouse.right)
}
const handleMouseUp = (e) => {
    if(e.buttons == 0){
        mouse.left = false;
        mouse.right = false;
    } else if(e.buttons == 1){
        mouse.left = true;
    } else if (e.buttons == 2){
        mouse.right = true;
    } else if (e.buttons == 3){
        mouse.left = true;
        mouse.right = true;
    }
}

window.addEventListener("load", main);
window.addEventListener("resize", handleResize);
window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);

