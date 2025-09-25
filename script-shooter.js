// 游戏配置
const config = {
    playerSpeed: 15,          // 玩家移动速度
    bulletSpeed: 3,         // 子弹速度
    enemySpeed: 0.000001,           // 敌人基础移动速度
    enemySpawnRate: 10,    // 敌人生成间隔（毫秒）
    fireRate: 5,           // 射击间隔（毫秒）
    maxAmmo: 300000,             // 最大弹药量
    reloadTime: 1,        // 换弹时间（毫秒）
    initialLives: 1000000000,         // 初始生命值
    scorePerEnemy: 100,      // 每个敌人的分数
    levelUpScore: 10,      // 升级所需分数
    bulletDamage: 10000000000000000000000,         // 子弹伤害
    enemyHealth: 1,          // 敌人初始生命值
    explosionSize: 100        // 爆炸效果大小
};

// 游戏状态
const gameState = {
    player: null,            // 玩家对象
    bullets: [],             // 子弹数组
    enemies: [],             // 敌人数组
    explosions: [],          // 爆炸效果数组
    score: 0,                // 当前分数
    lives: config.initialLives, // 当前生命值
    level: 1,                // 当前关卡
    isRunning: false,        // 游戏是否运行
    gameLoop: null,          // 游戏循环ID
    lastEnemySpawn: 0,       // 上次生成敌人的时间
    lastFireTime: 0,         // 上次射击的时间
    isReloading: false,      // 是否正在换弹
    ammo: config.maxAmmo,    // 当前弹药量
    keys: {
        w: false,
        a: false,
        s: false,
        d: false
    },
    mouse: {
        x: 0,
        y: 0
    }
};

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// 初始化游戏
function initGame() {
    // 设置玩家初始位置
    gameState.player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 40,
        height: 40,
        health: config.initialLives,
        angle: 0
    };
    
    // 重置游戏状态
    gameState.bullets = [];
    gameState.enemies = [];
    gameState.explosions = [];
    gameState.score = 0;
    gameState.lives = config.initialLives;
    gameState.level = 1;
    gameState.isRunning = false;
    gameState.lastEnemySpawn = 0;
    gameState.lastFireTime = 0;
    gameState.isReloading = false;
    gameState.ammo = config.maxAmmo;
    
    // 更新UI
    updateScore();
    updateLives();
    updateLevel();
    
    // 绘制初始游戏状态
    drawGame();
}

// 更新分数
function updateScore() {
    scoreElement.textContent = gameState.score;
}

// 更新生命值
function updateLives() {
    livesElement.textContent = gameState.lives;
}

// 更新关卡
function updateLevel() {
    levelElement.textContent = gameState.level;
}

// 增加分数
function increaseScore(points) {
    gameState.score += points;
    updateScore();
    
    // 检查是否需要升级
    if (gameState.score >= gameState.level * config.levelUpScore) {
        levelUp();
    }
}

// 升级
function levelUp() {
    gameState.level++;
    updateLevel();
    
    // 升级提示
    showMessage(`升级了！当前关卡：${gameState.level}`);
}

// 显示消息
function showMessage(message) {
    // 存储当前的fillStyle
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;
    const originalTextAlign = ctx.textAlign;
    
    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 4, canvas.height / 3, canvas.width / 2, canvas.height / 3);
    
    // 绘制消息
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    
    // 恢复原始设置
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
    ctx.textAlign = originalTextAlign;
}

// 创建玩家
function createPlayer() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 40,
        height: 40,
        health: config.initialLives,
        angle: 0
    };
}

// 创建子弹
function createBullet(x, y, angle) {
    return {
        x: x,
        y: y,
        width: 8,
        height: 8,
        speed: config.bulletSpeed,
        angle: angle,
        damage: config.bulletDamage
    };
}

// 创建敌人
function createEnemy() {
    // 随机选择敌人生成的边
    const spawnSide = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (spawnSide) {
        case 0: // 上边
            x = Math.random() * canvas.width;
            y = -20;
            break;
        case 1: // 右边
            x = canvas.width + 20;
            y = Math.random() * canvas.height;
            break;
        case 2: // 下边
            x = Math.random() * canvas.width;
            y = canvas.height + 20;
            break;
        case 3: // 左边
            x = -20;
            y = Math.random() * canvas.height;
            break;
    }
    
    // 根据关卡调整敌人属性
    const enemyLevelMultiplier = 1 + (gameState.level - 1) * 0.2;
    
    return {
        x: x,
        y: y,
        width: 30,
        height: 30,
        speed: config.enemySpeed * enemyLevelMultiplier,
        health: Math.max(1, Math.floor(config.enemyHealth * enemyLevelMultiplier)),
        maxHealth: Math.max(1, Math.floor(config.enemyHealth * enemyLevelMultiplier))
    };
}

