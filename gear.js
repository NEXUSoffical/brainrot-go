// gear.js - The Official Ghost Hunter Arsenal (Now with Infinite Variants!)

const weaponDatabase = [
    // --- COMMONS ---
    { id: "w_01", name: "Kitchen Knife", rarity: "Common", atk: 3, image: "gear/knife.png", cssFilter: "none" },
    { id: "w_02", name: "Rusty Sword", rarity: "Common", atk: 4, image: "gear/rusty_sword.png", cssFilter: "none" },
    { id: "w_03", name: "Wooden Club", rarity: "Common", atk: 2, image: "gear/club.png", cssFilter: "none" },
    { id: "w_04", name: "Basic Axe", rarity: "Common", atk: 5, image: "gear/axe.png", cssFilter: "none" },
    { id: "w_05", name: "Iron Dagger", rarity: "Common", atk: 4, image: "gear/dagger.png", cssFilter: "none" },

    // --- UNCOMMONS ---
    { id: "w_06", name: "Steel Katana", rarity: "Uncommon", atk: 12, image: "gear/katana.png", cssFilter: "none" },
    { id: "w_12", name: "Venom Dagger", rarity: "Uncommon", atk: 14, image: "gear/dagger.png", cssFilter: "hue-rotate(90deg) brightness(1.2)" }, // Green Variant

    // --- RARES ---
    { id: "w_07", name: "Blood Axe", rarity: "Rare", atk: 20, image: "gear/bloodaxe.png", cssFilter: "none" },
    { id: "w_08", name: "Fire Sword", rarity: "Rare", atk: 22, image: "gear/fire_sword.png", cssFilter: "none" },
    { id: "w_09", name: "Ecto-Saber", rarity: "Rare", atk: 24, image: "gear/ecto_saber.png", cssFilter: "none" },
    { id: "w_13", name: "Amethyst Katana", rarity: "Rare", atk: 26, image: "gear/katana.png", cssFilter: "hue-rotate(250deg) saturate(2)" }, // Purple Variant

    // --- EPICS ---
    { id: "w_10", name: "Aqueous Katana", rarity: "Epic", atk: 35, image: "gear/aqueous_katana.png", cssFilter: "none" },
    { id: "w_14", name: "Shadow Saber", rarity: "Epic", atk: 38, image: "gear/ecto_saber.png", cssFilter: "grayscale(1) brightness(1.5)" }, // White/Grey Variant
    { id: "w_15", name: "Glacial Axe", rarity: "Epic", atk: 40, image: "gear/bloodaxe.png", cssFilter: "hue-rotate(180deg) brightness(1.3)" }, // Blue Variant

    // --- LEGENDARIES ---
    { id: "w_11", name: "The Soul Render", rarity: "Legendary", atk: 60, image: "gear/soul_render.png", cssFilter: "none" },
    { id: "w_16", name: "The Void Render", rarity: "Legendary", atk: 65, image: "gear/soul_render.png", cssFilter: "hue-rotate(180deg) brightness(1.5) saturate(1.2)" }, // Blue/Neon Variant

    // --- MYTHICS (SECRET TIER) ---
    { id: "w_17", name: "The Toxic Render", rarity: "Mythic", atk: 90, image: "gear/soul_render.png", cssFilter: "hue-rotate(90deg) brightness(1.8) contrast(1.2)" }, // Glowing Green
    { id: "w_18", name: "Corrupted Katana", rarity: "Mythic", atk: 100, image: "gear/aqueous_katana.png", cssFilter: "invert(1) hue-rotate(180deg) brightness(1.5)" } // Evil Inverted Variant
];