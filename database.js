const brainrotCharacters = [
    { 
        name: "Hashtag", 
        rarity: "rare", 
        image: "brainrots/hashtag.png",
        baseHp: 65,
        baseAtk: 14,
        baseDef: 12,
        reward: 5,
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
        reward: 25
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
        reward: 30
    }
];