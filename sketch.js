// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// let scoreText = "成績分數: " + finalScore + "/" + maxScore;
// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// !!! 煙火特效新增 - 全域變數 !!!
let fireworks = []; // 存儲所有的煙火物件
const GRAVITY = 0.2; // 重力加速度

// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

window.addEventListener('message', function (event) {
    // ... (保持不變)
}, false);

// =================================================================
// 步驟三：煙火粒子系統類別 (新增)
// -----------------------------------------------------------------

// 單個粒子類別
class Particle {
    constructor(x, y, hu, isFirework) {
        this.pos = createVector(x, y);
        this.isFirework = isFirework; // 判斷是否為爆炸後的碎片
        this.lifespan = 255;
        this.hu = hu; // 色相 (Hue)
        
        if (this.isFirework) {
            // 火箭上升
            this.vel = createVector(0, random(-10, -16));
        } else {
            // 爆炸碎片：給予隨機向外擴散的速度
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10)); 
        }
        this.acc = createVector(0, 0);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.isFirework) {
            this.vel.mult(0.9); // 爆炸後的粒子會減速
            this.lifespan -= 4; // 壽命減少，用於淡出效果
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    done() {
        return this.lifespan < 0;
    }

    show() {
        colorMode(HSB);
        if (!this.isFirework) {
            strokeWeight(2);
            stroke(this.hu, 255, 255, this.lifespan);
        } else {
            strokeWeight(4);
            stroke(this.hu, 255, 255);
        }
        point(this.pos.x, this.pos.y);
    }
}


// 煙火類別
class Firework {
    constructor() {
        // 發射點：在畫布底部中央附近
        this.hu = random(255); // 隨機顏色
        this.firework = new Particle(random(width / 3, width * 2 / 3), height, this.hu, true);
        this.exploded = false;
        this.particles = [];
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(createVector(0, GRAVITY)); // 模擬重力
            this.firework.update();
            
            // 檢查火箭是否達到頂點 (速度變為正/開始下降)，並爆炸
            if (this.firework.vel.y >= 0) { 
                this.explode();
                this.exploded = true;
            }
        }
        
        // 更新爆炸後的粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(createVector(0, GRAVITY));
            this.particles[i].update();
            if (this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    explode() {
        // 產生多個爆炸碎片粒子
        for (let i = 0; i < 100; i++) {
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
            this.particles.push(p);
        }
    }

    show() {
        if (!this.exploded) {
            this.firework.show();
        }
        
        // 繪製爆炸後的粒子
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].show();
        }
    }

    done() {
        // 判斷煙火是否結束 (火箭已爆炸且所有碎片都消失)
        return this.exploded && this.particles.length === 0;
    }
}
