const config = {
    type: Phaser.AUTO,
    // 让游戏自适应窗口大小
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let deathStars, xWing;
let cursors;
let collisionFlag = false;

function preload() {
    this.load.image('bg', 'assets/img.png');       // 背景
    this.load.image('deathStar', 'assets/img_1.png'); // 星球
    this.load.image('xWing', 'assets/img_2.png');    // 飞机
}

function create() {
    // 添加自适应背景
    const bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0, 0);
    bg.setScale(Math.max(this.cameras.main.width / bg.width, this.cameras.main.height / bg.height));

    // 添加星战风格文字
    const style = {
        font: "32px Arial",
        fill: "#FFD700",
        stroke: "#000",
        strokeThickness: 4
    };
    this.add.text(20, 20, "←→↑↓ 控制X翼战机", style);

    // 创建带物理效果的死星组
    deathStars = this.physics.add.group();

    // 添加多个死星
    const numStars = 5; // 可以根据需要调整星球数量
    for (let i = 0; i < numStars; i++) {
        const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
        const y = Phaser.Math.Between(50, this.cameras.main.height - 50);
        const deathStar = deathStars.create(x, y, 'deathStar')
            .setDisplaySize(80, 80)
            .setCollideWorldBounds(true)
            .setBounce(0.2);
    }

    // 创建带尾焰动画的X翼战机
    xWing = this.physics.add.sprite(150, 100, 'xWing')
        .setDisplaySize(120, 80)
        .setCollideWorldBounds(true)
        .setDrag(100);

    // 添加碰撞检测
    this.physics.add.overlap(deathStars, xWing, collisionHandler, null, this);

    // 设置摄像机震动效果
    this.cameras.main.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 设置键盘控制
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // X翼战机移动（方向键+惯性）
    const speed = 280;
    xWing.setVelocity(0);
    if (cursors.left.isDown) xWing.setVelocityX(-speed);
    if (cursors.right.isDown) xWing.setVelocityX(speed);
    if (cursors.up.isDown) xWing.setVelocityY(-speed);
    if (cursors.down.isDown) xWing.setVelocityY(speed);
}

// 碰撞处理函数
function collisionHandler() {
    if (!collisionFlag) {
        collisionFlag = true;
        // 添加碰撞特效
        this.cameras.main.shake(300, 0.02);
        deathStars.getChildren().forEach(deathStar => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(deathStar.getBounds(), xWing.getBounds())) {
                deathStar.setTint(0xFF0000);
            }
        });
        xWing.setTint(0xFF0000);
        // 弹窗提示
        setTimeout(() => {
            alert('⚡ 能量过载！死星护盾与战机发生剧烈碰撞！');
            deathStars.getChildren().forEach(deathStar => deathStar.clearTint());
            xWing.clearTint();
            collisionFlag = false;
        }, 200);
    }
}
