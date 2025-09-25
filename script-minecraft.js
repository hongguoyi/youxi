// 游戏配置
// 高级版本配置
const config = {
    blockSize: 30,         // 方块大小
    renderDistance: 12,    // 渲染距离
    playerSpeed: 4,        // 玩家移动速度
    sneakSpeed: 2,         // 潜行速度
    jumpHeight: 8,         // 跳跃高度
    gravity: 0.5,          // 重力
    initialHealth: 20,     // 初始生命值
    initialHunger: 20,     // 初始饥饿度
    dayCycleLength: 20000, // 日夜循环长度（毫秒）
    toolDurability: {
        wood: 59,
        stone: 131,
        iron: 250,
        gold: 32,
        diamond: 1561
    }
};

// 游戏状态
const gameState = {
    world: [],             // 世界数据
    player: {
        x: 0,              // 玩家X坐标
        y: 0,              // 玩家Y坐标（高度）
        z: 0,              // 玩家Z坐标
        dx: 0,             // 移动方向X
        dz: 0,             // 移动方向Z
        rx: 0,             // 旋转角度X
        ry: 0,             // 旋转角度Y
        velocityY: 0,      // Y方向速度
        onGround: false,   // 是否在地面上
        sneaking: false,   // 是否在潜行
        flying: false,     // 是否在飞行
        isSprinting: false // 是否在 sprint
    },
    camera: {
        fov: 90,           // 视场角
        aspect: 1000/700,  // 宽高比
        near: 0.1,         // 近平面
        far: 1000,         // 远平面
        mode: 'firstPerson' // 视角模式：firstPerson, thirdPerson
    },
    selectedSlot: 0,       // 当前选中的快捷栏槽位
    hotbar: [
        {type: 'grass', count: 64},
        {type: 'dirt', count: 64},
        {type: 'stone', count: 64},
        {type: 'wood', count: 64},
        {type: 'glass', count: 64},
        {type: 'cobblestone', count: 32},
        {type: 'plank', count: 32},
        {type: 'leaves', count: 32},
        {type: 'bedrock', count: 1}
    ],
    inventory: [
        {type: 'grass', count: 64},
        {type: 'dirt', count: 64},
        {type: 'stone', count: 64},
        {type: 'wood', count: 64},
        {type: 'glass', count: 64},
        {type: 'cobblestone', count: 32},
        {type: 'plank', count: 32},
        {type: 'leaves', count: 32},
        {type: 'bedrock', count: 1},
        {type: null, count: 0},
        {type: null, count: 0},
        {type: null, count: 0},
        {type: null, count: 0},
        {type: null, count: 0},
        {type: null, count: 0},
        {type: null, count: 0},
        {type: null, count: 0},
        {type: null, count: 0}
    ],
    health: config.initialHealth, // 生命值
    hunger: config.initialHunger, // 饥饿度
    dayTime: 12000,        // 游戏时间（0-24000） - 设置为中午时间
    isDay: true,           // 是否是白天
    keys: {},              // 键盘状态
    mouse: {x: 0, y: 0},   // 鼠标位置
    mouseDown: false,      // 鼠标按下状态
    isRunning: false,      // 游戏是否运行
    gameLoop: null,        // 游戏循环ID
    lastFrameTime: 0,      // 上一帧时间
    fps: 60,               // 当前FPS
    biome: 'plains',       // 当前生物群系
    showInventory: false,  // 是否显示背包
    showCrafting: false,   // 是否显示合成界面
    weather: 'clear',      // 天气状态：clear, rain, snow
    entities: [],          // 实体列表
    stats: {               // 游戏统计
        blocksPlaced: 0,
        blocksDestroyed: 0,
        timePlayed: 0
    },
    craftingRecipes: {     // 合成配方
        'plank': [['wood', 'wood', ''], ['wood', 'wood', ''], ['', '', '']],
        'cobblestone': [['stone', 'stone', 'stone'], ['stone', '', 'stone'], ['stone', 'stone', 'stone']],
        'leaves': [['wood', 'wood', 'wood'], ['wood', 'wood', 'wood'], ['wood', 'wood', 'wood']]
    }
};

// 为背包添加一些初始物品
for (let i = 0; i < 27; i++) {
    gameState.inventory.push({type: null, count: 0});
}

// 方块类型定义 - 高级版本
const blockTypes = {
    grass: {
        color: '#4CAF50',
        name: '草方块',
        solid: true,
        hardness: 0.6,
        tool: 'shovel',
        drops: 'dirt'
    },
    dirt: {
        color: '#8B4513',
        name: '泥土',
        solid: true,
        hardness: 0.5,
        tool: 'shovel',
        drops: 'dirt'
    },
    stone: {
        color: '#A9A9A9',
        name: '石头',
        solid: true,
        hardness: 1.5,
        tool: 'pickaxe',
        drops: 'cobblestone'
    },
    wood: {
        color: '#8B4513',
        name: '木头',
        solid: true,
        hardness: 2.0,
        tool: 'axe',
        drops: 'wood'
    },
    glass: {
        color: '#E0FFFF',
        name: '玻璃',
        solid: false,
        alpha: 0.7,
        hardness: 0.3,
        drops: null
    },
    cobblestone: {
        color: '#707070',
        name: '圆石',
        solid: true,
        hardness: 2.0,
        tool: 'pickaxe',
        drops: 'cobblestone'
    },
    ore: {
        color: '#FFD700',
        name: '铁矿石',
        solid: true,
        hardness: 3.0,
        tool: 'pickaxe',
        drops: 'iron-ore'
    },
    coal: {
        color: '#2F4F4F',
        name: '煤矿石',
        solid: true,
        hardness: 3.0,
        tool: 'pickaxe',
        drops: 'coal'
    },
    sand: {
        color: '#F4A460',
        name: '沙子',
        solid: true,
        hardness: 0.5,
        tool: 'shovel',
        drops: 'sand'
    },
    water: {
        color: '#1E90FF',
        name: '水',
        solid: false,
        alpha: 0.6,
        liquid: true
    },
    leaves: {
        color: '#00FF00',
        name: '树叶',
        solid: true,
        hardness: 0.2,
        transparent: true,
        alpha: 0.8,
        drops: 'sapling',
        dropChance: 0.05
    },
    bedrock: {
        color: '#444444',
        name: '基岩',
        solid: true,
        hardness: -1, // 不可破坏
        drops: null
    }
};

