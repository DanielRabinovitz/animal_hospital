// Game State
const gameState = {
    player: {
        character: null,
        name: '',
        coins: 0,
        x: 100,
        y: 280,
        width: 30,
        height: 40,
        velocityY: 0,
        isJumping: false,
        inventory: [],
        currentFloor: 1,
        speed: 4,
        color: '#667eea'
    },
    floors: [
        {
            id: 1,
            name: 'Reception',
            level: 1,
            items: [
                { emoji: '📋', name: 'Clipboard', x: 350, y: 290, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 },
                { emoji: '🔔', name: 'Bell', x: 500, y: 290, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 }
            ],
            platforms: [
                { x: 0, y: 320, width: 600, height: 20 }
            ],
            unlocked: true
        }
    ],
    waitingPatients: [],
    activePatientsInWorld: [],
    patientTypes: [
        { emoji: '🐭', name: 'Mouse', color: '#D3D3D3' },
        { emoji: '🐰', name: 'Bunny', color: '#FFB6C1' },
        { emoji: '🐶', name: 'Puppy', color: '#DEB887' },
        { emoji: '🐱', name: 'Kitten', color: '#FFA500' },
        { emoji: '🐻', name: 'Bear Cub', color: '#8B4513' },
        { emoji: '🐼', name: 'Panda', color: '#000000' },
        { emoji: '🦊', name: 'Fox', color: '#FF6347' },
        { emoji: '🐹', name: 'Hamster', color: '#F0E68C' }
    ],
    availableFloors: [
        {
            id: 2,
            name: 'Pharmacy',
            items: [
                { emoji: '💊', name: 'Medicine', x: 150, y: 240, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 },
                { emoji: '💉', name: 'Syringe', x: 350, y: 290, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 },
                { emoji: '🧪', name: 'Test Tube', x: 500, y: 240, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 }
            ],
            platforms: [
                { x: 0, y: 320, width: 300, height: 20 },
                { x: 100, y: 270, width: 150, height: 20 },
                { x: 400, y: 320, width: 200, height: 20 },
                { x: 450, y: 270, width: 120, height: 20 }
            ],
            cost: 50,
            unlocked: false
        },
        {
            id: 3,
            name: 'Treatment Room',
            items: [
                { emoji: '🩹', name: 'Bandaid', x: 200, y: 240, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 },
                { emoji: '🌡️', name: 'Thermometer', x: 350, y: 190, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 },
                { emoji: '🩺', name: 'Stethoscope', x: 520, y: 290, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 }
            ],
            platforms: [
                { x: 0, y: 320, width: 250, height: 20 },
                { x: 150, y: 270, width: 150, height: 20 },
                { x: 320, y: 220, width: 150, height: 20 },
                { x: 450, y: 320, width: 150, height: 20 }
            ],
            cost: 100,
            unlocked: false
        },
        {
            id: 4,
            name: 'Food & Treats',
            items: [
                { emoji: '🍖', name: 'Food', x: 180, y: 290, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 },
                { emoji: '🥛', name: 'Milk', x: 350, y: 240, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 },
                { emoji: '🍪', name: 'Treats', x: 500, y: 290, width: 25, height: 25, respawnTime: 5000, lastCollected: 0 }
            ],
            platforms: [
                { x: 0, y: 320, width: 200, height: 20 },
                { x: 150, y: 320, width: 200, height: 20 },
                { x: 300, y: 270, width: 150, height: 20 },
                { x: 450, y: 320, width: 150, height: 20 }
            ],
            cost: 150,
            unlocked: false
        }
    ],
    nextPatientId: 0,
    keys: {},
    elevatorX: 50,
    elevatorY: 250,
    elevatorWidth: 60,
    elevatorHeight: 70,
    gravity: 0.5,
    jumpStrength: -12
};

// Canvas setup
let canvas, ctx;

// Character Selection
const characterCards = document.querySelectorAll('.character-card');
characterCards.forEach(card => {
    card.addEventListener('click', () => {
        const character = card.dataset.character;
        const characterIcons = {
            cat: '🐱',
            dog: '🐶',
            bunny: '🐰',
            bear: '🐻'
        };
        const characterNames = {
            cat: 'Dr. Whiskers',
            dog: 'Dr. Buddy',
            bunny: 'Dr. Hoppy',
            bear: 'Dr. Cuddles'
        };

        gameState.player.character = characterIcons[character];
        gameState.player.name = characterNames[character];

        document.getElementById('player-character').textContent = gameState.player.character;
        document.getElementById('player-name').textContent = gameState.player.name;

        document.getElementById('character-select').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        initGame();
    });
});

// Initialize Game
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    generateNewPatients(3);
    updateCoins();
    updateClipboard();
    updateInventory();

    setupControls();
    gameLoop();
}

