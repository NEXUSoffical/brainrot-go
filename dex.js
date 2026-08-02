// dex.js - Rot-Dex Storage Management

let caughtBrainrots = [];

// Initialize Rot-Dex totals on load
window.addEventListener('DOMContentLoaded', () => {
    updateDexUI();
});

// Add creature to Rot-Dex collection
window.addToDex = function(creature) {
    const exists = caughtBrainrots.some(item => item.name === creature.name);
    if (!exists) {
        caughtBrainrots.push(creature);
    }
    
    updateDexUI();
};

// Update Dex UI counts and grid
function updateDexUI() {
    const totalPossible = typeof brainrotCharacters !== 'undefined' ? brainrotCharacters.length : 0;
    const caughtCount = caughtBrainrots.length;

    const dexCountEl = document.getElementById('dexCount');
    const totalBrainrotsEl = document.getElementById('totalBrainrots');
    const inventoryCountEl = document.getElementById('inventoryCount');

    if (dexCountEl) dexCountEl.innerText = caughtCount;
    if (totalBrainrotsEl) totalBrainrotsEl.innerText = totalPossible;
    if (inventoryCountEl) inventoryCountEl.innerText = caughtCount;

    renderDexGrid();
}

// Render grid items inside modal
function renderDexGrid() {
    const dexGrid = document.getElementById('dexGrid');
    if (!dexGrid) return;

    dexGrid.innerHTML = '';

    if (typeof brainrotCharacters !== 'undefined') {
        brainrotCharacters.forEach(char => {
            const isCaught = caughtBrainrots.some(item => item.name === char.name);
            
            const card = document.createElement('div');
            card.style.cssText = `
                background: ${isCaught ? '#1a1a1a' : '#111'};
                border: 2px solid ${isCaught ? '#00ff00' : '#444'};
                border-radius: 8px;
                padding: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: ${isCaught ? '1' : '0.4'};
            `;

            if (isCaught && char.image) {
                card.innerHTML = `
                    <div style="width: 50px; height: 50px; background: #fff; border-radius: 4px; overflow: hidden; margin-bottom: 4px;">
                        <img src="${char.image}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <span style="font-size: 10px; color: #fff; text-align: center; font-family: monospace;">${char.name}</span>
                `;
            } else {
                card.innerHTML = `
                    <div style="width: 50px; height: 50px; background: #222; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; color: #555; font-size: 20px;">?</div>
                    <span style="font-size: 10px; color: #777; text-align: center; font-family: monospace;">???</span>
                `;
            }

            dexGrid.appendChild(card);
        });
    }
}

// Open/Close Modal Functions
window.openDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) {
        modal.style.display = 'block';
        updateDexUI();
    }
};

window.closeDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) {
        modal.style.display = 'none';
    }
};