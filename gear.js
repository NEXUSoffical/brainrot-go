// gear.js - Weapons and Player Stat Calculations

window.gameWeapons = [
    // 🟢 COMMONS 
    { id: "wpn_01", name: "Bent Butter Knife", rarity: "common", atk: 5, image: "gear/knife.png" },
    { id: "wpn_02", name: "Rusty Iron Sword", rarity: "common", atk: 12, image: "gear/rusty.png" },
    { id: "wpn_03", name: "Chipped Wood Axe", rarity: "common", atk: 16, image: "gear/axe.png" },

    // 🔵 UNCOMMONS
    { id: "wpn_05", name: "Thief's Silver Dagger", rarity: "uncommon", atk: 25, image: "gear/dagger.png" },
    { id: "wpn_06", name: "Spiked Goblin Club", rarity: "uncommon", atk: 34, image: "gear/club.png" },

    // 🟣 EPICS
    { id: "wpn_07", name: "Swift Neon Katana", rarity: "epic", atk: 65, image: "gear/katana.png" },
    { id: "wpn_08", name: "Heavy Blood-Axe", rarity: "epic", atk: 85, image: "gear/bloodaxe.png" },
    
    // 🟠 LEGENDARIES
    { id: "wpn_09", name: "Blazing Sun-Sword", rarity: "legendary", atk: 120, image: "gear/fire_sword.png" }
];

// Calculates the player's total stats based on Level + Weapon
window.calculatePlayerGearStats = function(playerData) {
    let pLevel = playerData?.accountLevel || 1;
    
    // HP and Defense naturally scale up with the player's level
    let totalHp = 100 + (pLevel * 15); 
    let totalDef = pLevel * 2; 
    
    let totalAtk = 10; // Base damage with bare fists

    // Only add weapon stats
    if (playerData?.equipped?.weapon) {
        let wpn = window.gameWeapons.find(w => w.id === playerData.equipped.weapon);
        if (wpn) totalAtk = wpn.atk;
    }

    return { maxHp: totalHp, atk: totalAtk, def: totalDef };
};