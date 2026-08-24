// ==========================================
// CHARACTER DATABASE (ALL 50 SPAWNS - UNIQUE LORE STATS)
// ==========================================
const paranormalSpawns = [
    // 🟢 TIER 1 - Nuisances (Rarity: Common)
    { name: "Goblin", rarity: "common", image: "brainrots/Goblin.png", baseHp: 40, baseAtk: 12, baseDef: 6, reward: 1 }, 
    { name: "Kappa", rarity: "common", image: "brainrots/Kappa.png", baseHp: 45, baseAtk: 10, baseDef: 12, reward: 1 }, 
    { name: "Chupacabra", rarity: "common", image: "brainrots/Chupacabra.png", baseHp: 35, baseAtk: 15, baseDef: 5, reward: 1 }, 
    { name: "Kelpie", rarity: "common", image: "brainrots/Kelpie.png", baseHp: 50, baseAtk: 11, baseDef: 8, reward: 1 }, 
    { name: "Gremlin", rarity: "common", image: "brainrots/Gremlin.png", baseHp: 30, baseAtk: 14, baseDef: 4, reward: 1 }, 
    { name: "Imp", rarity: "common", image: "brainrots/Imp.png", baseHp: 35, baseAtk: 13, baseDef: 7, reward: 1 }, 
    { name: "Boggart", rarity: "common", image: "brainrots/Boggart.png", baseHp: 40, baseAtk: 9, baseDef: 10, reward: 1 }, 
    { name: "Púca", rarity: "common", image: "brainrots/Puca.png", baseHp: 38, baseAtk: 11, baseDef: 9, reward: 1 }, 
    { name: "Satyr", rarity: "common", image: "brainrots/Satyr.png", baseHp: 42, baseAtk: 8, baseDef: 8, reward: 1 }, 
    { name: "Jackalope", rarity: "common", image: "brainrots/Jackalope.png", baseHp: 32, baseAtk: 14, baseDef: 6, reward: 1 },

    // 🔵 TIER 2 - Hunters (Rarity: Uncommon)
    { name: "Vampire", rarity: "uncommon", image: "brainrots/Vampire.png", baseHp: 60, baseAtk: 22, baseDef: 12, reward: 3 }, 
    { name: "Werewolf", rarity: "uncommon", image: "brainrots/Werewolf.png", baseHp: 75, baseAtk: 25, baseDef: 15, reward: 3 }, 
    { name: "Wendigo", rarity: "uncommon", image: "brainrots/Wendigo.png", baseHp: 50, baseAtk: 28, baseDef: 8, reward: 3 }, 
    { name: "Minotaur", rarity: "uncommon", image: "brainrots/Minotaur.png", baseHp: 85, baseAtk: 20, baseDef: 20, reward: 3 }, 
    { name: "Siren", rarity: "uncommon", image: "brainrots/Siren.png", baseHp: 55, baseAtk: 18, baseDef: 10, reward: 3 }, 
    { name: "Harpy", rarity: "uncommon", image: "brainrots/Harpy.png", baseHp: 45, baseAtk: 24, baseDef: 9, reward: 3 }, 
    { name: "Banshee", rarity: "uncommon", image: "brainrots/Banshee.png", baseHp: 50, baseAtk: 26, baseDef: 10, reward: 3 }, 
    { name: "Chimaera", rarity: "uncommon", image: "brainrots/Chimaera.png", baseHp: 70, baseAtk: 22, baseDef: 18, reward: 3 }, 
    { name: "Skinwalker", rarity: "uncommon", image: "brainrots/Skinwalker.png", baseHp: 65, baseAtk: 19, baseDef: 14, reward: 3 }, 
    { name: "Tengu", rarity: "uncommon", image: "brainrots/Tengu.png", baseHp: 60, baseAtk: 24, baseDef: 12, reward: 3 }, 

    // 🟣 TIER 3 - Army Breakers (Rarity: Rare)
    { name: "Griffin", rarity: "rare", image: "brainrots/Griffin.png", baseHp: 105, baseAtk: 35, baseDef: 22, reward: 10 }, 
    { name: "Manticore", rarity: "rare", image: "brainrots/Manticore.png", baseHp: 95, baseAtk: 42, baseDef: 18, reward: 10 }, 
    { name: "Basilisk", rarity: "rare", image: "brainrots/Basilisk.png", baseHp: 85, baseAtk: 45, baseDef: 25, reward: 10 }, 
    { name: "Cyclops", rarity: "rare", image: "brainrots/Cyclops.png", baseHp: 130, baseAtk: 38, baseDef: 15, reward: 10 }, 
    { name: "Rakshasa", rarity: "rare", image: "brainrots/Rakshasa.png", baseHp: 100, baseAtk: 32, baseDef: 24, reward: 10 }, 
    { name: "Oni", rarity: "rare", image: "brainrots/Oni.png", baseHp: 120, baseAtk: 40, baseDef: 20, reward: 10 }, 
    { name: "Thunderbird", rarity: "rare", image: "brainrots/Thunderbird.png", baseHp: 90, baseAtk: 44, baseDef: 16, reward: 10 }, 
    { name: "Sphinx", rarity: "rare", image: "brainrots/Sphinx.png", baseHp: 115, baseAtk: 28, baseDef: 35, reward: 10 }, 
    { name: "Yeti", rarity: "rare", image: "brainrots/Yeti.png", baseHp: 125, baseAtk: 34, baseDef: 22, reward: 10 }, 
    { name: "Nuckelavee", rarity: "rare", image: "brainrots/Nuckelavee.png", baseHp: 110, baseAtk: 36, baseDef: 12, reward: 10 }, 

    // 🔴 TIER 4 - Calamities (Rarity: Epic)
    { name: "Kraken", rarity: "epic", image: "brainrots/Kraken.png", baseHp: 320, baseAtk: 80, baseDef: 45, reward: 25 }, 
    { name: "Hydra", rarity: "epic", image: "brainrots/Hydra.png", baseHp: 280, baseAtk: 75, baseDef: 60, reward: 25 }, 
    { name: "Cerberus", rarity: "epic", image: "brainrots/Cerberus.png", baseHp: 260, baseAtk: 85, baseDef: 50, reward: 25 }, 
    { name: "Roc", rarity: "epic", image: "brainrots/Roc.png", baseHp: 210, baseAtk: 90, baseDef: 40, reward: 25 }, 
    { name: "Tarasque", rarity: "epic", image: "brainrots/Tarasque.png", baseHp: 300, baseAtk: 65, baseDef: 95, reward: 25 }, 
    { name: "Scylla", rarity: "epic", image: "brainrots/Scylla.png", baseHp: 250, baseAtk: 88, baseDef: 48, reward: 25 }, 
    { name: "Charybdis", rarity: "epic", image: "brainrots/Charybdis.png", baseHp: 350, baseAtk: 60, baseDef: 40, reward: 25 }, 
    { name: "Qilin", rarity: "epic", image: "brainrots/Qilin.png", baseHp: 240, baseAtk: 70, baseDef: 75, reward: 25 }, 
    { name: "Gashadokuro", rarity: "epic", image: "brainrots/Gashadokuro.png", baseHp: 270, baseAtk: 95, baseDef: 30, reward: 25 }, 
    { name: "Grootslang", rarity: "epic", image: "brainrots/Grootslang.png", baseHp: 310, baseAtk: 82, baseDef: 65, reward: 25 }, 

    // 🌟 TIER 5 - World-Enders (Rarity: Secret)
    { name: "Typhon", rarity: "secret", image: "brainrots/Typhon.png", baseHp: 1200, baseAtk: 350, baseDef: 220, reward: 200 }, 
    { name: "Behemoth", rarity: "secret", image: "brainrots/Behemoth.png", baseHp: 1150, baseAtk: 250, baseDef: 280, reward: 150 }, 
    { name: "Jörmungandr", rarity: "secret", image: "brainrots/Jörmungandr.png", baseHp: 1100, baseAtk: 280, baseDef: 260, reward: 160 }, 
    { name: "Cipactli", rarity: "secret", image: "brainrots/Cipactli.png", baseHp: 1080, baseAtk: 260, baseDef: 270, reward: 140 }, 
    { name: "Tiamat", rarity: "secret", image: "brainrots/Tiamat.png", baseHp: 1050, baseAtk: 300, baseDef: 240, reward: 160 }, 
    { name: "Leviathan", rarity: "secret", image: "brainrots/Leviathan.png", baseHp: 1000, baseAtk: 260, baseDef: 300, reward: 150 }, 
    { name: "Bakunawa", rarity: "secret", image: "brainrots/Bakunawa.png", baseHp: 980, baseAtk: 285, baseDef: 200, reward: 140 }, 
    { name: "Vritra", rarity: "secret", image: "brainrots/Vritra.png", baseHp: 950, baseAtk: 290, baseDef: 210, reward: 140 }, 
    { name: "Apophis", rarity: "secret", image: "brainrots/Apophis.png", baseHp: 950, baseAtk: 340, baseDef: 150, reward: 150 }, 
    { name: "Fenrir", rarity: "secret", image: "brainrots/Fenrir.png", baseHp: 900, baseAtk: 330, baseDef: 170, reward: 150 } 
];