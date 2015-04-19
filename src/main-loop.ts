"use strict";
// メインループ - 60 FPS のゲームの場合約 17 ms
// 実行環境によってゲーム速度が変化するので、それを整えるためのFPS
export var FPS = 60;
var lastTimeStamp:number;
var render:Function;
// http://qiita.com/zukkun/items/43466ba12e94b90a9f8d
function tick(timeStamp:number) {
    // 前回の呼び出しからの経過時間
    var deltaTime = (timeStamp - lastTimeStamp) / 1000;
    // var currentFPS = 1000 / (timeStamp - lastTimeStamp);
    lastTimeStamp = timeStamp;
    render(deltaTime);
    requestAnimationFrame(tick);
}
export default function mainLoop(enterFrame:Function) {
    lastTimeStamp = performance.now();
    render = enterFrame;
    requestAnimationFrame(tick);
}