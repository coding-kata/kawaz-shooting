"use strict";
import mainLoop from "./main-loop"
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
var enemiesPosition:IPosition[] = [];
var img_player:HTMLImageElement;
var img_enemy:HTMLImageElement;
var img_player_bullet:HTMLImageElement;
// ヒットポイント管理
var playerHP:number;
var enemiesHP:{ [index:number]: number} = [];
// キーの状態管理
var keyStates:{ [index:number]: boolean} = [];
// 弾の数
var BULLETS = 5;
var playerBulletsPosition:IPosition[] = [];
var playerBulletsHP:{[index:number]: number} = [];
var FIRE_INTERVAL = 20;
var STAR_INTERVAL = 20;
// 発射感覚
var playerFireInterval = 0;
var playerStarInterval = 0;
// 倒した敵の数を保存する変数を定義
var killed = 0;
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

function initialize() {
    img_player = <HTMLImageElement>document.getElementById("player");
    img_enemy = <HTMLImageElement>document.getElementById("enemy");
    img_player_bullet = <HTMLImageElement>document.getElementById("player_bullet");
    canvas = <HTMLCanvasElement>document.getElementById("screen");
    ctx = canvas.getContext("2d");
    playerPos.x = (canvas.width - img_player.width) / 2;
    playerPos.y = (canvas.height - img_player.height) - 20;
    // 初期HP
    playerHP = 10;
    // 弾のHPを指定
    for (var i_1 = 0; i_1 < BULLETS; i_1++) {
        playerBulletsHP[i_1] = 0;
        playerBulletsPosition[i_1] = {
            x: 0,
            y: 0
        };
    }
    // 敵HP
    for (var i_2 = 0; i_2 < ENEMIES_COUNT; i_2++) {
        enemiesPosition[i_2] = {
            x: Math.random() * (canvas.width - img_enemy.width),
            y: Math.random() * (canvas.height - img_enemy.height)
        };
        enemiesHP[i_2] = 2;
    }
    mainLoop(()=> {
        console.log(playerBulletsHP);
        // プレイヤーの移動
        movePlayer();
        // プレイヤーの弾
        movePlayerBullets();
        // 敵キャラの移動
        moveEnemies();
        // プレイヤーと敵で
        if (playerHP > 0 && playerStarInterval === 0) {
            for (var i = 0; i < ENEMIES_COUNT; i++) {
                // HPが0上の敵のみ判定する
                var enemyHP = enemiesHP[i];

                if (enemyHP <= 0) {
                    continue;
                }
                var enemyPosition = enemiesPosition[i];
                if (hitTest({
                        object: img_player,
                        position: playerPos
                    }, {
                        object: img_enemy,
                        position: enemyPosition
                    })) {
                    // hitしてる場合は互いにHP-1
                    playerHP -= 1;
                    enemiesHP[i] -= 1;
                    playerStarInterval = STAR_INTERVAL;
                }
            }
        }
        // プレイヤー弾と敵
        if (playerHP > 0) {
            for (var i = 0; i < ENEMIES_COUNT; i++) {
                // HPが0上の敵のみ判定する
                var enemyHP = enemiesHP[i];
                var enemyPosition = enemiesPosition[i];

                if (enemyHP <= 0) {
                    continue;
                }
                for (var j = 0; j < BULLETS; j++) {
                    // 弾が死んでいる場合はスルーする
                    if (playerBulletsHP[j] <= 0) {
                        continue;
                    }
                    var playerBulletPosition = playerBulletsPosition[j];
                    if (hitTest({
                            object: img_player_bullet,
                            position: playerBulletPosition
                        }, {
                            object: img_enemy,
                            position: enemyPosition
                        })) {
                        // 当たっているのでお互いの HP を 1 削る
                        playerBulletsHP[j] -= 1;
                        enemiesHP[i] -= 1;
                        // 敵が死んだ場合は killed を増やす
                        if (enemiesHP[i] == 0) {
                            killed++;
                        }
                    }
                }
            }
        }

        if(playerStarInterval > 0) {
            playerStarInterval--;
        }
        // 描画
        onDraw();
    });
}