// 物品类型定义
const itemTypes = {
    dirt: {
        name: '泥土',
        color: '#8B4513',
        stackable: true,
        maxStack: 64
    },
    cobblestone: {
        name: '圆石',
        color: '#707070',
        stackable: true,
        maxStack: 64
    },
    wood: {
        name: '木头',
        color: '#8B4513',
        stackable: true,
        maxStack: 64
    },
    coal: {
        name: '煤炭',
        color: '#2F4F4F',
        stackable: true,
        maxStack: 64
    },
    'iron-ore': {
        name: '铁矿石',
        color: '#FFD700',
        stackable: true,
        maxStack: 64
    },
    sapling: {
        name: '树苗',
        color: '#00AA00',
        stackable: true,
        maxStack: 64,
        placeable: 'sapling-block'
    },
    'tool-pickaxe': {
        name: '木镐',
        color: '#8B4513',
        stackable: false,
        durability: 59,
        toolType: 'pickaxe',
        miningLevel: 1
    },
    'tool-axe': {
        name: '木斧',
        color: '#8B4513',
        stackable: false,
        durability: 59,
        toolType: 'axe',
        miningLevel: 1
    },
    'tool-shovel': {
        name: '木铲',
        color: '#8B4513',
        stackable: false,
        durability: 59,
        toolType: 'shovel',
        miningLevel: 1
    }
};

// 生物群系定义
const biomes = {
    plains: {
        name: '平原',
        groundBlock: 'grass',
        subsurfaceBlock: 'dirt',
        heightVariation: 0.3,
        treeDensity: 0.01,
        lakeChance: 0.05
    },
    forest: {
        name: '森林',
        groundBlock: 'grass',
        subsurfaceBlock: 'dirt',
        heightVariation: 0.4,
        treeDensity: 0.05,
        lakeChance: 0.03
    },
    desert: {
        name: '沙漠',
        groundBlock: 'sand',
        subsurfaceBlock: 'sand',
        heightVariation: 0.6,
        treeDensity: 0.001,
        lakeChance: 0.01
    },
    mountains: {
        name: '山地',
        groundBlock: 'grass',
        subsurfaceBlock: 'dirt',
        heightVariation: 1.0,
        treeDensity: 0.02,
        lakeChance: 0.02
    }
};

// DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const healthElement = document.getElementById('health-value');
const hungerElement = document.getElementById('hunger-value');
const airElement = document.getElementById('air-value');
const airBarElement = document.querySelector('.air-fill');
const healthBarElement = document.querySelector('.health-fill');
const hungerBarElement = document.querySelector('.hunger-fill');
const posXElement = document.getElementById('pos-x');
const posYElement = document.getElementById('pos-y');
const posZElement = document.getElementById('pos-z');
const dayTimeElement = document.getElementById('day-time');
const biomeElement = document.getElementById('biome-name');
const fpsElement = document.getElementById('fps');
const inventoryElement = document.getElementById('inventory');
const craftingElement = document.getElementById('crafting');
const hotbarElement = document.getElementById('hotbar');
const hotbarSlots = [];

// 初始化游戏
function initGame() {
    // 设置画布大小
    canvas.width = 800;
    canvas.height = 600;
    gameState.camera.aspect = canvas.width / canvas.height;
    
    // 初始化玩家空气值
    gameState.player.air = 300;
    
    // 生成世界
    generateWorld();
    
    // 生成一些初始实体
    generateInitialEntities();
    
    // 初始化快捷栏显示
    updateHotbar();
    
    // 添加事件监听器
    addEventListeners();
    
    // 更新UI
    updateUI();
    
    // 开始游戏循环
    startGameLoop();
}

// 生成初始实体
function generateInitialEntities() {
    // 随机生成一些动物实体
    const animalCount = 5;
    const worldSize = 32;
    
    for (let i = 0; i < animalCount; i++) {
        const x = Math.random() * worldSize * 2 - worldSize;
        const z = Math.random() * worldSize * 2 - worldSize;
        
        // 找到这个位置的地面高度
        let groundY = 0;
        for (const block of gameState.world) {
            if (block.x === Math.round(x) && block.z === Math.round(z) && block.y > groundY) {
                groundY = block.y + 1; // 放在方块上方
            }
        }
        
        // 添加动物实体
        gameState.entities.push({
            type: 'animal',
            x: x,
            y: groundY,
            z: z,
            direction: Math.random() * Math.PI * 2,
            speed: 0,
            health: 10,
            isMoving: false
        });
    }
}

// 生成世界
function generateWorld() {
    // 简单的地形生成
    const worldSize = 32;
    
    for (let x = -worldSize; x <= worldSize; x++) {
        for (let z = -worldSize; z <= worldSize; z++) {
            // 简单的噪声生成地形高度
            const height = Math.floor(Math.sin(x * 0.2) * 3 + Math.cos(z * 0.2) * 3 + 5);
            
            // 在地面上放置草方块
            gameState.world.push({
                x: x,
                y: height,
                z: z,
                type: 'grass'
            });
            
            // 在草方块下面放置几层泥土
            for (let y = height - 1; y >= height - 3; y--) {
                gameState.world.push({
                    x: x,
                    y: y,
                    z: z,
                    type: 'dirt'
                });
            }
            
            // 在泥土下面放置石头
            for (let y = height - 4; y >= 0; y--) {
                gameState.world.push({
                    x: x,
                    y: y,
                    z: z,
                    type: 'stone'
                });
            }
        }
    }
    
    // 设置玩家初始位置
    gameState.player.x = 0;
    gameState.player.y = 10;
    gameState.player.z = 0;
}