// 创建爆炸效果
function createExplosion(x, y) {
    return {
        x: x,
        y: y,
        size: 0,
        maxSize: config.explosionSize,
        alpha: 1,
        progress: 0
    };
}

// 射击
function shoot() {
    const now = Date.now();
    
    // 检查是否可以射击
    if (now - gameState.lastFireTime < config.fireRate || 
        gameState.ammo <= 0 || 
        gameState.isReloading || 
        !gameState.isRunning) {
        return;
    }
    
    // 更新射击时间
    gameState.lastFireTime = now;
    gameState.ammo--;
    
    // 计算子弹方向
    const dx = gameState.mouse.x - canvas.getBoundingClientRect().left - gameState.player.x;
    const dy = gameState.mouse.y - canvas.getBoundingClientRect().top - gameState.player.y;
    const angle = Math.atan2(dy, dx);
    
    // 创建子弹
    const bullet = createBullet(
        gameState.player.x + gameState.player.width / 2 - 4,
        gameState.player.y + gameState.player.height / 2 - 4,
        angle
    );
    
    gameState.bullets.push(bullet);
}

// 换弹
function reload() {
    if (gameState.isReloading || gameState.ammo >= config.maxAmmo || !gameState.isRunning) {
        return;
    }
    
    gameState.isReloading = true;
    
    // 显示换弹提示
    showReloadIndicator();
    
    // 换弹完成后填充弹药
    setTimeout(() => {
        gameState.ammo = config.maxAmmo;
        gameState.isReloading = false;
    }, config.reloadTime);
}

// 显示换弹提示
function showReloadIndicator() {
    // 这个函数会在drawGame中被调用
}

// 移动玩家
function movePlayer() {
    const player = gameState.player;
    
    // 根据按键移动玩家
    if (gameState.keys.w) {
        player.y = Math.max(0, player.y - config.playerSpeed);
    }
    if (gameState.keys.s) {
        player.y = Math.min(canvas.height - player.height, player.y + config.playerSpeed);
    }
    if (gameState.keys.a) {
        player.x = Math.max(0, player.x - config.playerSpeed);
    }
    if (gameState.keys.d) {
        player.x = Math.min(canvas.width - player.width, player.x + config.playerSpeed);
    }
    
    // 计算玩家朝向（面向鼠标）
    const dx = gameState.mouse.x - canvas.getBoundingClientRect().left - player.x - player.width / 2;
    const dy = gameState.mouse.y - canvas.getBoundingClientRect().top - player.y - player.height / 2;
    player.angle = Math.atan2(dy, dx);
}

// 移动子弹
function moveBullets() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        
        // 根据角度移动子弹
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        
        // 移除超出画布的子弹
        if (bullet.x < -bullet.width || 
            bullet.x > canvas.width || 
            bullet.y < -bullet.height || 
            bullet.y > canvas.height) {
            gameState.bullets.splice(i, 1);
        }
    }
}

// 移动敌人
function moveEnemies() {
    for (let i = 0; i < gameState.enemies.length; i++) {
        const enemy = gameState.enemies[i];
        
        // 计算敌人朝向（面向玩家）
        const dx = gameState.player.x + gameState.player.width / 2 - enemy.x - enemy.width / 2;
        const dy = gameState.player.y + gameState.player.height / 2 - enemy.y - enemy.height / 2;
        const angle = Math.atan2(dy, dx);
        
        // 根据角度移动敌人
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;
    }
}

// 更新爆炸效果
function updateExplosions() {
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
        const explosion = gameState.explosions[i];
        
        // 更新爆炸进度
        explosion.progress += 0.05;
        
        // 计算爆炸大小和透明度
        explosion.size = explosion.maxSize * (0.5 - 0.5 * Math.cos(explosion.progress * Math.PI));
        explosion.alpha = 1 - explosion.progress;
        
        // 移除完成的爆炸效果
        if (explosion.progress >= 1) {
            gameState.explosions.splice(i, 1);
        }
    }
}

