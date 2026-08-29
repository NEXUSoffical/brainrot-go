// gear.js - Weapons, Armor, and Player Stat Calculations

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

window.gameArmor = [
    { id: "arm_01", name: "Torn Trenchcoat", rarity: "common", bonusHp: 0, def: 5, image: "gear/arm_01.png" },
    { id: "arm_02", name: "Reinforced Kevlar", rarity: "uncommon", bonusHp: 40, def: 15, image: "gear/arm_02.png" },
    { id: "arm_03", name: "Inquisitor's Robes", rarity: "epic", bonusHp: 100, def: 30, image: "gear/arm_03.png" },
    { id: "arm_04", name: "Mecha-Exosuit V1", rarity: "legendary", bonusHp: 250, def: 60, image: "gear/arm_04.png" }
];

// Calculates the player's total health and damage based on their equipped gear
window.calculatePlayerGearStats = function(playerData) {
    let pLevel = playerData?.accountLevel || 1;
    let baseHp = 100 + (pLevel * 10); // Base HP scales with account level
    
    let totalAtk = 10; // Base damage with bare fists
    let totalDef = 0;
    let totalHp = baseHp;

    if (playerData?.equipped) {
        // Add Weapon Damage
        let wpn = window.gameWeapons.find(w => w.id === playerData.equipped.weapon);
        if (wpn) totalAtk = wpn.atk;

        // Add Armor Defense and Bonus HP
        let chest = window.gameArmor.find(a => a.id === playerData.equipped.chest);
        if (chest) {
            totalHp += chest.bonusHp;
            totalDef += chest.def;
        }
    }

    return { maxHp: totalHp, atk: totalAtk, def: totalDef };
};