// database.js - Phase 1 Common & Rare Launch Roster

const brainrotCharacters = [
  // ====================
  // 🟢 PHASE 1: COMMON ROTS
  // ====================
  { name: "Noobini Pizzanini", rarity: "common", reward: 1, image: "brainrots/noobini_pizzanini.png" },
  { name: "Holy Arepa", rarity: "common", reward: 1, image: "brainrots/holy_arepa.png" },
  { name: "Lirili Larila", rarity: "common", reward: 1, image: "brainrots/lirililarila.png" },
  { name: "Tim Cheese", rarity: "common", reward: 1, image: "brainrots/tim_cheese.png" },
  { name: "Flurifura", rarity: "common", reward: 1, image: "brainrots/flurifura.png" },
  { name: "Los Tungtungtungcitos", rarity: "common", reward: 1, image: "brainrots/los_tungtungtungcitos.png" },
  { name: "Talpa Di Fero", rarity: "common", reward: 1, image: "brainrots/talpa.png" },
  { name: "Svinina Bombardino", rarity: "common", reward: 1, image: "brainrots/svinina.png" },
  { name: "Pipi Kiwi", rarity: "common", reward: 1, image: "brainrots/pipi_kiwi.png" },
  { name: "Pipi Corni", rarity: "common", reward: 1, image: "brainrots/pipi_corni.png" },
  { name: "Racooni Jandelini", rarity: "common", reward: 1, image: "brainrots/racooni.png" },

  // ====================
  // 🟡 RARE ROTS
  // ====================
  { name: "Trippi Troppi", rarity: "rare", reward: 4, image: "brainrots/trippi_troppi.png" },
  { name: "Tung Tung Sahur", rarity: "rare", reward: 4, image: "brainrots/tung_tung_sahur.png" },
  { name: "Gangster Footera", rarity: "rare", reward: 5, image: "brainrots/gangster_footera.png" },
  { name: "Bandito Bobritto", rarity: "rare", reward: 5, image: "brainrots/bandito_bobritto.png" },
  { name: "Boneca Ambalabu", rarity: "rare", reward: 6, image: "brainrots/boneca_ambalabu.png" },
  { name: "Cacto Hipopotamo", rarity: "rare", reward: 6, image: "brainrots/cacto_hipopotamo.jpg" },
  { name: "Ta Ta Sahur", rarity: "rare", reward: 7, image: "brainrots/ta_ta_sahur.png" },
  { name: "Tric Trac", rarity: "rare", reward: 7, image: "brainrots/tric_trac.png" },

  // ====================
  // 🔒 FUTURE UPDATES (SECRETS)
  // ====================
  { name: "Fortunu and Cashuru", rarity: "secret", reward: 1, image: "" },
  { name: "Los Amigos", rarity: "secret", reward: 1, image: "" },
  { name: "La Secret Combinasion", rarity: "secret", reward: 1, image: "" },
  { name: "Foxini Lanternini", rarity: "secret", reward: 1, image: "" },
  { name: "Fragrama and Chocrama", rarity: "secret", reward: 1, image: "" },
  { name: "La Casa Boo", rarity: "secret", reward: 1, image: "" },
  { name: "Griffin", rarity: "secret", reward: 1, image: "" },
  { name: "Hydra Dragon Cannelloni", rarity: "secret", reward: 1, image: "" },
  { name: "Dragon Gingerini", rarity: "secret", reward: 1, image: "" },
  { name: "Love Love Bear", rarity: "secret", reward: 1, image: "" },
  { name: "Cerberus", rarity: "secret", reward: 1, image: "" },
  { name: "Celestial Pegasus", rarity: "secret", reward: 1, image: "" },
  { name: "Capitano Moby", rarity: "secret", reward: 1, image: "" },
  { name: "Bombardiro Crocodilo", rarity: "secret", reward: 1, image: "" },
  { name: "Boneca Amaldicoada", rarity: "secret", reward: 1, image: "" },
  { name: "Chimpenzini Bananini", rarity: "secret", reward: 1, image: "" },
  { name: "Gorilloni Ananasoni", rarity: "secret", reward: 1, image: "" },
  { name: "Elefanti Melonini", rarity: "secret", reward: 1, image: "" },
  { name: "Calamari Fritti", rarity: "secret", reward: 1, image: "" },
  { name: "Spaghetti T-Rex", rarity: "secret", reward: 1, image: "" },
  { name: "Tung Tung Sah", rarity: "secret", reward: 1, image: "" },
  { name: "Mamma Mia Pizzerio", rarity: "secret", reward: 1, image: "" },
  
  // ====================
  // ✨ OG
  // ====================
  { name: "Strawberry Elephant", rarity: "og", reward: 1, image: "" },
  { name: "Skibidi Toilet", rarity: "og", reward: 1, image: "" },
  { name: "Headless Horseman", rarity: "og", reward: 1, image: "" },
  { name: "Meowl", rarity: "og", reward: 1, image: "" }
];