// 生成敌人
function spawnEnemies() {
    const now = Date.now();
    
    // 根据当前关卡调整生成速度
    const spawnRateMultiplier = Math.max(0.3, 1 - (gameState.level - 1) * 0.05);
    const currentSpawnRate = config.enemySpawnRate * spawnRateMultiplier;
    
    // 检查是否应该生成敌人
    if (now - gameState.lastEnemySpawn > currentSpawnRate) {
        gameState.lastEnemySpawn = now;
        
        // 生成敌人
        const enemy = createEnemy();
        gameState.enemies.push(enemy);
    }
}

// 检查碰撞
function checkCollisions() {
    // 子弹和敌人的碰撞
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            
            // 检查碰撞
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // 敌人受伤
                enemy.health -= bullet.damage;
                
                // 移除子弹
                gameState.bullets.splice(i, 1);
                
                // 检查敌人是否死亡
                if (enemy.health <= 0) {
                    // 创建爆炸效果
                    const explosion = createExplosion(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2
                    );
                    gameState.explosions.push(explosion);
                    
                    // 增加分数
                    increaseScore(config.scorePerEnemy);
                    
                    // 移除敌人
                    gameState.enemies.splice(j, 1);
                }
                
                break;
            }
        }
    }
    
    // 敌人和玩家的碰撞
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        
        // 检查碰撞
        if (gameState.player.x < enemy.x + enemy.width &&
            gameState.player.x + gameState.player.width > enemy.x &&
            gameState.player.y < enemy.y + enemy.height &&
            gameState.player.y + gameState.player.height > enemy.y) {
            
            // 创建爆炸效果
            const explosion = createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2
            );
            gameState.explosions.push(explosion);
            
            // 移除敌人
            gameState.enemies.splice(i, 1);
            
            // 玩家受伤
            gameState.lives--;
            updateLives();
            
            // 检查游戏是否结束
            if (gameState.lives <= 0) {
                gameOver();
                return;
            }
        }
    }
}

// 绘制玩家
function drawPlayer() {
    const player = gameState.player;
    
    ctx.save();
    
    // 移动到玩家中心并旋转
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.angle);
    
    // 绘制玩家主体
    ctx.fillStyle = '#00ffaa';
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // 绘制玩家边框
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // 绘制枪管
    ctx.fillStyle = '#333';
    ctx.fillRect(player.width / 2, -5, 15, 10);
    
    ctx.restore();
}

