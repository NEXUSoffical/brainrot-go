// spawner.js - Multiplayer Deterministic Spawner & Turn-Based Combat Engine

let spawnedCreatures = [];
let lastSpawnLat = null;
let lastSpawnLng = null;
let isNearWater = false;
let lastWaterCheckTime = 0;
let spawnerInterval = null;

window.activeCreatures = spawnedCreatures;
window.currentBattleEntry = null;

// ==========================================
// DETERMINISTIC SEEDED RNG
// ==========================================
class SeededPRNG {
    constructor(seedStr) {
        let h = 0;
        for(let i = 0; i < seedStr.length; i++) h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
        this.seed = h;
    }
    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function getSeededLevel(rng) {
  const roll = rng.next();
  if (roll < 0.60) return 1;
  else if (roll < 0.88) return Math.floor(rng.next() * 9) + 2;
  else return Math.floor(rng.next() * 10) + 11;
}

function getSeededBrainrot(rng) {
  const source = (typeof paranormalSpawns !== 'undefined' && Array.isArray(paranormalSpawns) && paranormalSpawns.length > 0) ? paranormalSpawns : [{ name: "Vampire", rarity: "uncommon", type: "urban", image: "brainrots/Vampire.png", baseHp: 60, baseAtk: 15 }];
  const validCharacters = source.filter(char => char && char.image && char.image.trim() !== "");
  if (validCharacters.length === 0) return source[0];

  const getWeight = (char) => {
    let baseWeight = 1000000;
    switch((char.rarity || '').toLowerCase()) {
      case 'common': baseWeight = 1000000; break;
      case 'uncommon': baseWeight = 200000; break;
      case 'rare': baseWeight = 10000; break;
      case 'epic': baseWeight = 200; break;
      case 'secret': baseWeight = 10; break;
    }
    if (isNearWater && char.type === 'water') baseWeight *= 8;
    return baseWeight;
  };

  let totalWeight = 0;
  validCharacters.forEach(char => totalWeight += getWeight(char));
  let randomNum = rng.next() * totalWeight;

  for (let i = 0; i < validCharacters.length; i++) {
    randomNum -= getWeight(validCharacters[i]);
    if (randomNum <= 0) return validCharacters[i];
  }
  return validCharacters[0]; 
}

function getRarityColor(rarity) {
  switch ((rarity || '').toLowerCase()) {
    case 'secret': return '#ff00ea'; case 'epic': return '#0088ff';      
    case 'rare': return '#00cc44'; case 'uncommon': return '#cccc00';  
    default: return '#888888';          
  }
}

// ==========================================
// WATER BIOME CHECKER
// ==========================================
function checkNearbyWater(lat, lng) {
    if (Date.now() - lastWaterCheckTime < 60000) return;
    lastWaterCheckTime = Date.now();
    const query = `[out:json][timeout:5];(way["natural"="water"](around:150, ${lat}, ${lng});way["waterway"](around:150, ${lat}, ${lng});way["natural"="coastline"](around:150, ${lat}, ${lng}););out count;`;
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => { const total = (data.elements && data.elements[0]) ? Number(data.elements[0].tags.total) : 0; isNearWater = total > 0; })
        .catch(err => { isNearWater = false; });
}

// ==========================================
// MAP VFX ANIMATIONS
// ==========================================
window.injectAnimationStyles = function() {
    if (document.getElementById('mapSpriteAnimations')) return;
    const style = document.createElement('style');
    style.id = 'mapSpriteAnimations';
    style.innerHTML = `
        @keyframes pulseRing { 0% { transform: scale(0.5); opacity: 1; border-width: 3px; } 100% { transform: scale(2.2); opacity: 0; border-width: 1px; } }
        .spawn-ring { position: absolute; bottom: 25px; left: 50%; margin-left: -25px; width: 50px; height: 16px; border: 2px solid #ff0055; border-radius: 50%; box-shadow: 0 0 15px #ff0055, inset 0 0 10px #ff0055; animation: pulseRing 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; z-index: 1; }
        .anim-stand { filter: drop-shadow(0px 5px 5px rgba(0,0,0,0.8)); z-index: 2; position: relative; transition: transform 0.2s; }
        .anim-stand:hover { transform: scale(1.1); filter: drop-shadow(0px 0px 10px #ff0055); }
        @keyframes smoothHover { 0%, 100% { transform: translateY(0px); filter: drop-shadow(0 10px 6px rgba(0,0,0,0.6)); } 50% { transform: translateY(-16px); filter: drop-shadow(0 25px 15px rgba(0,0,0,0.3)); } }
        .anim-hover { animation: smoothHover 3.5s ease-in-out infinite; z-index: 2; position: relative; }
    `;
    document.head.appendChild(style);
};
window.injectAnimationStyles();