// Setup keyboard controls
function setupControls() {
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key] = true;

        // Jump with W or Up Arrow or Space
        if ((e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') && !gameState.player.isJumping) {
            gameState.player.velocityY = gameState.jumpStrength;
            gameState.player.isJumping = true;
            e.preventDefault();
        }

        // Pick up item with E key
        if (e.key === 'e' || e.key === 'E') {
            tryPickupItem();
        }

        // Use elevator with F key
        if (e.key === 'f' || e.key === 'F') {
            tryUseElevator();
        }

        // Deliver items to patient with Q key
        if (e.key === 'q' || e.key === 'Q') {
            tryDeliverToPatient();
        }
    });

    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key] = false;
    });
}

// Get all unique available items from unlocked floors
function getAvailableItems() {
    const availableItems = new Set();
    gameState.floors.forEach(floor => {
        floor.items.forEach(item => availableItems.add(item.emoji));
    });
    return Array.from(availableItems);
}

// Generate New Patients
function generateNewPatients(count) {
    const availableItems = getAvailableItems();

    if (availableItems.length === 0) return;

    for (let i = 0; i < count; i++) {
        const numItems = Math.min(2, availableItems.length);
        const request = [];
        const shuffled = [...availableItems].sort(() => Math.random() - 0.5);

        for (let j = 0; j < numItems; j++) {
            request.push(shuffled[j]);
        }

        const patientType = gameState.patientTypes[Math.floor(Math.random() * gameState.patientTypes.length)];

        const patient = {
            id: gameState.nextPatientId++,
            emoji: patientType.emoji,
            name: patientType.name,
            color: patientType.color,
            request: request,
            collectedItems: [],
            x: 450 + (i * 80),
            y: 260,
            width: 35,
            height: 45
        };

        gameState.waitingPatients.push(patient);
        gameState.activePatientsInWorld.push(patient);
    }

    updateClipboard();
}

// Update clipboard display
function updateClipboard() {
    const container = document.getElementById('clipboard-patients');
    container.innerHTML = '';

    if (gameState.waitingPatients.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No patients waiting</p>';
        return;
    }

    gameState.waitingPatients.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.className = 'clipboard-patient';

        const itemsHTML = patient.request.map(item => {
            const collected = patient.collectedItems.includes(item);
            return `<div class="clipboard-item ${collected ? 'collected' : ''}">${item}</div>`;
        }).join('');

        patientDiv.innerHTML = `
            <div class="clipboard-patient-header">
                <div class="clipboard-patient-avatar">${patient.emoji}</div>
                <div class="clipboard-patient-name">${patient.name}</div>
            </div>
            <div class="clipboard-needs">Needs:</div>
            <div class="clipboard-items">${itemsHTML}</div>
        `;

        container.appendChild(patientDiv);
    });
}

// Update inventory display
function updateInventory() {
    const container = document.getElementById('inventory-display');
    container.innerHTML = '';

    if (gameState.player.inventory.length === 0) {
        container.innerHTML = '<p style="color: #999; font-size: 0.9em;">Empty</p>';
        return;
    }

    gameState.player.inventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerHTML = `${item.emoji}`;
        container.appendChild(itemDiv);
    });
}

// Try to pickup nearby item
function tryPickupItem() {
    const currentFloor = gameState.floors.find(f => f.id === gameState.player.currentFloor);
    if (!currentFloor) return;

    const pickupRadius = 50;

    for (let item of currentFloor.items) {
        // Check if item should be visible (respawn logic)
        const now = Date.now();
        if (item.lastCollected > 0 && (now - item.lastCollected) < item.respawnTime) {
            continue; // Item is still respawning
        }

        const dx = gameState.player.x - item.x;
        const dy = gameState.player.y - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pickupRadius) {
            item.lastCollected = now;
            gameState.player.inventory.push({ emoji: item.emoji, name: item.name });
            updateInventory();
            showMessage(`Picked up ${item.name}!`);
            return;
        }
    }
}

// Try to deliver items to nearby patient
function tryDeliverToPatient() {
    if (gameState.player.inventory.length === 0) return;
    if (gameState.player.currentFloor !== 1) {
        showMessage('Return to Reception to deliver items!');
        return;
    }

    const deliverRadius = 60;

    for (let patient of gameState.activePatientsInWorld) {
        const dx = gameState.player.x - patient.x;
        const dy = gameState.player.y - patient.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < deliverRadius) {
            deliverItemsToPatient(patient);
            return;
        }
    }

    showMessage('Get closer to a patient!');
}