// 添加事件监听器
function addEventListeners() {
    // 键盘事件
    window.addEventListener('keydown', (e) => {
        gameState.keys[e.key.toLowerCase()] = true;
        
        // 数字键1-9选择快捷栏
        const keyNum = parseInt(e.key);
        if (keyNum >= 1 && keyNum <= 9) {
            gameState.selectedSlot = keyNum - 1;
            updateHotbar();
        }
        
        // E键打开背包
        if (e.key.toLowerCase() === 'e') {
            toggleInventory();
        }
        
        // F键切换视角
        if (e.key.toLowerCase() === 'f') {
            toggleCameraMode();
        }
        
        // C键打开合成界面
        if (e.key.toLowerCase() === 'c') {
            toggleCrafting();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        gameState.keys[e.key.toLowerCase()] = false;
    });
    
    // 鼠标事件
    canvas.addEventListener('mousedown', (e) => {
        gameState.mouseDown = true;
        handleMouseClick(e);
    });
    
    canvas.addEventListener('mouseup', () => {
        gameState.mouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        gameState.mouse.x = e.clientX - rect.left;
        gameState.mouse.y = e.clientY - rect.top;
    });
    
    // 禁止右键菜单
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // 使画布获取焦点以便捕获键盘事件
    canvas.tabIndex = 0;
    
    // 添加焦点样式变化
    canvas.addEventListener('focus', () => {
        canvas.style.outline = '2px solid #4CAF50';
        canvas.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
    });
    
    canvas.addEventListener('blur', () => {
        canvas.style.outline = '1px solid #666';
        canvas.style.boxShadow = 'none';
    });
    
    // 点击画布时获取焦点
    canvas.addEventListener('click', () => {
        canvas.focus();
    });
    
    // 初始化焦点
    canvas.focus();
}

// 处理鼠标点击
function handleMouseClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 射线检测，找出玩家看向的方块
    const hitBlock = raycast(mouseX, mouseY);
    
    if (hitBlock) {
        if (e.button === 0) { // 左键 - 破坏方块
            if (hitBlock.block.type !== 'grass' || gameState.player.y > hitBlock.block.y + 1) { // 防止挖自己脚下的方块导致掉落
                // 获取方块类型对应的物品
                const blockType = blockTypes[hitBlock.block.type];
                const dropItem = blockType.drops || hitBlock.block.type;
                
                // 从世界中移除方块
                gameState.world = gameState.world.filter(block => 
                    block.x !== hitBlock.block.x || 
                    block.y !== hitBlock.block.y || 
                    block.z !== hitBlock.block.z
                );
                
                // 添加到玩家背包
                addItemToInventory(dropItem);
                
                // 更新游戏统计
                gameState.stats.blocksDestroyed++;
                
                // 播放破坏方块的视觉效果
                createBlockBreakParticles(hitBlock.block);
                
                updateUI();
            }
        } else if (e.button === 2) { // 右键 - 放置方块
            // 从快捷栏获取选中的方块类型
            const selectedItem = gameState.hotbar[gameState.selectedSlot];
            if (selectedItem && selectedItem.type && selectedItem.count > 0) {
                // 检查物品是否是可放置的方块（不是工具）
                const itemType = itemTypes[selectedItem.type];
                const blockType = blockTypes[selectedItem.type];
                
                // 如果物品存在且不是工具，或者是可放置的方块类型
                if ((itemType && !itemType.toolType) || blockType) {
                    // 在射线与方块相交的位置放置新方块
                    const placePos = {
                        x: hitBlock.block.x + hitBlock.normal.x,
                        y: hitBlock.block.y + hitBlock.normal.y,
                        z: hitBlock.block.z + hitBlock.normal.z
                    };
                    
                    // 检查位置是否有效（不在玩家碰撞箱内）
                    const playerBox = {
                        minX: gameState.player.x - 0.5,
                        maxX: gameState.player.x + 0.5,
                        minY: gameState.player.y,
                        maxY: gameState.player.y + 1.8,
                        minZ: gameState.player.z - 0.5,
                        maxZ: gameState.player.z + 0.5
                    };
                    
                    const newBlockBox = {
                        minX: placePos.x - 0.5,
                        maxX: placePos.x + 0.5,
                        minY: placePos.y,
                        maxY: placePos.y + 1,
                        minZ: placePos.z - 0.5,
                        maxZ: placePos.z + 0.5
                    };
                    
                    // 检查是否有方块重叠
                    const blockExists = gameState.world.some(block => 
                        block.x === placePos.x && 
                        block.y === placePos.y && 
                        block.z === placePos.z
                    );
                    
                    if (!blockExists && !isBoxColliding(playerBox, newBlockBox)) {
                        // 放置方块
                        gameState.world.push({
                            x: placePos.x,
                            y: placePos.y,
                            z: placePos.z,
                            type: selectedItem.type
                        });
                        
                        // 减少快捷栏中的物品数量
                        gameState.hotbar[gameState.selectedSlot].count--;
                        if (gameState.hotbar[gameState.selectedSlot].count <= 0) {
                            gameState.hotbar[gameState.selectedSlot] = { type: '', count: 0 };
                        }
                        
                        // 更新游戏统计
                        gameState.stats.blocksPlaced++;
                        
                        // 播放放置方块的视觉效果
                        createBlockPlaceEffect(placePos);
                        
                        updateUI();
                        updateHotbar();
                    }
                }
            }
        }
    }
}

