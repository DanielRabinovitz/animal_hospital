// Game State
const gameState = {
    player: {
        character: null,
        name: '',
        coins: 0
    },
    floors: [
        { id: 1, name: 'Reception', level: 1, items: ['📋', '🔔', '📞'], unlocked: true }
    ],
    currentPatient: null,
    selectedItems: [],
    patients: [
        { emoji: '🐭', name: 'Mouse', requests: [['🧀', '💊'], ['🌡️', '💉'], ['🩹', '💊']] },
        { emoji: '🐰', name: 'Bunny', requests: [['🥕', '💊'], ['🌡️', '🩹'], ['💉', '🥕']] },
        { emoji: '🐶', name: 'Puppy', requests: [['🦴', '💊'], ['🌡️', '💉'], ['🩹', '🦴']] },
        { emoji: '🐱', name: 'Kitten', requests: [['🐟', '💊'], ['🌡️', '🩹'], ['💉', '🐟']] },
        { emoji: '🐻', name: 'Bear Cub', requests: [['🍯', '💊'], ['🌡️', '💉'], ['🩹', '🍯']] },
        { emoji: '🐼', name: 'Panda', requests: [['🎋', '💊'], ['🌡️', '🩹'], ['💉', '🎋']] },
        { emoji: '🦊', name: 'Fox', requests: [['🍇', '💊'], ['🌡️', '💉'], ['🩹', '🍇']] },
        { emoji: '🐹', name: 'Hamster', requests: [['🌰', '💊'], ['🌡️', '🩹'], ['💉', '🌰']] }
    ],
    availableFloors: [
        { id: 2, name: 'Examination Room', items: ['🌡️', '🩺', '💉'], cost: 50, unlocked: false },
        { id: 3, name: 'Treatment Room', items: ['💊', '🩹', '💉'], cost: 100, unlocked: false },
        { id: 4, name: 'Food Court', items: ['🧀', '🥕', '🦴', '🐟'], cost: 150, unlocked: false },
        { id: 5, name: 'Specialty Care', items: ['🍯', '🎋', '🍇', '🌰'], cost: 200, unlocked: false }
    ]
};

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
    renderFloors();
    generateNewPatient();
    updateCoins();
}

// Render Hospital Floors
function renderFloors() {
    const floorsContainer = document.getElementById('floors-container');
    floorsContainer.innerHTML = '';

    gameState.floors.forEach(floor => {
        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor';
        floorDiv.innerHTML = `
            <div class="floor-header">
                <div class="floor-name">${floor.name}</div>
                <div class="floor-level">Floor ${floor.id}</div>
            </div>
            <div class="floor-items">
                ${floor.items.map(item => `<div class="item" data-item="${item}">${item}</div>`).join('')}
            </div>
        `;
        floorsContainer.appendChild(floorDiv);
    });

    // Add click handlers to items
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', () => {
            const itemEmoji = item.dataset.item;
            selectItem(itemEmoji, item);
        });
    });
}

// Generate New Patient
function generateNewPatient() {
    // Get all available items from unlocked floors
    const availableItems = [];
    gameState.floors.forEach(floor => {
        availableItems.push(...floor.items);
    });

    // Generate a random request with 2 items from available items
    const numItems = 2;
    const request = [];
    const shuffled = [...availableItems].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numItems && i < shuffled.length; i++) {
        if (!request.includes(shuffled[i])) {
            request.push(shuffled[i]);
        }
    }

    // If we couldn't get enough unique items, just use what we have
    if (request.length === 0 && availableItems.length > 0) {
        request.push(availableItems[0]);
    }

    // Pick a random patient
    const patient = gameState.patients[Math.floor(Math.random() * gameState.patients.length)];

    gameState.currentPatient = {
        ...patient,
        currentRequest: request
    };

    gameState.selectedItems = [];

    document.getElementById('patient-avatar').textContent = patient.emoji;
    document.getElementById('patient-speech').textContent =
        `Hi! I'm ${patient.name}. I need some help! Can you get me these items?`;

    const requestItemsDiv = document.getElementById('request-items');
    requestItemsDiv.innerHTML = request.map(item =>
        `<div class="request-item">${item}</div>`
    ).join('');

    // Clear previous selections
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('selected');
    });
}

// Select Item
function selectItem(itemEmoji, element) {
    if (!gameState.currentPatient) return;

    const request = gameState.currentPatient.currentRequest;

    if (request.includes(itemEmoji) && !gameState.selectedItems.includes(itemEmoji)) {
        gameState.selectedItems.push(itemEmoji);
        element.classList.add('selected');

        if (gameState.selectedItems.length === request.length) {
            setTimeout(() => {
                completeRequest();
            }, 500);
        }
    }
}

// Complete Request
function completeRequest() {
    const coinsEarned = 10 + (gameState.floors.length * 5);
    gameState.player.coins += coinsEarned;

    showSuccessMessage(`Great job! +${coinsEarned} 🪙`);

    updateCoins();

    setTimeout(() => {
        generateNewPatient();
    }, 1500);
}

// Update Coins Display
function updateCoins() {
    document.getElementById('coins').textContent = gameState.player.coins;
}

// Show Success Message
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 1500);
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

    // New Floors
    floorUpgradesDiv.innerHTML = '';
    gameState.availableFloors.forEach(floor => {
        if (!floor.unlocked) {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            shopItem.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">${floor.name}</div>
                    <div class="shop-item-desc">Items: ${floor.items.join(' ')}</div>
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

    // Existing Floor Upgrades
    existingFloorUpgradesDiv.innerHTML = '';
    gameState.floors.forEach(floor => {
        if (floor.level < 3) {
            const upgradeCost = 30 * floor.level;
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            shopItem.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">Upgrade ${floor.name} (Lvl ${floor.level})</div>
                    <div class="shop-item-desc">Get more items for this floor</div>
                </div>
                <span class="shop-item-price">${upgradeCost} 🪙</span>
                <button onclick="upgradeFloor(${floor.id})" ${gameState.player.coins < upgradeCost ? 'disabled' : ''}>
                    Upgrade
                </button>
            `;
            existingFloorUpgradesDiv.appendChild(shopItem);
        }
    });

    if (existingFloorUpgradesDiv.innerHTML === '') {
        existingFloorUpgradesDiv.innerHTML = '<p style="color: #666;">All floors at max level!</p>';
    }
}

// Buy New Floor
function buyFloor(floorId) {
    const floor = gameState.availableFloors.find(f => f.id === floorId);
    if (!floor || gameState.player.coins < floor.cost) return;

    gameState.player.coins -= floor.cost;
    floor.unlocked = true;
    gameState.floors.push({ ...floor, level: 1 });

    updateCoins();
    renderFloors();
    renderShop();
    showSuccessMessage(`${floor.name} unlocked!`);
}

// Upgrade Existing Floor
function upgradeFloor(floorId) {
    const floor = gameState.floors.find(f => f.id === floorId);
    if (!floor || floor.level >= 3) return;

    const upgradeCost = 30 * floor.level;
    if (gameState.player.coins < upgradeCost) return;

    gameState.player.coins -= upgradeCost;
    floor.level++;

    const bonusItems = ['✨', '⭐', '💝', '🎁', '🌟', '💫'];
    const newItem = bonusItems[Math.floor(Math.random() * bonusItems.length)];
    if (!floor.items.includes(newItem)) {
        floor.items.push(newItem);
    }

    updateCoins();
    renderFloors();
    renderShop();
    showSuccessMessage(`${floor.name} upgraded to level ${floor.level}!`);
}

// Make functions globally available
window.buyFloor = buyFloor;
window.upgradeFloor = upgradeFloor;
