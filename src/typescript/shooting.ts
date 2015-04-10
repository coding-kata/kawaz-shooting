"use strict";
var canvas:HTMLCanvasElement;
var ctx:CanvasRenderingContext2D;
canvas = <HTMLCanvasElement>document.getElementById("screen");
ctx = canvas.getContext("2d");
var img_player = document.getElementById("player");
var img_enemy = <HTMLImageElement>document.getElementById("enemy");
// player
ctx.drawImage(img_player, 20, 50);
// 的
ctx.drawImage(img_enemy,
    Math.random() * (canvas.width - img_enemy.width),
    Math.random() * (canvas.height - img_enemy.height));