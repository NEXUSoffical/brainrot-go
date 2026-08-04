// database.js - Full Roster (Commons, Rares, Epics, Secrets, OGs)

const brainrotCharacters = [
  // ====================
  // PHASE 1: COMMON ROTS
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
  // RARE ROTS
  // ====================
  { name: "Trippi Troppi", rarity: "rare", reward: 1, image: "brainrots/trippi_troppi.png" },
  { name: "Tung Tung Sahur", rarity: "rare", reward: 1, image: "brainrots/tung_tung_sahur.png" },
  { name: "Gangster Footera", rarity: "rare", reward: 1, image: "brainrots/gangster_footera.png" },
  { name: "Bandito Bobritto", rarity: "rare", reward: 1, image: "brainrots/bandito_bobritto.png" },
  { name: "Boneca Ambalabu", rarity: "rare", reward: 1, image: "brainrots/boneca_ambalabu.png" },
  { name: "Cacto Hipopotamo", rarity: "rare", reward: 1, image: "brainrots/cacto_hipopotamo.png" },
  { name: "Ta Ta Sahur", rarity: "rare", reward: 1, image: "brainrots/ta_ta_sahur.png" },
  { name: "Tric Trac", rarity: "rare", reward: 1, image: "brainrots/tric_trac.png" },

  // ====================
  // EPIC ROTS
  // ====================
  { name: "Cappuccino Assassino", rarity: "epic", reward: 1, image: "brainrots/cappuccino_assassino.png" },
  { name: "Brr Brr Patapim", rarity: "epic", reward: 1, image: "brainrots/brr_brr_patapim.png" },
  { name: "Trulimero Trulicina", rarity: "epic", reward: 1, image: "brainrots/trulimero_trulicina.png" },
  { name: "Bambini Crostini", rarity: "epic", reward: 1, image: "brainrots/bambini_crostini.png" },
  { name: "Bananita Dolphinita", rarity: "epic", reward: 1, image: "brainrots/bananita_dolphinita.png" },
  { name: "Perochello Lemonchello", rarity: "epic", reward: 1, image: "brainrots/perochello_lemonchello.png" },
  { name: "Brri Brri Bicus Dicus Bombicus", rarity: "epic", reward: 1, image: "brainrots/brri_brri_bicus_dicus_bombicus.png" },
  { name: "Avocadini Guffo", rarity: "epic", reward: 1, image: "brainrots/avocadini_guffo.png" },
  { name: "Ti Ti Ti Sahur", rarity: "epic", reward: 1, image: "brainrots/ti_ti_ti_sahur.png" },
  { name: "Salamino Penguino", rarity: "epic", reward: 1, image: "brainrots/salamino_penguino.png" },
  { name: "Penguino Cocosino", rarity: "epic", reward: 1, image: "brainrots/penguino_cocosino.png" },

  // ====================
  // SECRETS
  // ====================
  { name: "Dragon Cannelloni", rarity: "secret", reward: 1, image: "brainrots/dragon_cannelloni.png" },
  { name: "Spaghetti Tualetti", rarity: "secret", reward: 1, image: "brainrots/spaghetti_tualetti.png" },
  { name: "Garama and Madundung", rarity: "secret", reward: 1, image: "brainrots/garama_and_madundung.png" },
  { name: "Ketchuru and Musturu", rarity: "secret", reward: 1, image: "brainrots/ketchuru_and_musturu.png" },
  { name: "La Supreme Combinasion", rarity: "secret", reward: 1, image: "brainrots/la_supreme_combinasion.png" },
  { name: "Los Bros", rarity: "secret", reward: 1, image: "brainrots/los_bros.png" },
  { name: "La Vacca Staturno Saturnita", rarity: "secret", reward: 1, image: "brainrots/la_vacca_staturno_saturnita.png" },
  
  // Remaining Secret Placeholders
  { name: "Fortunu and Cashuru", rarity: "secret", reward: 1, image: "" },
  { name: "Foxini Lanternini", rarity: "secret", reward: 1, image: "" },
  { name: "Fragrama and Chocrama", rarity: "secret", reward: 1, image: "" },
  { name: "La Casa Boo", rarity: "secret", reward: 1, image: "" },
  { name: "Griffin", rarity: "secret", reward: 1, image: "" },
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
  // OGS
  // ====================
  { name: "Strawberry Elephant", rarity: "og", reward: 1, image: "brainrots/strawberry_elephant.png" },
  { name: "Headless Horseman", rarity: "og", reward: 1, image: "brainrots/headless_horseman.png" },
  { name: "Meowl", rarity: "og", reward: 1, image: "brainrots/meowl.png" },
  
  // Remaining OG Placeholder
  { name: "Skibidi Toilet", rarity: "og", reward: 1, image: "" }
];