// 射线检测
function raycast(screenX, screenY) {
    // 将屏幕坐标转换为归一化设备坐标
    const ndcX = (screenX / canvas.width) * 2 - 1;
    const ndcY = -(screenY / canvas.height) * 2 + 1;
    
    // 计算射线方向
    const aspect = canvas.width / canvas.height;
    const fov = gameState.camera.fov * Math.PI / 180;
    const tanHalfFov = Math.tan(fov / 2);
    
    // 射线方向（相机空间）
    const rayDirX = ndcX * tanHalfFov * aspect;
    const rayDirY = ndcY * tanHalfFov;
    const rayDirZ = -1;
    
    // 应用相机旋转
    const cosRy = Math.cos(gameState.player.ry);
    const sinRy = Math.sin(gameState.player.ry);
    const cosRx = Math.cos(gameState.player.rx);
    const sinRx = Math.sin(gameState.player.rx);
    
    // 计算世界空间中的射线方向
    const dirX = rayDirX * cosRy - rayDirZ * sinRy;
    const dirY = rayDirY;
    const dirZ = rayDirX * sinRy + rayDirZ * cosRy;
    
    const finalDirX = dirX;
    const finalDirY = dirY * cosRx - dirZ * sinRx;
    const finalDirZ = dirY * sinRx + dirZ * cosRx;
    
    // 射线起点（玩家位置）
    const startX = gameState.player.x;
    const startY = gameState.player.y + 1.6; // 眼睛高度
    const startZ = gameState.player.z;
    
    // 找出射线与最近方块的交点
    let closestBlock = null;
    let closestDistance = Infinity;
    let closestNormal = null;
    
    // 遍历玩家周围的方块
    const renderDist = config.renderDistance;
    for (const block of gameState.world) {
        // 只检查渲染距离内的方块
        const distToPlayer = Math.sqrt(
            Math.pow(block.x - startX, 2) +
            Math.pow(block.y - startY, 2) +
            Math.pow(block.z - startZ, 2)
        );
        
        if (distToPlayer > renderDist * 2) continue;
        
        // AABB碰撞检测
        const tMin = rayAABBIntersection(
            startX, startY, startZ,
            finalDirX, finalDirY, finalDirZ,
            block.x - 0.5, block.y, block.z - 0.5, // 方块边界
            block.x + 0.5, block.y + 1, block.z + 0.5
        );
        
        if (tMin > 0 && tMin < closestDistance && tMin < renderDist) {
            closestDistance = tMin;
            closestBlock = block;
            
            // 计算碰撞法线
            const hitX = startX + finalDirX * tMin;
            const hitY = startY + finalDirY * tMin;
            const hitZ = startZ + finalDirZ * tMin;
            
            const dx = Math.abs(hitX - block.x);
            const dy = Math.abs(hitY - (block.y + 0.5));
            const dz = Math.abs(hitZ - block.z);
            
            if (dx > dy && dx > dz) {
                closestNormal = {x: hitX > block.x ? 1 : -1, y: 0, z: 0};
            } else if (dy > dz) {
                closestNormal = {x: 0, y: hitY > block.y + 0.5 ? 1 : -1, z: 0};
            } else {
                closestNormal = {x: 0, y: 0, z: hitZ > block.z ? 1 : -1};
            }
        }
    }
    
    if (closestBlock) {
        return {
            block: closestBlock,
            distance: closestDistance,
            normal: closestNormal
        };
    }
    
    return null;
}

// 射线与AABB盒碰撞检测
function rayAABBIntersection(rayOriginX, rayOriginY, rayOriginZ, rayDirX, rayDirY, rayDirZ, boxMinX, boxMinY, boxMinZ, boxMaxX, boxMaxY, boxMaxZ) {
    const t1 = (boxMinX - rayOriginX) / rayDirX;
    const t2 = (boxMaxX - rayOriginX) / rayDirX;
    const t3 = (boxMinY - rayOriginY) / rayDirY;
    const t4 = (boxMaxY - rayOriginY) / rayDirY;
    const t5 = (boxMinZ - rayOriginZ) / rayDirZ;
    const t6 = (boxMaxZ - rayOriginZ) / rayDirZ;
    
    const tMin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const tMax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
    
    if (tMax < 0 || tMin > tMax) {
        return -1; // 无碰撞
    }
    
    return tMin > 0 ? tMin : tMax;
}

// 检查两个盒子是否碰撞
function isBoxColliding(box1, box2) {
    return box1.maxX > box2.minX && 
           box1.minX < box2.maxX && 
           box1.maxY > box2.minY && 
           box1.minY < box2.maxY && 
           box1.maxZ > box2.minZ && 
           box1.minZ < box2.maxZ;
}