// Deliver items to specific patient
function deliverItemsToPatient(patient) {
    let itemsDelivered = false;
    const inventoryCopy = [...gameState.player.inventory];

    inventoryCopy.forEach((invItem, index) => {
        if (patient.request.includes(invItem.emoji) && !patient.collectedItems.includes(invItem.emoji)) {
            patient.collectedItems.push(invItem.emoji);
            gameState.player.inventory.splice(gameState.player.inventory.findIndex(i => i.emoji === invItem.emoji), 1);
            itemsDelivered = true;

            if (patient.collectedItems.length === patient.request.length) {
                completePatientRequest(patient.id);
            }
        }
    });

    if (itemsDelivered) {
        updateInventory();
        updateClipboard();
        showMessage(`Delivered items to ${patient.name}!`);
    } else {
        showMessage(`${patient.name} doesn't need these items!`);
    }
}

// Try to use elevator
function tryUseElevator() {
    const dx = gameState.player.x - gameState.elevatorX;
    const dy = gameState.player.y - gameState.elevatorY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {
        showElevatorMenu();
    }
}

// Show elevator menu
function showElevatorMenu() {
    const floors = gameState.floors;
    const currentFloor = gameState.player.currentFloor;

    let message = 'Elevator - Choose floor:\n';
    floors.forEach((floor, index) => {
        if (floor.id === currentFloor) {
            message += `[Current] ${floor.id}. ${floor.name}\n`;
        } else {
            message += `Press ${index + 1} - ${floor.name}\n`;
        }
    });

    showMessage(message);

    const handleFloorSelection = (e) => {
        const key = parseInt(e.key);
        if (key >= 1 && key <= floors.length) {
            gameState.player.currentFloor = floors[key - 1].id;
            updateFloorDisplay();
            showMessage(`Going to ${floors[key - 1].name}...`);
            document.removeEventListener('keydown', handleFloorSelection);
        }
    };

    document.addEventListener('keydown', handleFloorSelection);
}

// Check collision with platform
function checkPlatformCollision() {
    const currentFloor = gameState.floors.find(f => f.id === gameState.player.currentFloor);
    if (!currentFloor) return;

    const player = gameState.player;
    let onGround = false;

    currentFloor.platforms.forEach(platform => {
        // Check if player is above platform and falling onto it
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 20 &&
            player.velocityY >= 0) {

            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            onGround = true;
        }
    });

    return onGround;
}

// Complete Patient Request
function completePatientRequest(patientId) {
    const patientIndex = gameState.waitingPatients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) return;

    const patient = gameState.waitingPatients[patientIndex];
    const coinsEarned = 15 + (gameState.floors.length * 5);
    gameState.player.coins += coinsEarned;

    showMessage(`${patient.name} helped! +${coinsEarned} 🪙`);

    // Remove from both lists
    gameState.waitingPatients.splice(patientIndex, 1);
    const worldIndex = gameState.activePatientsInWorld.findIndex(p => p.id === patientId);
    if (worldIndex !== -1) {
        gameState.activePatientsInWorld.splice(worldIndex, 1);
    }

    updateCoins();
    updateClipboard();

    setTimeout(() => {
        generateNewPatients(1);
    }, 1000);
}

// Update Coins Display
function updateCoins() {
    document.getElementById('coins').textContent = gameState.player.coins;
}

// Update floor display
function updateFloorDisplay() {
    const floor = gameState.floors.find(f => f.id === gameState.player.currentFloor);
    document.getElementById('current-floor').textContent = `${floor.id} - ${floor.name}`;
}

// Show message
function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.whiteSpace = 'pre-line';
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

