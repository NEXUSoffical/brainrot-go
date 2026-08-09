// evolution.js - Handles evolving Rots

window.evolveRot = function(inventoryIndex) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[inventoryIndex]) {
        alert("❌ Invalid fighter selected for evolution!");
        return;
    }

    const rot = playerData.inventory[inventoryIndex];
    
    const charData = typeof brainrotCharacters !== 'undefined' 
        ? brainrotCharacters.find(c => c.name.toLowerCase().trim() === rot.name.toLowerCase().trim())
        : null;

    if (!charData || !charData.evolution) {
        alert(`❌ ${rot.name} cannot evolve!`);
        return;
    }

    const evo = charData.evolution;
    const candyCost = evo.candyCost || 50; 

    if (!playerData.candies) playerData.candies = {};
    const candyKey = rot.name.toUpperCase().trim();
    const currentCandies = playerData.candies[candyKey] || 0;

    if (currentCandies < candyCost) {
        alert(`❌ Not enough candy! You need ${candyCost} ${rot.name} Candies (You have ${currentCandies}).`);
        return;
    }

    // Determine the target evolution name (supports random pool for Meow Meow or fixed target for others)
    let targetName = "";
    if (evo.isRandomPool && Array.isArray(evo.possibleOutcomes) && evo.possibleOutcomes.length > 0) {
        const randomIndex = Math.floor(Math.random() * evo.possibleOutcomes.length);
        targetName = evo.possibleOutcomes[randomIndex];
    } else {
        targetName = evo.target;
    }

    const targetData = brainrotCharacters.find(c => c.name.toLowerCase().trim() === targetName.toLowerCase().trim());
    if (!targetData) {
        alert(`❌ Evolution target data not found!`);
        return;
    }

    // Deduct candy
    playerData.candies[candyKey] -= candyCost;

    // --- ✨ COOL EVOLUTION ANIMATION EFFECT ✨ ---
    const detailModal = document.getElementById('cardDetailModal');
    if (detailModal) detailModal.style.display = 'none';

    let flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: radial-gradient(circle, #00ff55 0%, #000 80%);
        z-index: 99999999; display: flex; flex-direction: column;
        align-items: center; justify-content: center; font-family: monospace;
        color: #fff; animation: evolveFlash 1.5s ease-in-out forwards;
    `;
    flashOverlay.innerHTML = `
        <style>
            @keyframes evolveFlash {
                0% { opacity: 0; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.1); filter: brightness(2); }
                100% { opacity: 0; transform: scale(1); }
            }
        </style>
        <h1 style="color: #fff; text-shadow: 0 0 20px #00ff55; font-size: 2rem; margin-bottom: 10px;">🧬 EVOLVING...</h1>
        <p style="color: #76ff03; font-size: 1.1rem; font-weight: bold;">${rot.name} ➔ ${targetData.name}</p>
    `;
    document.body.appendChild(flashOverlay);

    // Wait for the animation to finish before updating stats and saving
    setTimeout(() => {
        flashOverlay.remove();

        const oldName = rot.name;
        rot.name = targetData.name;
        rot.rarity = targetData.rarity;
        rot.image = targetData.image;
        rot.baseHp = targetData.baseHp;
        rot.baseAtk = targetData.baseAtk;
        rot.baseDef = targetData.baseDef;

        const newStats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : { maxHp: 100, atk: 20, def: 20 };
        rot.maxHp = newStats.maxHp;
        rot.hp = rot.maxHp; 

        if (typeof window.saveGameData === 'function') {
            window.saveGameData();
        }

        alert(`🎉 SUCCESS! Your ${oldName} evolved into ${targetData.name}!`);

        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
    }, 1500);
};