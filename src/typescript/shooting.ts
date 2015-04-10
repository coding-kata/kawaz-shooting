"use strict";
var canvas:HTMLCanvasElement;
var ctx:CanvasRenderingContext2D;
interface IPosition {
    x:number;
    y:number;
}

// プレイヤーの位置
var playerPos:IPosition = {
    x: 0,
    y: 0
};

// 敵キャラの定義
var ENEMIES_COUNT = 10;
var enemies:IPosition[] = [];
var img_player:HTMLImageElement;
var img_enemy:HTMLImageElement;
// キーの状態管理
var keyStates:{ [index:number]: boolean} = {};
// メインループ - 60 FPS のゲームの場合約 17 ms
// 実行環境によってゲーム速度が変化するので、それを整えるためのFPS
var FPS = 30;
var MSPF = 1000 / FPS;
function mainLoop() {
    var startTime = (new Date()).getTime();
    // プレイヤーの移動
    movePlayer();
    // 描画
    onDraw();
    // 処理の経過時間
    var deltaTime:number = (new Date()).getTime() - startTime;
    // 次のループまでのintervalを算出
    var interval = MSPF - deltaTime;
    if (interval > 0) {
        // interval分を待つ
        setTimeout(mainLoop, interval);
    } else {
        // 次の処理へ
        mainLoop();
    }
}


function initialize() {
    img_player = <HTMLImageElement>document.getElementById("player");
    img_enemy = <HTMLImageElement>document.getElementById("enemy");
    canvas = <HTMLCanvasElement>document.getElementById("screen");
    ctx = canvas.getContext("2d");
    playerPos.x = (canvas.width - img_player.width) / 2;
    playerPos.y = (canvas.height - img_player.height) - 20;
    // 敵の初期位置
    for (var i = 0; i < ENEMIES_COUNT; i++) {
        enemies[i] = {
            x: Math.random() * (canvas.width - img_enemy.width),
            y: Math.random() * (canvas.height - img_enemy.height)
        }
    }
    mainLoop();
}
function onDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img_player, playerPos.x, playerPos.y);
    for (var i = 0; i < ENEMIES_COUNT; i++) {
        var enemyPosition = enemies[i];
        ctx.drawImage(img_enemy, enemyPosition.x, enemyPosition.y);
    }
}

function movePlayer() {
    function moveX(px:number) {
        playerPos.x += px;
    }

    var left = 37;
    var right = 39;
    var SPEED = 2;
    if (keyStates[left] && playerPos.x > 0) {
        moveX(-SPEED);
    }
    if (keyStates[right] && (playerPos.x + img_player.width < canvas.width)) {
        moveX(SPEED);
    }
}
function onKeyDown(event:KeyboardEvent) {
    keyStates[event.keyCode] = true;
}
function onKeyUp(event:KeyboardEvent) {
    keyStates[event.keyCode] = false;

}
window.onkeydown = onKeyDown;
window.onkeyup = onKeyUp;
initialize();