// Game Loop
function gameLoop() {
    const player = gameState.player;

    // Horizontal movement
    if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }

    // Apply gravity
    player.velocityY += gameState.gravity;
    player.y += player.velocityY;

    // Check platform collisions
    checkPlatformCollision();

    // Keep player in bounds
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    render();
    requestAnimationFrame(gameLoop);
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const currentFloor = gameState.floors.find(f => f.id === gameState.player.currentFloor);

    // Draw floor name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(currentFloor.name, 10, 30);

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    currentFloor.platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        // Platform edge detail
        ctx.fillStyle = '#654321';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
        ctx.fillStyle = '#8B4513';
    });

    // Draw elevator
    ctx.fillStyle = '#696969';
    ctx.fillRect(gameState.elevatorX, gameState.elevatorY, gameState.elevatorWidth, gameState.elevatorHeight);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(gameState.elevatorX + 5, gameState.elevatorY + 5, gameState.elevatorWidth - 10, gameState.elevatorHeight - 10);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('ELEVATOR', gameState.elevatorX + 5, gameState.elevatorY + 40);
    ctx.font = '10px Arial';
    ctx.fillText('Press F', gameState.elevatorX + 10, gameState.elevatorY + 55);

    // Draw items
    const now = Date.now();
    currentFloor.items.forEach(item => {
        // Check if item should be visible
        if (item.lastCollected === 0 || (now - item.lastCollected) >= item.respawnTime) {
            // Item background
            ctx.fillStyle = '#FFE4B5';
            ctx.fillRect(item.x - 5, item.y - 5, item.width + 10, item.height + 10);
            ctx.strokeStyle = '#DEB887';
            ctx.lineWidth = 2;
            ctx.strokeRect(item.x - 5, item.y - 5, item.width + 10, item.height + 10);

            // Item emoji
            ctx.font = '25px Arial';
            ctx.fillText(item.emoji, item.x, item.y + 20);

            // Item name
            ctx.fillStyle = '#333';
            ctx.font = '8px Arial';
            ctx.fillText(item.name, item.x - 15, item.y - 8);
            ctx.fillText('(E)', item.x + 5, item.y + 38);
        } else {
            // Show respawn timer
            const timeLeft = Math.ceil((item.respawnTime - (now - item.lastCollected)) / 1000);
            ctx.fillStyle = '#999';
            ctx.font = '10px Arial';
            ctx.fillText(`${timeLeft}s`, item.x, item.y + 15);
        }
    });

    // Draw patients in world (only on floor 1)
    if (currentFloor.id === 1) {
        gameState.activePatientsInWorld.forEach(patient => {
            // Patient body (rectangle)
            ctx.fillStyle = patient.color;
            ctx.fillRect(patient.x, patient.y, patient.width, patient.height);

            // Patient outline
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(patient.x, patient.y, patient.width, patient.height);

            // Patient emoji as head
            ctx.font = '30px Arial';
            ctx.fillText(patient.emoji, patient.x + 2, patient.y - 5);

            // Patient name
            ctx.fillStyle = '#333';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(patient.name, patient.x - 5, patient.y + patient.height + 12);

            // Show what they need
            ctx.font = '8px Arial';
            ctx.fillText('Needs:', patient.x - 5, patient.y + patient.height + 22);
            patient.request.forEach((item, idx) => {
                const collected = patient.collectedItems.includes(item);
                ctx.fillStyle = collected ? '#90EE90' : '#333';
                ctx.font = '12px Arial';
                ctx.fillText(item, patient.x + (idx * 15) - 5, patient.y + patient.height + 35);
            });
            ctx.fillStyle = '#333';
            ctx.font = '7px Arial';
            ctx.fillText('(Q)', patient.x + 8, patient.y + patient.height + 45);
        });
    }

    // Draw player (rectangle)
    ctx.fillStyle = gameState.player.color;
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

    // Player outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

    // Player character emoji as head
    ctx.font = '35px Arial';
    ctx.fillText(gameState.player.character, gameState.player.x - 2, gameState.player.y - 5);

    // Draw controls hint
    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('← → Move | Space/W Jump | E Pickup | Q Deliver | F Elevator', 10, canvas.height - 10);
}

// Shop Modal
const shopButton = document.getElementById('shop-button');
const shopModal = document.getElementById('shop-modal');
const closeButton = document.querySelector('.close');

shopButton.addEventListener('click', () => {
    shopModal.classList.add('active');
    renderShop();
});

closeButton.addEventListener('click', () => {
    shopModal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === shopModal) {
        shopModal.classList.remove('active');
    }
});

// Render Shop
function renderShop() {
    const floorUpgradesDiv = document.getElementById('floor-upgrades');
    const existingFloorUpgradesDiv = document.getElementById('existing-floor-upgrades');

    floorUpgradesDiv.innerHTML = '';
    gameState.availableFloors.forEach(floor => {
        if (!floor.unlocked) {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            const itemsList = floor.items.map(i => i.emoji).join(' ');
            shopItem.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">${floor.name}</div>
                    <div class="shop-item-desc">Items: ${itemsList}</div>
                </div>
                <span class="shop-item-price">${floor.cost} 🪙</span>
                <button onclick="buyFloor(${floor.id})" ${gameState.player.coins < floor.cost ? 'disabled' : ''}>
                    Buy
                </button>
            `;
            floorUpgradesDiv.appendChild(shopItem);
        }
    });

    if (floorUpgradesDiv.innerHTML === '') {
        floorUpgradesDiv.innerHTML = '<p style="color: #666;">All floors unlocked!</p>';
    }

    existingFloorUpgradesDiv.innerHTML = '<p style="color: #666;">Floor upgrades coming soon!</p>';
}

// Buy New Floor
function buyFloor(floorId) {
    const floor = gameState.availableFloors.find(f => f.id === floorId);
    if (!floor || gameState.player.coins < floor.cost) return;

    gameState.player.coins -= floor.cost;
    floor.unlocked = true;
    gameState.floors.push({ ...floor, level: 1 });

    updateCoins();
    renderShop();
    showMessage(`${floor.name} unlocked!`);
}

window.buyFloor = buyFloor;
