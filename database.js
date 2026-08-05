// database.js - Full Roster with RPG Base Stats (HP, Attack, Defense)

const brainrotCharacters = [
  // ====================
  // PHASE 1: COMMON ROTS
  // ====================
  { name: "Noobini Pizzanini", rarity: "common", reward: 1, image: "brainrots/noobini_pizzanini.png", baseHp: 45, baseAtk: 12, baseDef: 12 },
  { name: "Holy Arepa", rarity: "common", reward: 1, image: "brainrots/holy_arepa.png", baseHp: 60, baseAtk: 5, baseDef: 20 }, // Tank
  { name: "Lirili Larila", rarity: "common", reward: 1, image: "brainrots/lirililarila.png", baseHp: 35, baseAtk: 20, baseDef: 5 }, // Glass Cannon
  { name: "Tim Cheese", rarity: "common", reward: 1, image: "brainrots/tim_cheese.png", baseHp: 40, baseAtk: 15, baseDef: 10 },
  { name: "Flurifura", rarity: "common", reward: 1, image: "brainrots/flurifura.png", baseHp: 55, baseAtk: 8, baseDef: 15 },
  { name: "Los Tungtungtungcitos", rarity: "common", reward: 1, image: "brainrots/los_tungtungtungcitos.png", baseHp: 30, baseAtk: 22, baseDef: 8 },
  { name: "Talpa Di Fero", rarity: "common", reward: 1, image: "brainrots/talpa.png", baseHp: 50, baseAtk: 15, baseDef: 10 },
  { name: "Svinina Bombardino", rarity: "common", reward: 1, image: "brainrots/svinina.png", baseHp: 55, baseAtk: 10, baseDef: 15 },
  { name: "Pipi Kiwi", rarity: "common", reward: 1, image: "brainrots/pipi_kiwi.png", baseHp: 35, baseAtk: 18, baseDef: 8 },
  { name: "Pipi Corni", rarity: "common", reward: 1, image: "brainrots/pipi_corni.png", baseHp: 45, baseAtk: 14, baseDef: 12 },
  { name: "Racooni Jandelini", rarity: "common", reward: 1, image: "brainrots/racooni.png", baseHp: 40, baseAtk: 16, baseDef: 10 },

  // ====================
  // RARE ROTS
  // ====================
  { name: "Trippi Troppi", rarity: "rare", reward: 1, image: "brainrots/trippi_troppi.png", baseHp: 65, baseAtk: 15, baseDef: 20 },
  { name: "Tung Tung Sahur", rarity: "rare", reward: 1, image: "brainrots/tung_tung_sahur.png", baseHp: 55, baseAtk: 22, baseDef: 15 },
  { name: "Gangster Footera", rarity: "rare", reward: 1, image: "brainrots/gangster_footera.png", baseHp: 60, baseAtk: 25, baseDef: 12 },
  { name: "Bandito Bobritto", rarity: "rare", reward: 1, image: "brainrots/bandito_bobritto.png", baseHp: 50, baseAtk: 28, baseDef: 10 },
  { name: "Boneca Ambalabu", rarity: "rare", reward: 1, image: "brainrots/boneca_ambalabu.png", baseHp: 70, baseAtk: 12, baseDef: 25 },
  { name: "Cacto Hipopotamo", rarity: "rare", reward: 1, image: "brainrots/cacto_hipopotamo.png", baseHp: 75, baseAtk: 10, baseDef: 30 }, // Super Tank
  { name: "Ta Ta Sahur", rarity: "rare", reward: 1, image: "brainrots/ta_ta_sahur.png", baseHp: 55, baseAtk: 20, baseDef: 18 },
  { name: "Tric Trac", rarity: "rare", reward: 1, image: "brainrots/tric_trac.png", baseHp: 60, baseAtk: 22, baseDef: 14 },

  // ====================
  // EPIC ROTS
  // ====================
  { name: "Cappuccino Assassino", rarity: "epic", reward: 1, image: "brainrots/cappuccino_assassino.png", baseHp: 60, baseAtk: 40, baseDef: 15 }, // Glass Cannon
  { name: "Brr Brr Patapim", rarity: "epic", reward: 1, image: "brainrots/brr_brr_patapim.png", baseHp: 85, baseAtk: 20, baseDef: 35 }, // Tank
  { name: "Trulimero Trulicina", rarity: "epic", reward: 1, image: "brainrots/trulimero_trulicina.png", baseHp: 75, baseAtk: 30, baseDef: 25 },
  { name: "Bambini Crostini", rarity: "epic", reward: 1, image: "brainrots/bambini_crostini.png", baseHp: 70, baseAtk: 25, baseDef: 30 },
  { name: "Bananita Dolphinita", rarity: "epic", reward: 1, image: "brainrots/bananita_dolphinita.png", baseHp: 80, baseAtk: 22, baseDef: 25 },
  { name: "Perochello Lemonchello", rarity: "epic", reward: 1, image: "brainrots/perochello_lemonchello.png", baseHp: 65, baseAtk: 35, baseDef: 20 },
  { name: "Brri Brri Bicus Dicus Bombicus", rarity: "epic", reward: 1, image: "brainrots/brri_brri_bicus_dicus_bombicus.png", baseHp: 90, baseAtk: 15, baseDef: 40 },
  { name: "Avocadini Guffo", rarity: "epic", reward: 1, image: "brainrots/avocadini_guffo.png", baseHp: 75, baseAtk: 28, baseDef: 28 },
  { name: "Ti Ti Ti Sahur", rarity: "epic", reward: 1, image: "brainrots/ti_ti_ti_sahur.png", baseHp: 70, baseAtk: 32, baseDef: 20 },
  { name: "Salamino Penguino", rarity: "epic", reward: 1, image: "brainrots/salamino_penguino.png", baseHp: 80, baseAtk: 25, baseDef: 30 },
  { name: "Penguino Cocosino", rarity: "epic", reward: 1, image: "brainrots/penguino_cocosino.png", baseHp: 85, baseAtk: 26, baseDef: 28 },

  // ====================
  // SECRETS
  // ====================
  { name: "Dragon Cannelloni", rarity: "secret", reward: 1, image: "brainrots/dragon_cannelloni.png", baseHp: 80, baseAtk: 45, baseDef: 30 },
  { name: "Spaghetti Tualetti", rarity: "secret", reward: 1, image: "brainrots/spaghetti_tualetti.png", baseHp: 110, baseAtk: 30, baseDef: 45 },
  { name: "Garama and Madundung", rarity: "secret", reward: 1, image: "brainrots/garama_and_madundung.png", baseHp: 95, baseAtk: 40, baseDef: 35 },
  { name: "Ketchuru and Musturu", rarity: "secret", reward: 1, image: "brainrots/ketchuru_and_musturu.png", baseHp: 90, baseAtk: 42, baseDef: 30 },
  { name: "La Supreme Combinasion", rarity: "secret", reward: 1, image: "brainrots/la_supreme_combinasion.png", baseHp: 100, baseAtk: 45, baseDef: 40 },
  { name: "Los Bros", rarity: "secret", reward: 1, image: "brainrots/los_bros.png", baseHp: 85, baseAtk: 48, baseDef: 25 },
  { name: "La Vacca Staturno Saturnita", rarity: "secret", reward: 1, image: "brainrots/la_vacca_staturno_saturnita.png", baseHp: 120, baseAtk: 25, baseDef: 50 },
  
  // Remaining Secret Placeholders
  { name: "Fortunu and Cashuru", rarity: "secret", reward: 1, image: "", baseHp: 90, baseAtk: 35, baseDef: 40 },
  { name: "Foxini Lanternini", rarity: "secret", reward: 1, image: "", baseHp: 85, baseAtk: 46, baseDef: 28 },
  { name: "Fragrama and Chocrama", rarity: "secret", reward: 1, image: "", baseHp: 95, baseAtk: 38, baseDef: 35 },
  { name: "La Casa Boo", rarity: "secret", reward: 1, image: "", baseHp: 75, baseAtk: 50, baseDef: 20 },
  { name: "Griffin", rarity: "secret", reward: 1, image: "", baseHp: 105, baseAtk: 42, baseDef: 38 },
  { name: "Dragon Gingerini", rarity: "secret", reward: 1, image: "", baseHp: 95, baseAtk: 48, baseDef: 30 },
  { name: "Love Love Bear", rarity: "secret", reward: 1, image: "", baseHp: 130, baseAtk: 20, baseDef: 45 },
  { name: "Cerberus", rarity: "secret", reward: 1, image: "", baseHp: 110, baseAtk: 50, baseDef: 35 },
  { name: "Celestial Pegasus", rarity: "secret", reward: 1, image: "", baseHp: 100, baseAtk: 44, baseDef: 42 },
  { name: "Capitano Moby", rarity: "secret", reward: 1, image: "", baseHp: 140, baseAtk: 35, baseDef: 45 },
  { name: "Bombardiro Crocodilo", rarity: "secret", reward: 1, image: "", baseHp: 115, baseAtk: 45, baseDef: 40 },
  { name: "Boneca Amaldicoada", rarity: "secret", reward: 1, image: "", baseHp: 80, baseAtk: 52, baseDef: 25 },
  { name: "Chimpenzini Bananini", rarity: "secret", reward: 1, image: "", baseHp: 95, baseAtk: 40, baseDef: 35 },
  { name: "Gorilloni Ananasoni", rarity: "secret", reward: 1, image: "", baseHp: 125, baseAtk: 42, baseDef: 45 },
  { name: "Elefanti Melonini", rarity: "secret", reward: 1, image: "", baseHp: 135, baseAtk: 38, baseDef: 48 },
  { name: "Calamari Fritti", rarity: "secret", reward: 1, image: "", baseHp: 90, baseAtk: 46, baseDef: 30 },
  { name: "Spaghetti T-Rex", rarity: "secret", reward: 1, image: "", baseHp: 115, baseAtk: 48, baseDef: 35 },
  { name: "Tung Tung Sah", rarity: "secret", reward: 1, image: "", baseHp: 100, baseAtk: 44, baseDef: 38 },
  { name: "Mamma Mia Pizzerio", rarity: "secret", reward: 1, image: "", baseHp: 105, baseAtk: 40, baseDef: 45 },
  
  // ====================
  // OGS
  // ====================
  { name: "Strawberry Elephant", rarity: "og", reward: 1, image: "brainrots/strawberry_elephant.png", baseHp: 180, baseAtk: 50, baseDef: 75 }, // Absolute God Tank
  { name: "Headless Horseman", rarity: "og", reward: 1, image: "brainrots/headless_horseman.png", baseHp: 140, baseAtk: 80, baseDef: 45 }, // God Glass Cannon
  { name: "Meowl", rarity: "og", reward: 1, image: "brainrots/meowl.png", baseHp: 150, baseAtk: 65, baseDef: 60 }, // God Balanced
  
  // Remaining OG Placeholder
  { name: "Skibidi Toilet", rarity: "og", reward: 1, image: "", baseHp: 160, baseAtk: 60, baseDef: 55 }
];