// 更新玩家状态
function updatePlayer(deltaTime) {
    // 获取玩家状态
    const player = gameState.player;
    
    // 检查潜行和 sprint状态
    player.sneaking = gameState.keys['shift'] || gameState.keys['control'];
    player.isSprinting = gameState.keys['w'] && gameState.keys['shift'] && !player.sneaking && player.onGround;
    
    // 计算移动方向
    let moveX = 0;
    let moveZ = 0;
    
    if (gameState.keys['w']) {
        moveX -= Math.sin(player.ry);
        moveZ += Math.cos(player.ry);
    }
    if (gameState.keys['s']) {
        moveX += Math.sin(player.ry);
        moveZ -= Math.cos(player.ry);
    }
    if (gameState.keys['a']) {
        moveX -= Math.cos(player.ry);
        moveZ -= Math.sin(player.ry);
    }
    if (gameState.keys['d']) {
        moveX += Math.cos(player.ry);
        moveZ += Math.sin(player.ry);
    }
    
    // 应用跳跃
    if (gameState.keys[' '] && player.onGround) {
        player.velocityY = config.jumpHeight;
        player.onGround = false;
    }
    
    // 应用重力
    player.velocityY -= config.gravity * deltaTime;
    
    // 归一化移动向量并应用速度
    let baseSpeed = player.sneaking ? config.sneakSpeed : (player.isSprinting ? config.playerSpeed * 1.3 : config.playerSpeed);
    
    // 检查玩家是否在水中
    const isInWater = isPlayerInWater();
    
    // 水中移动速度调整
    if (isInWater) {
        // 水中移动速度降低
        baseSpeed *= 0.2;
        
        // 水中可以上浮和下潜
        if (gameState.keys[' ']) {
            player.velocityY += 0.08 * deltaTime; // 上浮
        }
        if (gameState.keys['shift']) {
            player.velocityY -= 0.04 * deltaTime; // 下潜
        }
        
        // 应用浮力
        if (!gameState.keys['shift']) {
            player.velocityY += 0.03 * deltaTime; // 自然上浮
        }
        
        // 水中呼吸管理
        if (!gameState.player.air) {
            gameState.player.air = 300; // 初始化空气值（约15秒）
        }
        
        gameState.player.air -= deltaTime;
        if (gameState.player.air < 0) {
            // 空气耗尽，开始扣血
            if (Math.random() < 0.05) {
                gameState.health -= 1;
                gameState.player.air = 0;
            }
        }
    } else {
        // 不在水中，恢复空气值
        if (gameState.player.air < 300) {
            gameState.player.air += deltaTime * 2;
            if (gameState.player.air > 300) {
                gameState.player.air = 300;
            }
        }
    }
    
    // 饥饿度对移动速度的影响
    if (gameState.hunger < 6) {
        // 饥饿值过低，移动速度大幅降低
        baseSpeed *= 0.3;
    } else if (gameState.hunger < 18) {
        // 饥饿值中等，移动速度略微降低
        baseSpeed *= 0.8;
    }
    
    const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveLength > 0) {
        player.dx = (moveX / moveLength) * baseSpeed * deltaTime;
        player.dz = (moveZ / moveLength) * baseSpeed * deltaTime;
    } else {
        player.dx = 0;
        player.dz = 0;
    }
    
    // 碰撞检测
    let newX = player.x + player.dx;
    let newY = player.y + player.velocityY;
    let newZ = player.z + player.dz;
    
    let collisionX = false;
    let collisionY = false;
    let collisionZ = false;
    
    // 玩家碰撞箱
    const playerBox = {
        minX: newX - 0.5,
        maxX: newX + 0.5,
        minY: newY,
        maxY: player.sneaking ? newY + 1.5 : newY + 1.8,
        minZ: newZ - 0.5,
        maxZ: newZ + 0.5
    };
    
    // 检查与每个方块的碰撞
    for (const block of gameState.world) {
        const blockType = blockTypes[block.type];
        if (!blockType.solid) continue; // 忽略非固体方块
        
        const blockBox = {
            minX: block.x - 0.5,
            maxX: block.x + 0.5,
            minY: block.y,
            maxY: block.y + 1,
            minZ: block.z - 0.5,
            maxZ: block.z + 0.5
        };
        
        // X方向碰撞检测
        if (isBoxColliding(playerBox, blockBox)) {
            if (player.dx > 0) {
                newX = blockBox.minX - 0.5;
            } else if (player.dx < 0) {
                newX = blockBox.maxX + 0.5;
            }
            collisionX = true;
        }
        
        // Z方向碰撞检测
        if (isBoxColliding(playerBox, blockBox)) {
            if (player.dz > 0) {
                newZ = blockBox.minZ - 0.5;
            } else if (player.dz < 0) {
                newZ = blockBox.maxZ + 0.5;
            }
            collisionZ = true;
        }
        
        // Y方向碰撞检测
        const testBox = {
            minX: player.x - 0.5,
            maxX: player.x + 0.5,
            minY: newY,
            maxY: player.sneaking ? newY + 1.5 : newY + 1.8,
            minZ: player.z - 0.5,
            maxZ: player.z + 0.5
        };
        
        if (isBoxColliding(testBox, blockBox)) {
            if (player.velocityY < 0) {
                player.onGround = true;
                player.velocityY = 0;
            } else if (player.velocityY > 0) {
                player.velocityY = 0;
            }
            collisionY = true;
        }
    }
    
    // 应用移动（排除碰撞方向）
    if (!collisionX) {
        player.x = newX;
    }
    if (!collisionY) {
        player.y = newY;
    } else {
        // 如果在空中发生碰撞，设置为地面状态
        if (player.velocityY < 0) {
            player.onGround = true;
        }
    }
    if (!collisionZ) {
        player.z = newZ;
    }
    
    // 更新旋转（简单模拟，实际应该使用鼠标移动）
    // 这里使用键盘上的箭头键控制视角
    if (gameState.keys['arrowup']) {
        player.rx -= 0.02 * deltaTime;
        player.rx = Math.max(-Math.PI/2, player.rx);
    }
    if (gameState.keys['arrowdown']) {
        player.rx += 0.02 * deltaTime;
        player.rx = Math.min(Math.PI/2, player.rx);
    }
    if (gameState.keys['arrowleft']) {
        player.ry -= 0.02 * deltaTime;
    }
    if (gameState.keys['arrowright']) {
        player.ry += 0.02 * deltaTime;
    }
    
    // 保持旋转角度在0-2π范围内
    player.ry = ((player.ry % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}

// 更新天气系统
function updateWeather(deltaTime) {
    // 简单的天气循环
    if (Math.random() < 0.0001 * deltaTime) {
        const weathers = ['clear', 'rain', 'snow'];
        gameState.weather = weathers[Math.floor(Math.random() * weathers.length)];
    }
}

// 更新实体
function updateEntities(deltaTime) {
    // 简单的实体AI实现
    // 遍历所有实体并更新它们的行为
    for (const entity of gameState.entities) {
        // 这里可以添加实体AI逻辑，如移动、攻击等
        if (entity.type === 'animal') {
            // 简单的随机移动
            if (Math.random() < 0.01 * deltaTime) {
                entity.direction = Math.random() * Math.PI * 2;
                entity.speed = 0.01 * deltaTime;
            }
            
            entity.x += Math.sin(entity.direction) * entity.speed;
            entity.z += Math.cos(entity.direction) * entity.speed;
        }
    }
}

// 更新饥饿值
function updateHunger(deltaTime) {
    // 随时间减少饥饿值
    if (gameState.hunger > 0) {
        gameState.hunger -= 0.001 * deltaTime;
        if (gameState.hunger < 0) gameState.hunger = 0;
    }
    
    // 饥饿值过低时减少生命值
    if (gameState.hunger <= 0 && gameState.health > 0) {
        if (Math.random() < 0.002 * deltaTime) {
            gameState.health -= 1;
        }
    }
    
    // 饥饿值足够时，缓慢恢复生命值
    if (gameState.hunger > 18 && gameState.health < 20) {
        if (Math.random() < 0.0005 * deltaTime) {
            gameState.health += 1;
        }
    }
}

// 检测玩家是否在水中
function isPlayerInWater() {
    const player = gameState.player;
    
    // 检查玩家脚部位置是否在水中方块内
    const feetX = Math.floor(player.x);
    const feetY = Math.floor(player.y);
    const feetZ = Math.floor(player.z);
    
    const feetBlock = gameState.world.find(block => 
        block.x === feetX && 
        block.y === feetY && 
        block.z === feetZ
    );
    
    if (feetBlock && blockTypes[feetBlock.type].isLiquid) {
        return true;
    }
    
    // 检查玩家头部位置是否在水中方块内
    const headY = Math.floor(player.y + 1.8); // 玩家身高
    
    const headBlock = gameState.world.find(block => 
        block.x === feetX && 
        block.y === headY && 
        block.z === feetZ
    );
    
    if (headBlock && blockTypes[headBlock.type].isLiquid) {
        return true;
    }
    
    return false;
}

// 检查两个盒子是否碰撞
function isBoxColliding(box1, box2) {
    return box1.minX < box2.maxX &&
           box1.maxX > box2.minX &&
           box1.minY < box2.maxY &&
           box1.maxY > box2.minY &&
           box1.minZ < box2.maxZ &&
           box1.maxZ > box2.minZ;
}

// 渲染游戏世界
function render() {
    // 清空画布
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 获取玩家位置和旋转
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    const playerZ = gameState.player.z;
    const playerRotX = gameState.player.rx;
    const playerRotY = gameState.player.ry;
    
    // 过滤出渲染距离内的方块
    const renderDist = config.renderDistance;
    const visibleBlocks = gameState.world.filter(block => {
        const dx = block.x - playerX;
        const dy = block.y - playerY;
        const dz = block.z - playerZ;
        const distSq = dx * dx + dy * dy + dz * dz;
        return distSq < renderDist * renderDist;
    });
    
    // 按距离排序，远处的先渲染
    visibleBlocks.sort((a, b) => {
        const distA = Math.sqrt(
            Math.pow(a.x - playerX, 2) +
            Math.pow(a.y - playerY, 2) +
            Math.pow(a.z - playerZ, 2)
        );
        const distB = Math.sqrt(
            Math.pow(b.x - playerX, 2) +
            Math.pow(b.y - playerY, 2) +
            Math.pow(b.z - playerZ, 2)
        );
        return distB - distA;
    });
    
    // 渲染方块
    for (const block of visibleBlocks) {
        renderBlock(block);
    }
    
    // 绘制准星
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
}

// 渲染单个方块
function renderBlock(block) {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    const playerZ = gameState.player.z;
    const playerRotX = gameState.player.rx;
    const playerRotY = gameState.player.ry;
    
    const blockType = blockTypes[block.type];
    const blockSize = config.blockSize;
    
    // 计算方块相对于玩家的位置
    const dx = block.x - playerX;
    const dy = block.y - playerY;
    const dz = block.z - playerZ;
    
    // 应用旋转（简单的2D伪3D效果）
    const cosRy = Math.cos(playerRotY);
    const sinRy = Math.sin(playerRotY);
    
    const x1 = dx * cosRy - dz * sinRy;
    const z1 = dx * sinRy + dz * cosRy;
    
    // 计算屏幕位置
    const depth = z1;
    if (depth <= 0.1) return; // 避免除以零
    
    const scale = canvas.height / (2 * Math.tan(gameState.camera.fov * Math.PI / 360) * depth);
    
    const screenX = canvas.width / 2 + x1 * scale;
    const screenY = canvas.height / 2 - dy * scale - playerRotX * scale * 2; // 应用X轴旋转
    
    const blockWidth = blockSize * scale;
    const blockHeight = blockSize * scale;
    
    // 设置方块颜色
    ctx.fillStyle = blockType.color;
    if (blockType.alpha) {
        ctx.globalAlpha = blockType.alpha;
    }
    
    // 绘制方块
    ctx.fillRect(screenX - blockWidth / 2, screenY - blockHeight / 2, blockWidth, blockHeight);
    
    // 绘制边框
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - blockWidth / 2, screenY - blockHeight / 2, blockWidth, blockHeight);
    
    // 重置透明度
    if (blockType.alpha) {
        ctx.globalAlpha = 1;
    }
}

