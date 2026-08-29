// armory.js - The Master Loot & Gear Database

window.gameWeapons = [
    // ⚪ COMMON WEAPONS
    { id: "wpn_001", name: "Rusted Iron Broadsword", rarity: "common", type: "physical", baseDamage: 15, speed: 1.0, description: "A heavy, rusted blade. Better than using your fists.", image: "gear/rusty_sword.png" },
    { id: "wpn_002", name: "Wooden Training Bokken", rarity: "common", type: "slash", baseDamage: 10, speed: 0.6, description: "Fast but weak. Good for practicing.", image: "gear/wood_sword.png" },

    // 🟡 UNCOMMON WEAPONS
    { id: "wpn_010", name: "Silver-Edged Katana", rarity: "uncommon", type: "slash", baseDamage: 28, speed: 0.5, description: "A beautifully balanced blade that cuts through basic spirits.", image: "gear/silver_katana.png" },
    { id: "wpn_011", name: "Copper Mace", rarity: "uncommon", type: "heavy", baseDamage: 45, speed: 1.5, description: "Slow, but crushes armor easily.", image: "gear/copper_mace.png" },

    // 🟢 RARE WEAPONS
    { id: "wpn_030", name: "Tide-Cleaver", rarity: "rare", type: "water", baseDamage: 65, speed: 0.8, description: "Forged in the deep abyss. Deals massive damage to Fire anomalies.", image: "gear/tide_cleaver.png" },
    { id: "wpn_031", name: "Voltaic Dagger", rarity: "rare", type: "electric", baseDamage: 35, speed: 0.3, description: "Lightning fast. Overwhelms enemies with a flurry of strikes.", image: "gear/volt_dagger.png" },

    // 🔵 EPIC WEAPONS
    { id: "wpn_070", name: "Inferno Greatsword", rarity: "epic", type: "fire", baseDamage: 140, speed: 1.2, description: "Radiates intense heat. Can melt through Frost entities in seconds.", image: "gear/inferno_sword.png" },
    { id: "wpn_071", name: "Banshee's Wail", rarity: "epic", type: "sonic", baseDamage: 95, speed: 0.7, description: "A rapier that vibrates at a lethal frequency.", image: "gear/banshee_blade.png" },

    // 🟣 MYTHIC / SECRET WEAPONS
    { id: "wpn_099", name: "Void-Touched Reaper", rarity: "secret", type: "dark", baseDamage: 300, speed: 1.0, description: "A scythe that tears the very fabric of reality. Feared by gods.", image: "gear/void_reaper.png" },
    { id: "wpn_100", name: "Excalibur of the Dawn", rarity: "secret", type: "holy", baseDamage: 250, speed: 0.6, description: "The legendary king's blade. Eradicates dark forces instantly.", image: "gear/excalibur.png" }
];

window.gameArmor = [
    // ⚪ COMMON ARMOR
    { id: "arm_h_001", name: "Tattered Leather Cowl", slot: "head", rarity: "common", defense: 5, resistance: "none", image: "gear/leather_head.png" },
    { id: "arm_c_001", name: "Tattered Leather Tunic", slot: "chest", rarity: "common", defense: 10, resistance: "none", image: "gear/leather_chest.png" },
    { id: "arm_l_001", name: "Worn Leather Boots", slot: "legs", rarity: "common", defense: 5, resistance: "none", image: "gear/leather_legs.png" },

    // 🟡 UNCOMMON ARMOR
    { id: "arm_h_010", name: "Hunter's Iron Helm", slot: "head", rarity: "uncommon", defense: 15, resistance: "physical", image: "gear/iron_head.png" },
    { id: "arm_c_010", name: "Hunter's Iron Breastplate", slot: "chest", rarity: "uncommon", defense: 35, resistance: "physical", image: "gear/iron_chest.png" },
    { id: "arm_l_010", name: "Hunter's Iron Greaves", slot: "legs", rarity: "uncommon", defense: 15, resistance: "physical", image: "gear/iron_legs.png" },

    // 🟢 RARE ARMOR
    { id: "arm_h_030", name: "Glacial Crown", slot: "head", rarity: "rare", defense: 30, resistance: "ice", image: "gear/ice_head.png" },
    { id: "arm_c_030", name: "Glacial Carapace", slot: "chest", rarity: "rare", defense: 75, resistance: "ice", image: "gear/ice_chest.png" },
    { id: "arm_l_030", name: "Glacial Treads", slot: "legs", rarity: "rare", defense: 30, resistance: "ice", image: "gear/ice_legs.png" },

    // 🔵 EPIC ARMOR
    { id: "arm_h_070", name: "Dragon-Scale Helmet", slot: "head", rarity: "epic", defense: 60, resistance: "fire", image: "gear/dragon_head.png" },
    { id: "arm_c_070", name: "Dragon-Scale Chestguard", slot: "chest", rarity: "epic", defense: 150, resistance: "fire", image: "gear/dragon_chest.png" },
    { id: "arm_l_070", name: "Dragon-Scale Greaves", slot: "legs", rarity: "epic", defense: 60, resistance: "fire", image: "gear/dragon_legs.png" }
];

// 🛠️ HELPER: Calculate Player's Total Stats Based on Equipped Gear
window.calculatePlayerGearStats = function(playerData) {
    // Base human stats (Level 1 naked human)
    let totalStats = {
        maxHp: 100 + ((playerData.accountLevel || 1) * 10),
        atk: 5, // Punches don't hurt much
        def: 0,
        speed: 1.0,
        weaponElement: "physical"
    };

    if (!playerData.equipped) return totalStats;

    // Add Weapon Stats
    if (playerData.equipped.weapon) {
        const weapon = window.gameWeapons.find(w => w.id === playerData.equipped.weapon);
        if (weapon) {
            totalStats.atk += weapon.baseDamage;
            totalStats.speed = weapon.speed;
            totalStats.weaponElement = weapon.type;
        }
    }

    // Add Armor Stats
    const armorSlots = ['head', 'chest', 'legs'];
    armorSlots.forEach(slot => {
        if (playerData.equipped[slot]) {
            const armor = window.gameArmor.find(a => a.id === playerData.equipped[slot]);
            if (armor) {
                totalStats.def += armor.defense;
            }
        }
    });

    return totalStats;
};