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
    waitingPatients: [],
    currentPatientId: null,
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
        { id: 2, name: 'Examination Room', items: ['🌡️', '🩺', '💉'], cost: 50, unlocked: false },
        { id: 3, name: 'Treatment Room', items: ['💊', '🩹', '💉'], cost: 100, unlocked: false },
        { id: 4, name: 'Food Court', items: ['🧀', '🥕', '🦴', '🐟'], cost: 150, unlocked: false },
        { id: 5, name: 'Specialty Care', items: ['🍯', '🎋', '🍇', '🌰'], cost: 200, unlocked: false }
    ],
    nextPatientId: 0
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
    generateNewPatients(4);
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

// Get all unique available items from unlocked floors
function getAvailableItems() {
    const availableItems = new Set();
    gameState.floors.forEach(floor => {
        floor.items.forEach(item => availableItems.add(item));
    });
    return Array.from(availableItems);
}

// Generate New Patients
function generateNewPatients(count) {
    const availableItems = getAvailableItems();

    for (let i = 0; i < count; i++) {
        // Generate a random request with 2 unique items from available items only
        const numItems = Math.min(2, availableItems.length);
        const request = [];
        const shuffled = [...availableItems].sort(() => Math.random() - 0.5);

        for (let j = 0; j < numItems; j++) {
            request.push(shuffled[j]);
        }

        // Pick a random patient type
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

    renderPatients();
}

// Render all waiting patients
function renderPatients() {
    const container = document.getElementById('patients-container');
    container.innerHTML = '';

    gameState.waitingPatients.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.className = 'patient-card';
        patientDiv.dataset.patientId = patient.id;

        const requestItemsHTML = patient.request.map(item => {
            const collected = patient.collectedItems.includes(item);
            return `<div class="request-item ${collected ? 'collected' : ''}">${item}</div>`;
        }).join('');

        patientDiv.innerHTML = `
            <div class="patient-avatar">${patient.emoji}</div>
            <div class="patient-details">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-request-section">
                    <div class="patient-needs">Needs help with:</div>
                    <div class="request-items-list">${requestItemsHTML}</div>
                </div>
            </div>
        `;

        container.appendChild(patientDiv);
    });
}

// Select Item
function selectItem(itemEmoji, element) {
    if (gameState.waitingPatients.length === 0) return;

    // Find a patient that needs this item and hasn't collected it yet
    const patient = gameState.waitingPatients.find(p =>
        p.request.includes(itemEmoji) && !p.collectedItems.includes(itemEmoji)
    );

    if (patient) {
        patient.collectedItems.push(itemEmoji);

        // Visual feedback
        element.classList.add('selected');
        setTimeout(() => {
            element.classList.remove('selected');
        }, 300);

        // Check if patient request is complete
        if (patient.collectedItems.length === patient.request.length) {
            setTimeout(() => {
                completePatientRequest(patient.id);
            }, 400);
        } else {
            renderPatients();
        }
    }
}

// Complete Patient Request
function completePatientRequest(patientId) {
    const patientIndex = gameState.waitingPatients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) return;

    const patient = gameState.waitingPatients[patientIndex];
    const coinsEarned = 10 + (gameState.floors.length * 5);
    gameState.player.coins += coinsEarned;

    showSuccessMessage(`${patient.name} helped! +${coinsEarned} 🪙`);

    // Remove the patient
    gameState.waitingPatients.splice(patientIndex, 1);

    updateCoins();
    renderPatients();

    // Add a new patient after a short delay
    setTimeout(() => {
        generateNewPatients(1);
    }, 800);
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