// ==========================================
// TRUE FIRST-PERSON COMBAT ENGINE
// ==========================================
function injectBattleStyles() {
    if (document.getElementById('battleDynamicStyles')) return;
    let style = document.createElement('style');
    style.id = 'battleDynamicStyles';
    style.innerHTML = `
        #battleOverlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: radial-gradient(circle at center, #2a0845 0%, #000000 100%);
            z-index: 999999; display: none; flex-direction: column; align-items: center; justify-content: space-between;
            font-family: monospace; color: white; user-select: none; overflow: hidden; transition: box-shadow 0.1s;
        }
        @keyframes monsterHover { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .monster-sprite { height: 40vh; max-width: 90vw; object-fit: contain; animation: monsterHover 3s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(255, 0, 50, 0.5)); transition: all 0.1s; z-index: 30; }
        .monster-hit { filter: brightness(0) invert(1) hue-rotate(0deg) drop-shadow(0 0 30px #ff0000) !important; transform: scale(0.95) !important; }
        
        @keyframes enemyLunge {
            0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 20px rgba(255,0,50,0.5)); }
            50% { transform: translateY(60px) scale(1.3); filter: drop-shadow(0 0 60px #ff0000) brightness(1.5); }
        }
        .enemy-attacking { animation: enemyLunge 0.3s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }

        @keyframes slashEffect { 0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); opacity: 1; } 50% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 1; filter: brightness(2); } 100% { opacity: 0; } }
        .slash-fx { position: absolute; top: 30%; left: 25%; width: 50%; height: 20px; background: white; box-shadow: 0 0 20px #ff0055, 0 0 40px #ff0055; transform: rotate(-25deg); pointer-events: none; opacity: 0; z-index: 40;}
        .slash-active { animation: slashEffect 0.25s ease-out forwards; }
        
        @keyframes screenShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-15px) rotate(-2deg); } 75% { transform: translateX(15px) rotate(2deg); } }
        .shake-active { animation: screenShake 0.2s ease-in-out; }
        
        .battle-ui { width: 100%; padding: 30px; background: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)); display: flex; justify-content: center; align-items: flex-end; gap: 30px; box-sizing: border-box; z-index: 60; position: relative;}
        
        .attack-btn { background: #111; color: #ff0055; font-family: monospace; font-size: 2rem; font-weight: bold; border: 2px solid #ff0055; border-radius: 15px; width: 220px; height: 80px; cursor: pointer; box-shadow: 0 0 15px rgba(255, 0, 85, 0.4); transition: all 0.2s; display: flex; align-items: center; justify-content: center; text-shadow: 0 0 10px #ff0055; z-index: 70;}
        .attack-btn:active:not(:disabled) { transform: scale(0.95); box-shadow: 0 0 40px rgba(255, 0, 85, 0.9); background: #ff0055; color: #111; }
        .attack-btn:disabled { opacity: 0.3; filter: grayscale(1); cursor: not-allowed; border-color: #555; color: #555; box-shadow: none; text-shadow: none; }
        
        @keyframes fireFlicker {
            0%   { filter: drop-shadow(-10px 10px 20px rgba(255, 50, 0, 0.5)) brightness(1); }
            50%  { filter: drop-shadow(-15px 15px 50px rgba(255, 120, 0, 0.9)) brightness(1.25) contrast(1.1); }
            100% { filter: drop-shadow(-10px 10px 20px rgba(255, 50, 0, 0.5)) brightness(1); }
        }

        @keyframes weaponIdle {
            0%, 100% { transform: rotate(-15deg) translateY(0px) scale(1); }
            50%      { transform: rotate(-12deg) translateY(-20px) scale(1.02); }
        }

        .fp-weapon {
            position: absolute;
            bottom: 12vh; 
            right: 15vw; 
            height: 55vh; 
            max-width: 50vw;
            object-fit: contain;
            transform-origin: center 90%; 
            z-index: 50; 
            pointer-events: none; 
            animation: weaponIdle 2.5s ease-in-out infinite, fireFlicker 0.15s infinite; 
        }
        
        @keyframes fpMeleeSwing {
            0%   { transform: rotate(-15deg) translateY(0px); }
            20%  { transform: rotate(20deg) translateX(5vw) translateY(5vh); } 
            40%  { transform: rotate(-85deg) translateX(-45vw) translateY(5vh) scale(1.2); } 
            100% { transform: rotate(-15deg) translateY(0px); } 
        }
        
        .wpn-swing { animation: fpMeleeSwing 0.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards, fireFlicker 0.15s infinite !important; }

        /* PLAYER HP UI */
        .player-hp-container {
            position: absolute;
            bottom: 110px;
            width: 100%;
            display: flex;
            justify-content: center;
            z-index: 60;
        }
        .player-hp-box {
            width: 350px;
            background: rgba(0,0,0,0.85);
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #444;
        }
    `;
    document.head.appendChild(style);
}
injectBattleStyles();