// 更新UI
function updateUI() {
    // 更新生命值显示
    healthElement.textContent = Math.floor(gameState.health);
    healthBarElement.style.width = (gameState.health / 20 * 100) + '%';
    
    // 更新饥饿度显示
    hungerElement.textContent = Math.floor(gameState.hunger);
    hungerBarElement.style.width = (gameState.hunger / 20 * 100) + '%';
    
    // 更新空气值显示
    const airPercentage = Math.min(gameState.player.air || 300, 300);
    airElement.textContent = Math.floor(airPercentage);
    airBarElement.style.width = (airPercentage / 300 * 100) + '%';
    
    // 更新位置显示
    posXElement.textContent = Math.round(gameState.player.x * 10) / 10;
    posYElement.textContent = Math.round(gameState.player.y * 10) / 10;
    posZElement.textContent = Math.round(gameState.player.z * 10) / 10;
    
    // 更新游戏时间显示
    const timeOfDay = Math.floor((gameState.dayTime % 24000) / 1000);
    const minutes = Math.floor((gameState.dayTime % 1000) * 60 / 1000);
    dayTimeElement.textContent = `${timeOfDay.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // 更新生物群系显示
    biomeElement.textContent = biomes[gameState.biome].name;
    
    // 更新FPS显示
    fpsElement.textContent = Math.round(gameState.fps);
    
    // 更新快捷栏
    updateHotbar();
    
    // 更新背包和合成界面
    if (gameState.showInventory) {
        updateInventoryDisplay();
    }
    if (gameState.showCrafting) {
        updateCraftingDisplay();
    }
}

// 更新快捷栏
function updateHotbar() {
    // 清空现有槽位
    hotbarElement.innerHTML = '';
    hotbarSlots.length = 0;
    
    // 创建新的快捷栏槽位
    for (let i = 0; i < gameState.hotbar.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot' + (i === gameState.selectedSlot ? ' active' : '');
        
        // 添加数字键标签
        const keyLabel = document.createElement('span');
        keyLabel.className = 'hotbar-key';
        keyLabel.textContent = (i + 1).toString();
        slot.appendChild(keyLabel);
        
        // 获取槽位中的物品
        const item = gameState.hotbar[i];
        if (item && item.type && item.count > 0) {
            // 创建物品元素
            const itemElement = document.createElement('div');
            itemElement.className = 'hotbar-item ' + item.type;
            itemElement.style.backgroundColor = blockTypes[item.type]?.color || '#888';
            
            // 添加物品数量
            if (item.count > 1) {
                const countSpan = document.createElement('span');
                countSpan.className = 'hotbar-count';
                countSpan.textContent = item.count;
                itemElement.appendChild(countSpan);
            }
            
            slot.appendChild(itemElement);
        }
        
        // 存储槽位索引
        slot.dataset.slot = i;
        
        // 添加点击事件
        slot.addEventListener('click', () => {
            gameState.selectedSlot = parseInt(slot.dataset.slot);
            updateHotbar();
        });
        
        hotbarElement.appendChild(slot);
        hotbarSlots.push(slot);
    }
}

// 将物品添加到背包
function addItemToInventory(itemType) {
    // 尝试堆叠到已有的物品槽
    for (let i = 0; i < gameState.inventory.length; i++) {
        const item = gameState.inventory[i];
        if (item.type === itemType && item.count < 64) {
            item.count++;
            return;
        }
    }
    
    // 寻找空槽位
    for (let i = 0; i < gameState.inventory.length; i++) {
        const item = gameState.inventory[i];
        if (!item.type || item.count === 0) {
            gameState.inventory[i] = { type: itemType, count: 1 };
            return;
        }
    }
    
    // 背包已满，物品掉落在地上（简单实现）
    console.log(`背包已满，无法拾取 ${itemType}`);
}

// 创建方块破坏粒子效果
function createBlockBreakParticles(block) {
    // 在实际游戏中，这里应该创建粒子动画
    console.log(`方块 ${block.type} 被破坏`);
}

// 创建方块放置效果
function createBlockPlaceEffect(position) {
    // 在实际游戏中，这里应该创建放置特效
    console.log(`在位置 (${position.x}, ${position.y}, ${position.z}) 放置方块`);
}

// 切换背包显示
function toggleInventory() {
    gameState.showInventory = !gameState.showInventory;
    updateInventoryDisplay();
}

// 更新背包显示
function updateInventoryDisplay() {
    if (!inventoryElement) return;
    
    inventoryElement.style.display = gameState.showInventory ? 'block' : 'none';
    
    if (gameState.showInventory) {
        // 清空背包
        inventoryElement.innerHTML = '';
        
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', toggleInventory);
        inventoryElement.appendChild(closeButton);
        
        // 创建物品格子
        for (let i = 0; i < gameState.inventory.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            const item = gameState.inventory[i];
            if (item && item.type && item.count > 0) {
                const itemIcon = document.createElement('div');
                itemIcon.className = 'item-icon';
                itemIcon.style.backgroundColor = blockTypes[item.type]?.color || '#888';
                
                const countText = document.createElement('span');
                countText.className = 'item-count';
                countText.textContent = item.count;
                
                itemIcon.appendChild(countText);
                slot.appendChild(itemIcon);
            }
            
            // 添加点击事件，将物品移到快捷栏
            slot.addEventListener('click', () => {
                // 简化实现，实际应该考虑物品交换
                const item = gameState.inventory[i];
                if (item && item.type) {
                    // 检查快捷栏是否有空位
                    const emptySlot = gameState.hotbar.findIndex(slot => !slot.type || slot.count === 0);
                    if (emptySlot !== -1) {
                        gameState.hotbar[emptySlot] = { ...item };
                        gameState.inventory[i] = { type: '', count: 0 };
                        updateUI();
                    }
                }
            });
            
            inventoryElement.appendChild(slot);
        }
    }
}

// 切换合成界面显示
function toggleCrafting() {
    gameState.showCrafting = !gameState.showCrafting;
    updateCraftingDisplay();
}

// 更新合成界面显示
function updateCraftingDisplay() {
    if (!craftingElement) return;
    
    craftingElement.style.display = gameState.showCrafting ? 'block' : 'none';
    
    if (gameState.showCrafting) {
        // 简单的合成界面实现
        craftingElement.innerHTML = '';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', toggleCrafting);
        craftingElement.appendChild(closeButton);
        
        const craftButton = document.createElement('button');
        craftButton.textContent = '合成';
        craftButton.addEventListener('click', () => {
            // 简化的合成逻辑
            const resultItem = 'plank'; // 示例：始终合成木板
            addItemToInventory(resultItem);
        });
        craftingElement.appendChild(craftButton);
    }
}

// 切换相机模式
function toggleCameraMode() {
    const modes = ['firstPerson', 'thirdPerson', 'topDown'];
    const currentIndex = modes.indexOf(gameState.camera.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    gameState.camera.mode = modes[nextIndex];
}

// 更新日夜循环
function updateDayTime(deltaTime) {
    gameState.dayTime = (gameState.dayTime + deltaTime) % 24000;
    gameState.isDay = gameState.dayTime < 13000;
    
    // 根据时间调整天空颜色
    if (gameState.isDay) {
        // 白天天空颜色
        document.body.style.backgroundColor = '#87ceeb';
    } else {
        // 夜晚天空颜色
        document.body.style.backgroundColor = '#0a0a2a';
    }
}

// 游戏主循环
function gameLoop(timestamp) {
    // 计算时间增量（帧率独立）
    if (!timestamp) timestamp = 0;
    const deltaTime = timestamp - gameState.lastFrameTime;
    gameState.lastFrameTime = timestamp;
    
    // 限制帧率（可选）
    if (deltaTime < 1000 / 60) {
        gameState.gameLoop = requestAnimationFrame(gameLoop);
        return;
    }
    
    // 计算FPS
    gameState.fps = Math.round(1000 / deltaTime);
    
    // 更新游戏时间统计
    gameState.stats.timePlayed += deltaTime / 1000;
    
    // 更新日夜循环
    updateDayTime(deltaTime * 2); // 加速时间流逝
    
    // 更新环境效果
    updateWeather(deltaTime);
    
    // 更新玩家状态
    updatePlayer(deltaTime / 16.67); // 归一化到60fps的速度
    
    // 更新实体
    updateEntities(deltaTime);
    
    // 更新饥饿值
    updateHunger(deltaTime);
    
    // 渲染游戏
    render();
    
    // 更新UI
    updateUI();
    
    // 继续游戏循环
    gameState.gameLoop = requestAnimationFrame(gameLoop);
}

// 开始游戏循环
function startGameLoop() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameLoop();
    }
}

// 停止游戏循环
function stopGameLoop() {
    if (gameState.isRunning) {
        gameState.isRunning = false;
        cancelAnimationFrame(gameState.gameLoop);
    }
}

// 页面加载时初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

// 更新快捷栏显示
function updateHotbar() {
    const hotbar = document.getElementById('hotbar');
    if (!hotbar) return;
    
    hotbar.innerHTML = '';
    
    for (let i = 0; i < gameState.hotbar.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot' + (i === gameState.selectedSlot ? ' active' : '');
        
        // 添加数字键标签
        const keyLabel = document.createElement('span');
        keyLabel.className = 'hotbar-key';
        keyLabel.textContent = (i + 1).toString();
        slot.appendChild(keyLabel);
        
        // 获取槽位中的物品
        const item = gameState.hotbar[i];
        if (item && item.type) {
            // 创建物品元素
            const itemElement = document.createElement('div');
            itemElement.className = 'hotbar-item ' + item.type;
            itemElement.style.backgroundColor = blockTypes[item.type]?.color || '#888';
            
            // 添加物品数量
            if (item.count > 1) {
                const countSpan = document.createElement('span');
                countSpan.className = 'hotbar-count';
                countSpan.textContent = item.count;
                itemElement.appendChild(countSpan);
            }
            
            slot.appendChild(itemElement);
        }
        
        // 存储槽位索引
        slot.dataset.slot = i;
        
        // 添加点击事件
        slot.addEventListener('click', () => {
            gameState.selectedSlot = parseInt(slot.dataset.slot);
            updateHotbar();
        });
        
        hotbar.appendChild(slot);
    }
}

// 向背包添加物品
function addItemToInventory(itemType, count = 1) {
    // 首先尝试堆叠到现有物品
    for (let i = 0; i < gameState.inventory.length; i++) {
        const slot = gameState.inventory[i];
        if (slot.type === itemType) {
            slot.count += count;
            return true;
        }
    }
    
    // 如果没有堆叠，找一个空槽位
    for (let i = 0; i < gameState.inventory.length; i++) {
        const slot = gameState.inventory[i];
        if (!slot.type) {
            slot.type = itemType;
            slot.count = count;
            return true;
        }
    }
    
    // 如果背包已满，尝试快捷栏
    for (let i = 0; i < gameState.hotbar.length; i++) {
        const slot = gameState.hotbar[i];
        if (slot.type === itemType) {
            slot.count += count;
            return true;
        }
    }
    
    for (let i = 0; i < gameState.hotbar.length; i++) {
        const slot = gameState.hotbar[i];
        if (!slot.type) {
            slot.type = itemType;
            slot.count = count;
            return true;
        }
    }
    
    return false; // 背包和快捷栏都已满
}

// 检查两个碰撞箱是否相交
function isBoxColliding(boxA, boxB) {
    return boxA.minX < boxB.maxX && 
           boxA.maxX > boxB.minX && 
           boxA.minY < boxB.maxY && 
           boxA.maxY > boxB.minY && 
           boxA.minZ < boxB.maxZ && 
           boxA.maxZ > boxB.minZ;
}

// 创建方块破坏粒子效果
function createBlockBreakParticles(block) {
    // 在高级版本中，这里可以实现更复杂的粒子系统
    console.log(`Block ${block.type} at (${block.x}, ${block.y}, ${block.z}) broken`);
}

// 创建方块放置效果
function createBlockPlaceEffect(position) {
    // 在高级版本中，这里可以实现更复杂的粒子系统
    console.log(`Block placed at (${position.x}, ${position.y}, ${position.z})`);
}

// 切换背包显示/隐藏
function toggleInventory() {
    const inventory = document.getElementById('inventory');
    if (inventory) {
        inventory.style.display = inventory.style.display === 'none' ? 'block' : 'none';
        updateInventoryDisplay();
    }
}

// 切换合成界面显示/隐藏
function toggleCrafting() {
    const crafting = document.getElementById('crafting');
    if (crafting) {
        crafting.style.display = crafting.style.display === 'none' ? 'block' : 'none';
        updateCraftingDisplay();
    }
}

// 更新背包显示（高级版本的简化实现）
function updateInventoryDisplay() {
    // 在高级版本中，这里会显示玩家的完整背包
    console.log('Inventory updated');
}

// 更新合成界面显示（高级版本的简化实现）
function updateCraftingDisplay() {
    // 在高级版本中，这里会显示合成配方和结果
    console.log('Crafting interface updated');
}