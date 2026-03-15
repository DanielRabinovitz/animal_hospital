// Game State
const gameState = {
    player: {
        character: null,
        name: '',
        coins: 0,
        x: 100,
        y: 200,
        inventory: [],
        currentFloor: 1,
        speed: 3
    },
    floors: [
        {
            id: 1,
            name: 'Reception',
            level: 1,
            items: [
                { emoji: '📋', name: 'Clipboard', x: 200, y: 150, collected: false },
                { emoji: '🔔', name: 'Bell', x: 400, y: 150, collected: false }
            ],
            unlocked: true
        }
    ],
    waitingPatients: [],
    patientTypes: [
        { emoji: '🐭', name: 'Mouse' },
        { emoji: '🐰', name: 'Bunny' },
        { emoji: '🐶', name: 'Puppy' },
        { emoji: '🐱', name: 'Kitten' },
        { emoji: '🐻', name: 'Bear Cub' },
        { emoji: '🐼', name: 'Panda' },
        { emoji: '🦊', name: 'Fox' },
        { emoji: '🐹', name: 'Hamster' }
    ],
    availableFloors: [
        {
            id: 2,
            name: 'Pharmacy',
            items: [
                { emoji: '💊', name: 'Medicine', x: 150, y: 150, collected: false },
                { emoji: '💉', name: 'Syringe', x: 300, y: 150, collected: false },
                { emoji: '🧪', name: 'Test Tube', x: 450, y: 150, collected: false }
            ],
            cost: 50,
            unlocked: false
        },
        {
            id: 3,
            name: 'Treatment Room',
            items: [
                { emoji: '🩹', name: 'Bandaid', x: 150, y: 150, collected: false },
                { emoji: '🌡️', name: 'Thermometer', x: 300, y: 150, collected: false },
                { emoji: '🩺', name: 'Stethoscope', x: 450, y: 150, collected: false }
            ],
            cost: 100,
            unlocked: false
        },
        {
            id: 4,
            name: 'Food & Treats',
            items: [
                { emoji: '🍖', name: 'Food', x: 150, y: 150, collected: false },
                { emoji: '🥛', name: 'Milk', x: 300, y: 150, collected: false },
                { emoji: '🍪', name: 'Treats', x: 450, y: 150, collected: false }
            ],
            cost: 150,
            unlocked: false
        }
    ],
    nextPatientId: 0,
    keys: {},
    elevatorX: 500,
    elevatorY: 300,
    receptionDeskX: 300,
    receptionDeskY: 300
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

        // Pick up item with E key
        if (e.key === 'e' || e.key === 'E') {
            tryPickupItem();
        }

        // Use elevator with Space
        if (e.key === ' ') {
            tryUseElevator();
            e.preventDefault();
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
            request: request,
            collectedItems: []
        };

        gameState.waitingPatients.push(patient);
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

    const pickupRadius = 40;

    for (let item of currentFloor.items) {
        if (item.collected) continue;

        const dx = gameState.player.x - item.x;
        const dy = gameState.player.y - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pickupRadius) {
            item.collected = true;
            gameState.player.inventory.push({ ...item });
            updateInventory();
            showMessage(`Picked up ${item.name}!`);
            return;
        }
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

// Check if player is at reception desk
function checkReceptionDesk() {
    if (gameState.player.currentFloor !== 1) return;

    const dx = gameState.player.x - gameState.receptionDeskX;
    const dy = gameState.player.y - gameState.receptionDeskY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50 && gameState.player.inventory.length > 0) {
        deliverItems();
    }
}

// Deliver items to patients
function deliverItems() {
    let itemsDelivered = false;

    gameState.player.inventory.forEach(invItem => {
        gameState.waitingPatients.forEach(patient => {
            if (patient.request.includes(invItem.emoji) && !patient.collectedItems.includes(invItem.emoji)) {
                patient.collectedItems.push(invItem.emoji);
                itemsDelivered = true;

                if (patient.collectedItems.length === patient.request.length) {
                    completePatientRequest(patient.id);
                }
            }
        });
    });

    if (itemsDelivered) {
        gameState.player.inventory = [];
        updateInventory();
        updateClipboard();
    }
}

// Complete Patient Request
function completePatientRequest(patientId) {
    const patientIndex = gameState.waitingPatients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) return;

    const patient = gameState.waitingPatients[patientIndex];
    const coinsEarned = 15 + (gameState.floors.length * 5);
    gameState.player.coins += coinsEarned;

    showMessage(`${patient.name} helped! +${coinsEarned} 🪙`);

    gameState.waitingPatients.splice(patientIndex, 1);

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
    // Update player position
    if (gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) {
        gameState.player.y = Math.max(50, gameState.player.y - gameState.player.speed);
    }
    if (gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) {
        gameState.player.y = Math.min(350, gameState.player.y + gameState.player.speed);
    }
    if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) {
        gameState.player.x = Math.max(30, gameState.player.x - gameState.player.speed);
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
        gameState.player.x = Math.min(570, gameState.player.x + gameState.player.speed);
    }

    checkReceptionDesk();

    render();
    requestAnimationFrame(gameLoop);
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const currentFloor = gameState.floors.find(f => f.id === gameState.player.currentFloor);

    // Draw floor
    ctx.fillStyle = '#e6f2ff';
    ctx.fillRect(20, 20, 560, 360);

    // Draw floor name
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(currentFloor.name, 30, 50);

    // Draw elevator
    ctx.fillStyle = '#888';
    ctx.fillRect(gameState.elevatorX - 25, gameState.elevatorY - 40, 50, 80);
    ctx.fillStyle = '#FFD700';
    ctx.font = '30px Arial';
    ctx.fillText('🛗', gameState.elevatorX - 15, gameState.elevatorY + 5);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText('SPACE', gameState.elevatorX - 20, gameState.elevatorY + 50);

    // Draw reception desk on floor 1
    if (currentFloor.id === 1) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(gameState.receptionDeskX - 40, gameState.receptionDeskY - 20, 80, 40);
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.fillText('RECEPTION', gameState.receptionDeskX - 30, gameState.receptionDeskY + 35);
    }

    // Draw items
    currentFloor.items.forEach(item => {
        if (!item.collected) {
            ctx.font = '40px Arial';
            ctx.fillText(item.emoji, item.x - 20, item.y + 15);

            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.fillText(item.name, item.x - 20, item.y + 30);
            ctx.fillText('Press E', item.x - 18, item.y - 20);
        }
    });

    // Draw player
    ctx.font = '50px Arial';
    ctx.fillText(gameState.player.character, gameState.player.x - 25, gameState.player.y + 20);

    // Draw player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(gameState.player.x, gameState.player.y + 25, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
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