function buildBattleScreen() {
    if (document.getElementById('battleOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'battleOverlay';
    overlay.innerHTML = `
        <div style="margin-top: 50px; text-align: center; z-index: 10;">
            <div id="battleMonsterLvl" style="font-size: 0.8rem; font-weight: bold; letter-spacing: 2px;"></div>
            <h1 id="battleMonsterName" style="color: #ff0055; text-shadow: 0 0 15px #ff0055; margin: 5px 0;"></h1>
            <div style="width: 250px; height: 15px; background: #222; border: 2px solid #555; margin: 10px auto; border-radius: 8px; overflow: hidden;">
                <div id="battleMonsterHp" style="width: 100%; height: 100%; background: linear-gradient(90deg, #ff0055, #ffaa00); transition: width 0.15s;"></div>
            </div>
            <div style="font-size: 0.8rem; color: #ccc;"><span id="battleMonsterHpText"></span> / <span id="battleMonsterMaxHpText"></span> HP</div>
        </div>
        
        <div style="position: relative; width: 100%; text-align: center; flex-grow: 1; display: flex; align-items: center; justify-content: center;">
            <img id="battleMonsterImg" class="monster-sprite" src="">
            <div id="slashEffect" class="slash-fx"></div>
        </div>
        
        <!-- MASSIVE FIRST PERSON WEAPON OVERLAY (DYNAMIC) -->
        <img id="battleWeaponImg" class="fp-weapon" src="" alt="Weapon">
        
        <!-- PLAYER HP BAR -->
        <div class="player-hp-container">
            <div class="player-hp-box">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; color: #00ff80;">
                    <span>HUNTER VITALITY</span>
                    <span id="battlePlayerHpText"></span>
                </div>
                <div style="width: 100%; height: 12px; background: #111; border-radius: 6px; overflow: hidden;">
                    <div id="battlePlayerHp" style="width: 100%; height: 100%; background: #00ff80; transition: width 0.15s;"></div>
                </div>
            </div>
        </div>

        <div class="battle-ui">
            <button onclick="fleeBattle()" style="padding: 15px 30px; background: #222; color: #aaa; border: 1px solid #555; border-radius: 12px; cursor: pointer; font-family: monospace; font-size: 1.2rem; font-weight: bold; z-index: 70;">FLEE</button>
            <button id="strikeBtn" class="attack-btn" onclick="executeTurnBasedCombat()">STRIKE</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

window.startBattle = function(spawnId, name, imageUrl, level, rarity) {
    const maxSlots = window.playerData?.maxInventorySlots || 100;
    if ((window.playerData?.inventory?.length || 0) >= maxSlots) {
        alert(`Vault is full! Clear some space first.`);
        return;
    }

    buildBattleScreen();
    window.currentBattleEntry = spawnedCreatures.find(c => c.id === spawnId) || null;

    // --- DYNAMIC WEAPON RENDER & DAMAGE FIX ---
    let activeWeaponImage = 'gear/rusty.png'; // Fallback
    let weaponAtk = 5; // Default absolute minimum if unarmed
    
    if (window.playerData && window.playerData.equipped && window.playerData.equipped.weapon) {
        let weapons = (typeof weaponDatabase !== 'undefined') ? weaponDatabase : (window.gameWeapons || []);
        let wpn = weapons.find(w => w.id === window.playerData.equipped.weapon);
        if (wpn) {
            if (wpn.image) activeWeaponImage = wpn.image;
            // Get the weapon's exact damage, stripping out any hidden buffs!
            weaponAtk = Number(wpn.atk || wpn.attack || wpn.damage || 5); 
        }
    }
    
    document.getElementById('battleWeaponImg').src = activeWeaponImage;

    // Math for Stats
    const enemyMaxHp = 50 + (level * 15);
    const pLevel = window.playerData?.accountLevel || 1;
    
    // FORCE the math right here to exactly match your Hunter Profile Screen
    const finalPlayerMaxHp = 100 + (pLevel * 15); 
    const finalPlayerAtk = weaponAtk; // COMPLETELY REMOVED THE SECRET +15 BUFF
    const finalPlayerDef = pLevel * 2;

    window.battleData = {
        spawnId, name, image: imageUrl, level, rarity,
        enemyMaxHp: enemyMaxHp, enemyHp: enemyMaxHp,
        enemyAtk: 5 + (level * 4), 
        playerMaxHp: finalPlayerMaxHp, playerHp: finalPlayerMaxHp,
        playerAtk: finalPlayerAtk, 
        playerDef: finalPlayerDef, 
        isOver: false
    };

    const rarityCol = getRarityColor(rarity);
    document.getElementById('battleMonsterLvl').innerText = `LVL ${level} ${rarity.toUpperCase()}`;
    document.getElementById('battleMonsterLvl').style.color = rarityCol;
    
    document.getElementById('battleMonsterName').innerText = name.toUpperCase();
    document.getElementById('battleMonsterName').style.color = '#fff';
    document.getElementById('battleMonsterName').style.textShadow = `0 0 15px ${rarityCol}`;
    
    document.getElementById('battleMonsterImg').src = imageUrl;
    
    document.getElementById('battleMonsterHp').style.width = '100%';
    document.getElementById('battleMonsterHpText').innerText = enemyMaxHp;
    document.getElementById('battleMonsterMaxHpText').innerText = enemyMaxHp;

    document.getElementById('battlePlayerHp').style.width = '100%';
    document.getElementById('battlePlayerHpText').innerText = `${finalPlayerMaxHp} / ${finalPlayerMaxHp}`;
    
    const strikeBtn = document.getElementById('strikeBtn');
    if (strikeBtn) strikeBtn.disabled = false;

    document.getElementById('battleOverlay').style.display = 'flex';
};

// THE TURN-BASED COMBAT MANAGER
window.executeTurnBasedCombat = function() {
    const data = window.battleData;
    if (!data || data.isOver) return;

    const strikeBtn = document.getElementById('strikeBtn');
    if (strikeBtn) strikeBtn.disabled = true;

    // --- PHASE 1: PLAYER ATTACKS ---
    const overlay = document.getElementById('battleOverlay');
    const monster = document.getElementById('battleMonsterImg');
    const slash = document.getElementById('slashEffect');
    const weapon = document.getElementById('battleWeaponImg');

    slash.classList.remove('slash-active');
    weapon.classList.remove('wpn-swing');
    void slash.offsetWidth; 
    slash.classList.add('slash-active');
    weapon.classList.add('wpn-swing');
    
    overlay.classList.add('shake-active');
    monster.classList.add('monster-hit');

    setTimeout(() => {
        overlay.classList.remove('shake-active');
        monster.classList.remove('monster-hit');
    }, 200);

    if (window.gameAudio && typeof window.gameAudio.playHit === 'function') window.gameAudio.playHit();

    // Player deals exact weapon damage (variance is just 0.9x to 1.1x so it's not identical every hit)
    const variance = (Math.random() * 0.2) + 0.9; 
    data.enemyHp -= Math.floor(data.playerAtk * variance);
    if (data.enemyHp < 0) data.enemyHp = 0;

    const eHpPercent = (data.enemyHp / data.enemyMaxHp) * 100;
    document.getElementById('battleMonsterHp').style.width = eHpPercent + '%';
    document.getElementById('battleMonsterHpText').innerText = Math.ceil(data.enemyHp);

    if (data.enemyHp <= 0) {
        data.isOver = true;
        monster.style.transition = 'all 0.5s ease-in';
        monster.style.transform = 'scale(0) rotate(180deg)';
        monster.style.opacity = '0';

        setTimeout(() => {
            document.getElementById('battleOverlay').style.display = 'none';
            monster.style.transform = 'none'; 
            monster.style.opacity = '1';
            finalizeCapture(data);
        }, 600);
        return; 
    }

    // --- PHASE 2: MONSTER ATTACKS BACK ---
    setTimeout(() => {
        if (data.isOver) return;

        if (monster) {
            monster.classList.remove('enemy-attacking');
            void monster.offsetWidth;
            monster.classList.add('enemy-attacking');
        }
        
        if (overlay) {
            overlay.style.boxShadow = "inset 0 0 150px rgba(255,0,0,0.8)";
            setTimeout(() => { if(overlay) overlay.style.boxShadow = "none"; }, 200);
        }

        let dmg = Math.max(1, data.enemyAtk - Math.floor(data.playerDef * 0.3));
        dmg = Math.floor(dmg * ((Math.random() * 0.4) + 0.8)); 
        
        data.playerHp -= dmg;
        if (data.playerHp < 0) data.playerHp = 0;

        const pPercent = (data.playerHp / data.playerMaxHp) * 100;
        document.getElementById('battlePlayerHp').style.width = pPercent + '%';
        document.getElementById('battlePlayerHpText').innerText = `${data.playerHp} / ${data.playerMaxHp}`;

        if (data.playerHp <= 0) {
            data.isOver = true;
            setTimeout(() => {
                alert(`YOU DIED! The Level ${data.level} ${data.name} struck you down. Upgrade your armor in the Vault!`);
                fleeBattle();
            }, 300);
        } else {
            if (strikeBtn) strikeBtn.disabled = false;
        }

    }, 1000); 
};

window.fleeBattle = function() {
    document.getElementById('battleOverlay').style.display = 'none';
    window.currentBattleEntry = null;
};

function finalizeCapture(data) {
    if (typeof playerData !== 'undefined') {
        // Roll the dice! 0.02 means a 2% (1-in-50) chance to be Shiny
        const isShiny = Math.random() < 0.02; 

        const caughtEntity = {
            name: data.name, rarity: data.rarity, image: data.image, level: data.level,
            quality: 85, maxHp: data.enemyMaxHp, hp: data.enemyMaxHp, currentHp: data.enemyMaxHp,
            atk: 15 + (data.level * 3), def: 10 + (data.level * 2), fainted: false,
            shiny: isShiny
        };

        if (!playerData.inventory) playerData.inventory = [];
        playerData.inventory.push(caughtEntity);
        if (typeof window.addAccountXp === 'function') window.addAccountXp(20);
        
        let deadSpawns = JSON.parse(localStorage.getItem('deadSpawns') || '[]');
        deadSpawns.push(data.spawnId);
        localStorage.setItem('deadSpawns', JSON.stringify(deadSpawns));
        
        if (typeof window.saveGameData === 'function') window.saveGameData();

        if (isShiny) {
            alert(`✨ CRITICAL CAPTURE! You caught a SHINY Lvl ${data.level} ${data.name}! ✨`);
        } else {
            alert(`SLAIN! You captured the essence of the Lvl ${data.level} ${data.name}!`);
        }
    }

    if (window.currentBattleEntry && window.currentBattleEntry.marker) {
        window.currentBattleEntry.marker.remove();
        if (typeof map !== 'undefined' && map) map.removeLayer(window.currentBattleEntry.marker);
        spawnedCreatures = spawnedCreatures.filter(c => c.id !== data.spawnId);
        window.activeCreatures = spawnedCreatures;
    }
    
    window.currentBattleEntry = null;
}

// ==========================================
// MAP SPAWN GENERATION
// ==========================================
function spawnSingleCreature(spawnId, lat, lng, template, level) {
  if (typeof L === 'undefined' || typeof map === 'undefined' || !map) return;

  const floaters = ["Vampire", "Siren", "Harpy", "Banshee", "Tengu", "Griffin", "Thunderbird", "Roc", "Kraken"];
  let animationClass = floaters.includes(template.name) ? "anim-hover" : "anim-stand";
  const safeName = template.name.replace(/'/g, "\\'");

  const cardHtml = `
    <div style="position: relative; transform-origin: bottom center; display: flex; flex-direction: column; align-items: center; cursor: pointer; pointer-events: none;">
      <div class="spawn-ring"></div>
      <img class="${animationClass}" src="${template.image}" style="width: 90px; height: 110px; object-fit: contain;" onerror="this.style.display='none';">
      <div style="background: rgba(10,10,20,0.85); border: 1px solid #ff0055; color: #ff0055; font-size: 9px; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-top: -5px; position: relative; z-index: 3;">
        ${template.name} (Lvl ${level})
      </div>
    </div>
  `;

  const customIcon = L.divIcon({ className: '', html: cardHtml, iconSize: [100, 130], iconAnchor: [50, 130] });
  const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

  marker.on('click', () => {
      startBattle(spawnId, safeName, template.image, level, template.rarity || 'common');
  });

  spawnedCreatures.push({ id: spawnId, marker, data: template, lat: lat, lng: lng });
  window.activeCreatures = spawnedCreatures;
}

function performSpawnCycle() {
  let currentPos = null;
  if (typeof playerLat !== 'undefined' && playerLat !== null && typeof playerLng !== 'undefined' && playerLng !== null) currentPos = { lat: playerLat, lng: playerLng };
  else if (typeof map !== 'undefined' && map && typeof map.getCenter === 'function') {
    try { const center = map.getCenter(); if (center && center.lat && center.lng) currentPos = { lat: center.lat, lng: center.lng }; } catch(e) {}
  }
  if (!currentPos || typeof map === 'undefined' || !map) return;
  
  checkNearbyWater(currentPos.lat, currentPos.lng);

  const CELL_SIZE = 0.00025; 
  const EPOCH_MS = 15 * 60 * 1000; 
  
  const gridX = Math.floor(currentPos.lat / CELL_SIZE);
  const gridY = Math.floor(currentPos.lng / CELL_SIZE);
  const timeEpoch = Math.floor(Date.now() / EPOCH_MS);

  let activeGridIds = [];
  let deadSpawns = JSON.parse(localStorage.getItem('deadSpawns') || '[]');

  for(let dx = -3; dx <= 3; dx++) {
      for(let dy = -3; dy <= 3; dy++) {
          const gx = gridX + dx;
          const gy = gridY + dy;
          const cellId = `spawn_${gx}_${gy}_${timeEpoch}`;
          activeGridIds.push(cellId);

          if(deadSpawns.includes(cellId)) continue; 
          if(spawnedCreatures.find(c => c.id === cellId)) continue; 

          let rng = new SeededPRNG(cellId);
          if(rng.next() > 0.20) continue;

          let exactLat = (gx * CELL_SIZE) + (rng.next() * CELL_SIZE);
          let exactLng = (gy * CELL_SIZE) + (rng.next() * CELL_SIZE);

          let template = getSeededBrainrot(rng);
          let level = getSeededLevel(rng);

          spawnSingleCreature(cellId, exactLat, exactLng, template, level);
      }
  }

  spawnedCreatures = spawnedCreatures.filter(creature => {
      if(!activeGridIds.includes(creature.id)) {
           if (creature.marker) { creature.marker.remove(); map.removeLayer(creature.marker); }
           return false;
      }
      return true;
  });
}

function initSpawner() {
  if (spawnerInterval) clearInterval(spawnerInterval);
  performSpawnCycle();
  spawnerInterval = setInterval(performSpawnCycle, 3500); 
}

if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(initSpawner, 500);
else document.addEventListener('DOMContentLoaded', () => setTimeout(initSpawner, 500));