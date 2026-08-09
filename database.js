const brainrotCharacters = [
    { 
        name: "Hashtag", 
        rarity: "rare", 
        image: "brainrots/hashtag.png",
        baseHp: 65,
        baseAtk: 14,
        baseDef: 12,
        reward: 3,
        evolution: {
            target: "Hashtag Hell",
            candyCost: 50
        }
    },
    { 
        name: "Hashtag Hell", 
        rarity: "secret", 
        image: "brainrots/hashtag_hell.png",
        baseHp: 150,
        baseAtk: 35,
        baseDef: 28,
        reward: 3
    },
    {
        name: "Chad Cloud",
        rarity: "common",
        image: "brainrots/chad_cloud.png",
        baseHp: 55,
        baseAtk: 12,
        baseDef: 8,
        reward: 3,
        evolution: {
            target: "God Cloud",
            candyCost: 250
        }
    },
    {
        name: "God Cloud",
        rarity: "og",
        image: "brainrots/god_cloud.png",
        baseHp: 160,
        baseAtk: 38,
        baseDef: 30,
        reward: 3
    },
    {
        name: "Fomo Phantom",
        rarity: "common",
        image: "brainrots/fomo_phantom.png",
        baseHp: 50,
        baseAtk: 12,
        baseDef: 10,
        reward: 3,
        evolution: {
            target: "Fomo Doom",
            candyCost: 50
        }
    },
    {
        name: "Fomo Doom",
        rarity: "rare",
        image: "brainrots/fomo_doom.png",
        baseHp: 120,
        baseAtk: 28,
        baseDef: 22,
        reward: 3
    },
    {
        name: "Pufflet",
        rarity: "common",
        image: "brainrots/pufflet.png",
        baseHp: 50,
        baseAtk: 11,
        baseDef: 9,
        reward: 3,
        evolution: {
            target: "Blimpy",
            candyCost: 50
        }
    },
    {
        name: "Blimpy",
        rarity: "secret",
        image: "brainrots/blimpy.png",
        baseHp: 220,
        baseAtk: 18,
        baseDef: 40,
        reward: 3
    },
    {
        name: "Wafflet",
        rarity: "common",
        image: "brainrots/wafflet.png",
        baseHp: 60,
        baseAtk: 14,
        baseDef: 12,
        reward: 3,
        evolution: {
            target: "WaffleWrecker",
            candyCost: 250
        }
    },
    {
        name: "WaffleWrecker",
        rarity: "og",
        image: "brainrots/waffle_wrecker.png",
        baseHp: 165,
        baseAtk: 40,
        baseDef: 32,
        reward: 3
    },
    {
        name: "Giga Byte",
        rarity: "rare",
        image: "brainrots/giga_byte.png",
        baseHp: 80,
        baseAtk: 22,
        baseDef: 20,
        reward: 3,
        evolution: {
            target: "Titan Mech",
            candyCost: 75
        }
    },
    {
        name: "Titan Mech",
        rarity: "epic",
        image: "brainrots/titan_mech.png",
        baseHp: 140,
        baseAtk: 32,
        baseDef: 30,
        reward: 3
    },
    {
        name: "Meow Meow",
        rarity: "rare",
        image: "brainrots/neon_cat.png",
        baseHp: 75,
        baseAtk: 24,
        baseDef: 16,
        reward: 3,
        evolution: {
            isRandomPool: true,
            candyCost: 75,
            possibleOutcomes: [
                "GlitchNyan",
                "VoidProwler",
                "Celestial Purr",
                "BlazeMew",
                "VerdantStalker"
            ]
        }
    },
    {
        name: "GlitchNyan",
        rarity: "epic",
        image: "brainrots/glitch_nyan.png",
        baseHp: 130,
        baseAtk: 35,
        baseDef: 22,
        reward: 3
    },
    {
        name: "VoidProwler",
        rarity: "epic",
        image: "brainrots/void_prowler.png",
        baseHp: 140,
        baseAtk: 33,
        baseDef: 25,
        reward: 3
    },
    {
        name: "Celestial Purr",
        rarity: "epic",
        image: "brainrots/celestial_purr.png",
        baseHp: 135,
        baseAtk: 34,
        baseDef: 24,
        reward: 3
    },
    {
        name: "BlazeMew",
        rarity: "epic",
        image: "brainrots/blaze_mew.png",
        baseHp: 125,
        baseAtk: 38,
        baseDef: 20,
        reward: 3
    },
    {
        name: "VerdantStalker",
        rarity: "epic",
        image: "brainrots/verdant_stalker.png",
        baseHp: 145,
        baseAtk: 31,
        baseDef: 26,
        reward: 3
    }
];