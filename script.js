// 游戏配置
const config = {
    gridSize: 20,           // 网格大小
    initialSpeed: 190,      // 初始速度（毫秒）
    speedIncrease: 10,      // 每升一级速度减少量（毫秒）
    maxLevel: 100,           // 最高等级
    foodValue: 10,          // 每个食物的分数
    levelUpScore: 5        // 升级所需分数
};

// 游戏状态
const gameState = {
    snake: [],              // 蛇的身体
    direction: 'right',     // 当前方向
    nextDirection: 'right', // 下一个方向
    food: null,             // 食物位置
    score: 0,               // 当前分数
    level: 1,               // 当前等级
    speed: config.initialSpeed, // 当前速度
    isRunning: false,       // 游戏是否运行
    gameLoop: null          // 游戏循环ID
};

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// 初始化游戏
function initGame() {
    // 设置蛇的初始位置
    gameState.snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    
    // 重置游戏状态
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.level = 1;
    gameState.speed = config.initialSpeed;
    gameState.isRunning = false;
    
    // 生成第一个食物
    generateFood();
    
    // 更新UI
    updateScore();
    updateLevel();
    
    // 绘制初始游戏状态
    drawGame();
}

// 生成食物
function generateFood() {
    let newFood;
    // 确保食物不会出现在蛇身上
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / config.gridSize)),
            y: Math.floor(Math.random() * (canvas.height / config.gridSize))
        };
    } while (gameState.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    gameState.food = newFood;
}

// 更新分数
function updateScore() {
    scoreElement.textContent = gameState.score;
}

// 更新等级
function updateLevel() {
    levelElement.textContent = gameState.level;
}

// 增加分数
function increaseScore() {
    gameState.score += config.foodValue;
    updateScore();
    
    // 检查是否需要升级
    if (gameState.score % config.levelUpScore === 0 && gameState.level < config.maxLevel) {
        levelUp();
    }
}

// 升级
function levelUp() {
    gameState.level++;
    gameState.speed = Math.max(config.initialSpeed - (gameState.level - 1) * config.speedIncrease, 50);
    updateLevel();
    
    // 升级提示
    showMessage(`升级了！当前等级：${gameState.level}`);
    
    // 重新设置游戏循环以应用新速度
    if (gameState.isRunning) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = setInterval(gameUpdate, gameState.speed);
    }
}

// 显示消息
function showMessage(message) {
    // 存储当前的fillStyle
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;
    
    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 4, canvas.height / 3, canvas.width / 2, canvas.height / 3);
    
    // 绘制消息
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    
    // 恢复原始设置
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
    ctx.textAlign = 'start';
    
    // 短暂显示后清除
    setTimeout(drawGame, 1500);
}

// 移动蛇
function moveSnake() {
    const head = { ...gameState.snake[0] };
    
    // 更新方向
    gameState.direction = gameState.nextDirection;
    
    // 根据方向移动头部
    switch (gameState.direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 添加新头部
    gameState.snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        increaseScore();
        generateFood();
    } else {
        // 如果没吃到食物，移除尾部
        gameState.snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = gameState.snake[0];
    const gridWidth = canvas.width / config.gridSize;
    const gridHeight = canvas.height / config.gridSize;
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    gameState.snake.forEach((segment, index) => {
        // 头部特殊颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            // 身体渐变色
            const greenShade = 120 + index * 10;
            ctx.fillStyle = `rgb(76, ${greenShade}, 80)`;
        }
        
        // 绘制蛇的身体部分
        ctx.fillRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize - 1, // 留出1像素的间隙
            config.gridSize - 1
        );
        
        // 绘制蛇的眼睛（仅头部）
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = config.gridSize / 5;
            const eyeOffset = config.gridSize / 3;
            
            // 根据方向调整眼睛位置
            switch (gameState.direction) {
                case 'up':
                    ctx.beginPath();
                    ctx.arc(segment.x * config.gridSize + eyeOffset, segment.y * config.gridSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * config.gridSize + config.gridSize - eyeOffset, segment.y * config.gridSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'down':
                    ctx.beginPath();
                    ctx.arc(segment.x * config.gridSize + eyeOffset, segment.y * config.gridSize + config.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * config.gridSize + config.gridSize - eyeOffset, segment.y * config.gridSize + config.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'left':
                    ctx.beginPath();
                    ctx.arc(segment.x * config.gridSize + eyeOffset, segment.y * config.gridSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * config.gridSize + eyeOffset, segment.y * config.gridSize + config.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'right':
                    ctx.beginPath();
                    ctx.arc(segment.x * config.gridSize + config.gridSize - eyeOffset, segment.y * config.gridSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * config.gridSize + config.gridSize - eyeOffset, segment.y * config.gridSize + config.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }
    });
    
    // 绘制食物
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * config.gridSize + config.gridSize / 2,
        gameState.food.y * config.gridSize + config.gridSize / 2,
        config.gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 如果游戏暂停，显示暂停信息
    if (!gameState.isRunning && gameState.snake.length > 3) {
        showMessage('游戏暂停');
    }
}

// 游戏更新循环
function gameUpdate() {
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    drawGame();
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);
    
    // 添加游戏结束动画效果
    canvas.classList.add('game-over');
    
    // 显示游戏结束信息
    showMessage(`游戏结束！\n最终分数：${gameState.score}\n最终等级：${gameState.level}\n点击开始按钮重新游戏`);
    
    // 移除动画效果
    setTimeout(() => {
        canvas.classList.remove('game-over');
    }, 500);
}

// 开始游戏
function startGame() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameState.gameLoop = setInterval(gameUpdate, gameState.speed);
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

// 键盘控制
function handleKeyDown(e) {
    // 防止页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // 根据按键设置方向，防止180度转向
    switch (e.key) {
        case 'ArrowUp':
            if (gameState.direction !== 'down') {
                gameState.nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
            if (gameState.direction !== 'up') {
                gameState.nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
            if (gameState.direction !== 'right') {
                gameState.nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
            if (gameState.direction !== 'left') {
                gameState.nextDirection = 'right';
            }
            break;
        case ' ': // 空格键暂停/继续
            if (gameState.isRunning) {
                pauseGame();
            } else {
                startGame();
            }
            break;
        case 'Enter': // 回车键开始/重新开始
            if (gameState.snake.length <= 3 || !gameState.isRunning) {
                restartGame();
                startGame();
            }
            break;
    }
}

// 移动端触摸控制
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 判断滑动方向
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && gameState.direction !== 'right') {
            gameState.nextDirection = 'left';
        } else if (diffX < 0 && gameState.direction !== 'left') {
            gameState.nextDirection = 'right';
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && gameState.direction !== 'down') {
            gameState.nextDirection = 'up';
        } else if (diffY < 0 && gameState.direction !== 'up') {
            gameState.nextDirection = 'down';
        }
    }
    
    // 重置触摸起始位置
    touchStartX = touchEndX;
    touchStartY = touchEndY;
}

function handleTouchEnd() {
    touchStartX = null;
    touchStartY = null;
}

// 绑定事件监听器
function setupEventListeners() {
    // 按钮控制
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyDown);
    
    // 移动端触摸控制
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // 窗口大小变化时重绘游戏
    window.addEventListener('resize', drawGame);
}

// 启动游戏
function start() {
    setupEventListeners();
    initGame();
}

// 当页面加载完成后启动游戏
window.addEventListener('load', start);