function drawEnemyCount() {
    // コンテキストの状態を保存(fillStyle を変えたりするので) ctx.save();
    // HP の最大値(10)x 5 の短形を描画(白)
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, canvas.height - 10, 10 * 5, 5);
    // 残り HP x 5 の短形を描画(赤)
    ctx.fillStyle = '#f00';
    ctx.fillRect(10, canvas.height - 10, playerHP * 5, 5);
    // 「倒した敵の数/全敵の数」という文字列を作成
    var text = "Killed: " + killed + "/" + ENEMIES_COUNT; // 文字列の(描画)横幅を計算する
    var width = ctx.measureText(text).width;
    // 文字列を描画(白)
    ctx.fillStyle = '#fff';
    ctx.fillText(text,
        canvas.width - 10 - width,
        canvas.height - 10);
    // コンテキストの状態を復元
    ctx.restore();
}
function drawPlayerHP() {
    ctx.save();
    // HP の最大値(10)x 5 の短形を描画(白)
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, canvas.height - 10, 10 * 5, 5);
    // 残り HP x 5 の短形を描画(赤)
    ctx.fillStyle = '#f00';
    ctx.fillRect(10, canvas.height - 10, playerHP * 5, 5); // コンテキストの状態を復元
    ctx.restore();
}
function onDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayerHP();
    drawEnemyCount();
    // 生きている場合だけ新しい位置にプレイヤーを描画
    if (playerHP > 0) {
        ctx.save();
        if(playerStarInterval % 2 !== 0) {
            ctx.globalAlpha = 0.5;
        }
        ctx.drawImage(img_player, playerPos.x, playerPos.y);
        ctx.restore();
    }

    // 弾の画像を描画
    for (var i = 0; i < BULLETS; i++) {
        if (playerBulletsHP[i] > 0) {
            var playerBulletPosition = playerBulletsPosition[i];
            ctx.drawImage(img_player_bullet, playerBulletPosition.x, playerBulletPosition.y);
        }
    }
    for (var i = 0; i < ENEMIES_COUNT; i++) {
        // HPが0上の敵のみ描画
        var enemyHP = enemiesHP[i];
        if (enemyHP <= 0) {
            continue;
        }
        var enemyPosition = enemiesPosition[i];
        ctx.drawImage(img_enemy, enemyPosition.x, enemyPosition.y);
    }
}
// プレイヤーの弾
function movePlayerBullets() {
    var SPEED = -6;
    for (var i = 0; i < BULLETS; i++) {
        var playerBulletHP = playerBulletsHP[i];
        if (playerBulletHP <= 0) {
            continue;
        }
        var playerBulletPosition = playerBulletsPosition[i];
        // 下へ
        playerBulletPosition.y += SPEED;
        if (playerBulletPosition.y < img_player_bullet.height) {
            playerBulletsHP[i] = 0;
        }
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
        var enemy = enemiesPosition[i];
        enemy.y += SPEED;
        enemiesPosition[i] = recover(enemy);
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

    var space = 32;
    var left = 37;
    var right = 39;
    var SPEED = 2;

    if (keyStates[space] && playerFireInterval === 0) {
        for (var i = 0; i < BULLETS; i++) {
            var playerBulletHP = playerBulletsHP[i];
            if (playerBulletHP === 0) {
                var playerBulletPosition = playerBulletsPosition[i];
                playerBulletPosition.x = playerPos.x;
                playerBulletPosition.y = playerPos.y;
                playerBulletsHP[i] = 1;
                // インターバル値を戻す
                playerFireInterval = FIRE_INTERVAL;
                break;
            }
        }
    }
    if (playerFireInterval > 0) {
        playerFireInterval--;
    }
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