// 绘制子弹
function drawBullets() {
    ctx.fillStyle = '#ffaa00';
    
    for (let i = 0; i < gameState.bullets.length; i++) {
        const bullet = gameState.bullets[i];
        
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// 绘制敌人
function drawEnemies() {
    for (let i = 0; i < gameState.enemies.length; i++) {
        const enemy = gameState.enemies[i];
        
        // 根据生命值绘制不同颜色
        const healthRatio = enemy.health / enemy.maxHealth;
        const red = Math.floor(255 * (1 - healthRatio));
        const green = Math.floor(255 * healthRatio);
        ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
        
        // 绘制敌人主体
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 绘制敌人边框
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

// 绘制爆炸效果
function drawExplosions() {
    for (let i = 0; i < gameState.explosions.length; i++) {
        const explosion = gameState.explosions[i];
        
        // 创建渐变
        const gradient = ctx.createRadialGradient(
            explosion.x,
            explosion.y,
            0,
            explosion.x,
            explosion.y,
            explosion.size
        );
        
        gradient.addColorStop(0, `rgba(255, 107, 107, ${explosion.alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 217, 61, ${explosion.alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(255, 140, 66, ${explosion.alpha * 0.5})`);
        
        // 绘制爆炸
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制弹药信息
function drawAmmoInfo() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    // 绘制弹药数量
    ctx.fillText(`弹药: ${gameState.ammo}/${config.maxAmmo}`, 10, 30);
    
    // 如果正在换弹，显示换弹进度
    if (gameState.isReloading) {
        const reloadProgress = (Date.now() - gameState.lastFireTime) / config.reloadTime;
        const progressBarWidth = 100;
        const progressWidth = progressBarWidth * reloadProgress;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 40, progressBarWidth, 10);
        
        ctx.fillStyle = '#00ffaa';
        ctx.fillRect(10, 40, progressWidth, 10);
        
        ctx.fillStyle = 'white';
        ctx.fillText('换弹中...', 120, 50);
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    drawBackground();
    
    // 绘制游戏元素
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawExplosions();
    
    // 绘制游戏信息
    drawAmmoInfo();
    
    // 如果游戏暂停，显示暂停信息
    if (!gameState.isRunning && gameState.score > 0) {
        showMessage('游戏暂停');
    }
    
    // 如果游戏未开始，显示开始信息
    if (!gameState.isRunning && gameState.score === 0) {
        showMessage('点击开始游戏');
    }
}

// 绘制背景
function drawBackground() {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 游戏更新循环
function gameUpdate() {
    if (!gameState.isRunning) return;
    
    // 生成敌人
    spawnEnemies();
    
    // 移动游戏元素
    movePlayer();
    moveBullets();
    moveEnemies();
    
    // 更新爆炸效果
    updateExplosions();
    
    // 检查碰撞
    checkCollisions();
    
    // 绘制游戏
    drawGame();
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);
    
    // 显示游戏结束信息
    showMessage(`游戏结束！\n最终分数：${gameState.score}\n最终关卡：${gameState.level}\n点击开始按钮重新游戏`);
}

// 开始游戏
function startGame() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameState.gameLoop = setInterval(gameUpdate, 16); // 约60fps
        startBtn.textContent = '继续';
    }
}

// 暂停游戏
function pauseGame() {
    if (gameState.isRunning) {
        gameState.isRunning = false;
        clearInterval(gameState.gameLoop);
        drawGame();
        startBtn.textContent = '继续';
    }
}

// 重新开始游戏
function restartGame() {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);
    initGame();
    startBtn.textContent = '开始游戏';
}

// 键盘按下事件处理
function handleKeyDown(e) {
    // 防止页面滚动
    if (['w', 'a', 's', 'd', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    
    // 更新按键状态
    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            gameState.keys.w = true;
            break;
        case 's':
        case 'arrowdown':
            gameState.keys.s = true;
            break;
        case 'a':
        case 'arrowleft':
            gameState.keys.a = true;
            break;
        case 'd':
        case 'arrowright':
            gameState.keys.d = true;
            break;
        case ' ':
            reload();
            break;
        case 'enter':
            if (gameState.score === 0 || !gameState.isRunning) {
                restartGame();
                startGame();
            }
            break;
    }
}

// 键盘松开事件处理
function handleKeyUp(e) {
    // 更新按键状态
    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            gameState.keys.w = false;
            break;
        case 's':
        case 'arrowdown':
            gameState.keys.s = false;
            break;
        case 'a':
        case 'arrowleft':
            gameState.keys.a = false;
            break;
        case 'd':
        case 'arrowright':
            gameState.keys.d = false;
            break;
    }
}

// 鼠标移动事件处理
function handleMouseMove(e) {
    gameState.mouse.x = e.clientX;
    gameState.mouse.y = e.clientY;
}

// 鼠标点击事件处理
function handleMouseClick(e) {
    // 只有左键点击才射击
    if (e.button === 0) {
        shoot();
    }
}

// 鼠标按下事件处理（连续射击）
function handleMouseDown(e) {
    // 只有左键按下才开始连续射击
    if (e.button === 0) {
        // 立即射击一次
        shoot();
        
        // 设置连续射击间隔
        if (!gameState.isReloading && gameState.ammo > 0 && gameState.isRunning) {
            gameState.continuousFireInterval = setInterval(shoot, config.fireRate);
        }
    }
}

// 鼠标松开事件处理（停止连续射击）
function handleMouseUp(e) {
    // 只有左键松开才停止连续射击
    if (e.button === 0 && gameState.continuousFireInterval) {
        clearInterval(gameState.continuousFireInterval);
        gameState.continuousFireInterval = null;
    }
}

// 绑定事件监听器
function setupEventListeners() {
    // 按钮控制
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // 鼠标控制
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp); // 使用document以支持鼠标移出画布时停止射击
    
    // 窗口大小变化时重绘游戏
    window.addEventListener('resize', drawGame);
    
    // 防止右键菜单
    canvas.addEventListener('contextmenu', e => e.preventDefault());
}

// 启动游戏
function start() {
    setupEventListeners();
    initGame();
}

// 当页面加载完成后启动游戏
window.addEventListener('load', start);