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
// ヒットポイント管理
var playerHP:number;
var enemiesHP:{ [index:number]: number} = {};
// キーの状態管理
var keyStates:{ [index:number]: boolean} = {};
// メインループ - 60 FPS のゲームの場合約 17 ms
// 実行環境によってゲーム速度が変化するので、それを整えるためのFPS
var FPS = 30;
var MSPF = 1000 / FPS;

function hitTest(player:{
    object:HTMLImageElement;
    position:IPosition;
}, enemy:{
    object:HTMLImageElement;
    position:IPosition;
}) {
    // 中心座標の取得
    var cx1 = player.position.x + player.object.width / 2;
    var cy1 = player.position.y + player.object.height / 2;
    var cx2 = enemy.position.x + enemy.object.width / 2;
    var cy2 = enemy.position.y + enemy.object.height / 2; // 半径の計算
    var r1 = (player.object.width + enemy.object.height) / 4;
    var r2 = (player.object.width + enemy.object.height) / 4;
    // 中心座標同士の距離の測定
    // Math.sqrt(d) -- d のルートを返す
    // Math.pow(x, a) -- x の a 乗を返す
    var d = Math.sqrt(Math.pow(cx1 - cx2, 2) + Math.pow(cy1 - cy2, 2)); // 当たっているか判定
// ちなみに `return r1+r2 > d;` とだけ書いても OK
    return r1 + r2 > d;
}
function mainLoop() {
    var startTime = (new Date()).getTime();
    // プレイヤーの移動
    movePlayer();
    // 敵キャラの移動
    moveEnemies();
    // プレイヤーと敵で
    if (playerHP > 0) {
        for (var i = 0; i < ENEMIES_COUNT; i++) {
            // HPが0上の敵のみ判定する
            var enemyHP = enemiesHP[i];
            if (enemyHP <= 0) {
                continue;
            }
            var enemyPosition = enemies[i];

            if (hitTest({
                    object: img_player,
                    position: playerPos
                }, {
                    object: img_enemy,
                    position: enemyPosition
                })){
            // hitしてる場合は互いにHP-1
                playerHP -= 1;
                enemiesHP[i] -= 1;
            }
        }
    }
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
    // 初期HP
    playerHP = 10;
    // 敵の初期位置
    for (var i = 0; i < ENEMIES_COUNT; i++) {
        enemies[i] = {
            x: Math.random() * (canvas.width - img_enemy.width),
            y: Math.random() * (canvas.height - img_enemy.height)
        };
        enemiesHP[i] = 2;
    }
    mainLoop();
}
function onDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 生きている場合だけ新しい位置にプレイヤーを描画
    if (playerHP > 0) {
        ctx.drawImage(img_player, playerPos.x, playerPos.y);
    }
    for (var i = 0; i < ENEMIES_COUNT; i++) {
        // HPが0上の敵のみ描画
        var enemyHP = enemiesHP[i];
        if (enemyHP <= 0) {
            continue;
        }
        var enemyPosition = enemies[i];
        ctx.drawImage(img_enemy, enemyPosition.x, enemyPosition.y);
    }
}
// 敵キャラの移動
function moveEnemies() {
    var SPEED = 2;

    function recover(enemy:IPosition):IPosition {
        if (enemy.y <= canvas.height) {
            return enemy;
        }
        // はみ出た時はランダム再配置する
        enemy.y = -img_enemy.height;
        enemy.x = Math.random() * (canvas.width - img_enemy.width);
        return enemy;
    }

    for (var i = 0; i < ENEMIES_COUNT; i++) {
        // HPが0上の敵のみ描画
        var enemyHP = enemiesHP[i];
        if (enemyHP <= 0) {
            continue;
        }
        var enemy = enemies[i];
        enemy.y += SPEED;
        enemies[i] = recover(enemy);
    }
}

// プレイヤーの移動
function movePlayer() {
    if (playerHP <= 0) {
        return;
    }
    function moveX(px:number) {
        playerPos.x += px;
    }

    var left = 37;
    var right = 39;
    var SPEED = 2;

    // | <player>
    if (keyStates[left] && playerPos.x > 0) {
        moveX(-SPEED);
    }
    //  <player> |
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