// spawner.js - Dynamic GPS-Based Paranormal Entity Spawner (Hollywood VFX Edition)

let spawnedCreatures = [];
let lastSpawnLat = null;
let lastSpawnLng = null;

window.activeCreatures = spawnedCreatures;
window.currentBattleEntry = null;

// ==========================================
// 🎬 POKEMON GO STYLE SPAWN RINGS & HOVERING
// ==========================================
window.injectAnimationStyles = function() {
    if (document.getElementById('mapSpriteAnimations')) return;
    const style = document.createElement('style');
    style.id = 'mapSpriteAnimations';
    style.innerHTML = `
        @keyframes pulseRing {
            0% { transform: scale(0.5); opacity: 1; border-width: 3px; }
            100% { transform: scale(2.2); opacity: 0; border-width: 1px; }
        }
        .spawn-ring {
            position: absolute; bottom: 25px; left: 50%;
            margin-left: -25px; width: 50px; height: 16px; 
            border: 2px solid #ff0055; border-radius: 50%;
            box-shadow: 0 0 15px #ff0055, inset 0 0 10px #ff0055;
            animation: pulseRing 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
            z-index: 1;
        }
        .anim-stand {
            filter: drop-shadow(0px 5px 5px rgba(0,0,0,0.8));
            z-index: 2; position: relative;
        }
        @keyframes smoothHover {
            0%, 100% { transform: translateY(0px); filter: drop-shadow(0 10px 6px rgba(0,0,0,0.6)); }
            50% { transform: translateY(-16px); filter: drop-shadow(0 25px 15px rgba(0,0,0,0.3)); }
        }
        .anim-hover {
            animation: smoothHover 3.5s ease-in-out infinite;
            z-index: 2; position: relative;
        }
        @keyframes battleFloat {
            0%, 100% { transform: translate(-50%, -50%) scale(1.3); }
            50% { transform: translate(-50%, -65px) scale(1.3); }
        }
        .fullscreen-vampire-float {
            animation: battleFloat 3s ease-in-out infinite;
        }
        @keyframes wandCastRecoil {
            0%, 100% { transform: translateX(-50%) rotate(0deg) scale(1); }
            50% { transform: translateX(-50%) translateY(-15px) rotate(-10deg) scale(1.15); filter: drop-shadow(0 0 20px #00ff80); }
        }
        .wand-active-anim {
            animation: wandCastRecoil 0.12s ease-in-out !important;
        }
        @keyframes shockwaveExpand {
            0% { transform: translate(-50%, 50%) scale(0); opacity: 1; border-width: 30px; }
            100% { transform: translate(-50%, 50%) scale(1); opacity: 0; border-width: 0px; }
        }
        .vfx-shockwave {
            position: absolute; bottom: 120px; left: 50%;
            width: 400px; height: 400px; border-radius: 50%;
            border: 30px solid #00ff80; 
            box-shadow: 0 0 50px #00ffff, inset 0 0 50px #00ff80;
            animation: shockwaveExpand 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            pointer-events: none; z-index: 100;
        }
        /* 💨 NEW ESCAPE ANIMATION */
        @keyframes creatureFlee {
            0% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; filter: brightness(2) drop-shadow(0 0 30px #ff0055); }
            15% { transform: translate(-50%, -40%) scale(1.5); opacity: 1; filter: brightness(3) drop-shadow(0 0 50px #ff0055); }
            100% { transform: translate(-50%, -200%) scale(0.3); opacity: 0; filter: brightness(0.2); }
        }
        .anim-flee {
            animation: creatureFlee 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
            z-index: 20 !important;
        }
    `;
    document.head.appendChild(style);
};
window.injectAnimationStyles();

function ensureSpellStyles() {
  let style = document.getElementById('forcedCinematicStyles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'forcedCinematicStyles';
    document.head.appendChild(style);
  }
}
ensureSpellStyles();

function getRandomLevel() {
  const roll = Math.random();
  if (roll < 0.60) return 1;
  else if (roll < 0.88) return Math.floor(Math.random() * 9) + 2;
  else return Math.floor(Math.random() * 10) + 11;
}

// ==========================================
// 🎟️ THE BRUTAL HARDCORE LOTTERY SYSTEM 🎟️
// ==========================================
function getRandomBrainrot() {
  if (typeof paranormalSpawns === 'undefined' || !Array.isArray(paranormalSpawns)) {
    return { name: "Vampire", rarity: "common", reward: 3, image: "brainrots/Vampire.png" };
  }
  
  const validCharacters = paranormalSpawns.filter(char => char && char.image && char.image.trim() !== "");
  if (validCharacters.length === 0) {
    return { name: "Vampire", rarity: "common", reward: 3, image: "brainrots/Vampire.png" };
  }

  const getWeight = (rarity) => {
    switch((rarity || '').toLowerCase()) {
      case 'common': return 1000000; 
      case 'uncommon': return 200000; 
      case 'rare': return 5000;       
      case 'epic': return 25;         
      case 'secret': return 1;        
      default: return 1000000;
    }
  };

  let totalWeight = 0;
  validCharacters.forEach(char => {
    totalWeight += getWeight(char.rarity);
  });

  let randomNum = Math.random() * totalWeight;

  for (let i = 0; i < validCharacters.length; i++) {
    randomNum -= getWeight(validCharacters[i].rarity);
    if (randomNum <= 0) {
      return validCharacters[i];
    }
  }
  return validCharacters[0]; 
}

function getRarityColor(rarity) {
  switch ((rarity || '').toLowerCase()) {
    case 'og': return '#ffd700';        
    case 'secret': return '#ff00ea';    
    case 'legendary': return '#ffaa00'; 
    case 'epic': return '#0088ff';      
    case 'rare': return '#00cc44';      
    case 'uncommon': return '#cccc00';  
    default: return '#888888';          
  }
}

// ==========================================
// FULL-SCREEN WAND SPELLCASTING EXPERIENCE
// ==========================================
window.startEncounter = function(spawnId, name, rarity, reward, imageUrl, level, maxHp, isShiny) {
  const maxSlots = (window.playerData && window.playerData.maxInventorySlots) ? window.playerData.maxInventorySlots : 100;
  const currentSlots = (window.playerData && window.playerData.inventory) ? window.playerData.inventory.length : 0;
  if (currentSlots >= maxSlots) {
    if (typeof showGameToast === 'function') showGameToast(`🚨 Inventory is full (${currentSlots} / ${maxSlots})!`);
    return;
  }

  const matchedEntry = spawnedCreatures.find(c => c.id === spawnId);
  window.currentBattleEntry = matchedEntry || null;

  let arOverlay = document.getElementById('arSpellOverlay');
  if (!arOverlay) {
    arOverlay = document.createElement('div');
    arOverlay.id = 'arSpellOverlay';
    arOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: radial-gradient(circle, rgba(20,10,35,0.96) 0%, rgba(5,2,10,0.99) 100%);
      z-index: 99999999; display: flex; flex-direction: column; align-items: center;
      justify-content: space-between; font-family: monospace; color: #fff; padding: 30px 20px;
      box-sizing: border-box; overflow: hidden; user-select: none;
    `;
    document.body.appendChild(arOverlay);
  }

  if (window.arSpellData && window.arSpellData.timerInterval) {
    clearInterval(window.arSpellData.timerInterval);
  }

  let tapsNeeded = 5;
  let timeGiven = 8;
  
  switch((rarity || '').toLowerCase()) {
      case 'common': tapsNeeded = 5; timeGiven = 8; break;
      case 'uncommon': tapsNeeded = 12; timeGiven = 8; break;
      case 'rare': tapsNeeded = 25; timeGiven = 10; break;
      case 'epic': tapsNeeded = 45; timeGiven = 12; break;
      case 'secret': tapsNeeded = 75; timeGiven = 15; break;
  }

  window.arSpellData = {
    name, rarity: rarity || 'common', reward: Number(reward) || 3, image: imageUrl,
    level: Number(level) || 1, maxHp: Number(maxHp) || 60, shiny: isShiny === 'true' || isShiny === true,
    timeLeft: timeGiven, requiredTaps: tapsNeeded, currentTaps: 0, isCapturing: false, timerInterval: null,
    willCatch: false // Escape system logic
  };

  renderAROverlay();
  startARTimer();
  arOverlay.style.display = 'flex';
};

function renderAROverlay() {
  const overlay = document.getElementById('arSpellOverlay');
  if (!overlay) return;
  const data = window.arSpellData;
  const progress = Math.min(100, Math.floor((data.currentTaps / data.requiredTaps) * 100));
  const rarityCol = getRarityColor(data.rarity);

  overlay.innerHTML = `
    <div id="arTopHud" style="text-align: center; width: 100%; max-width: 450px; z-index: 10; transition: opacity 0.3s;">
      <div style="font-size: 0.8rem; color: ${rarityCol}; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 2px;">${data.rarity} ENCOUNTER</div>
      <h2 style="margin: 0 0 4px 0; color: #fff; font-size: 1.6rem; text-shadow: 0 0 15px ${rarityCol};">${data.name}</h2>
      <div style="font-size: 0.9rem; color: #aaa; margin-bottom: 12px;">Level ${data.level}</div>
      <div style="width: 100%; height: 16px; background: rgba(0,0,0,0.85); border-radius: 8px; overflow: hidden; border: 2px solid #555;">
        <div id="arProgressBar" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #00ff80, #00ffff); transition: width 0.05s;"></div>
      </div>
      <div id="arTimerText" style="font-size: 0.85rem; color: #ffcc00; margin-top: 6px; font-weight: bold;">⏱️ Time Remaining: ${data.timeLeft}s</div>
    </div>
    <div id="arCenterArena" style="position: relative; flex: 1; width: 100%;">
      <img id="arTargetVampire" src="${data.image}" class="fullscreen-vampire-float" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-height: 280px; max-width: 280px; object-fit: contain; filter: drop-shadow(0 15px 30px rgba(0,0,0,0.95)); z-index: 5;" />
    </div>
    <div id="arControlsArea" style="width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 20; padding-bottom: 20px;">
      <div id="visualWand" style="position: absolute; bottom: 85px; left: 50%; transform: translateX(-50%); font-size: 4rem; filter: drop-shadow(0 0 20px #00ff80); pointer-events: none; transition: transform 0.1s; z-index: 30;">🪄</div>
      <div id="arButtonContainer" style="display: flex; gap: 12px; width: 100%;">
        <button id="arCastBtn" onclick="registerARTap()" style="flex: 2; background: linear-gradient(135deg, #00ff80, #0088ff); color: #000; border: none; padding: 18px; font-weight: bold; border-radius: 14px; cursor: pointer; font-size: 1.2rem; text-transform: uppercase;">⚡ RAPID CAST!</button>
        <button onclick="cancelARCapture()" style="flex: 1; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid #555; padding: 18px; font-weight: bold; border-radius: 14px; cursor: pointer;">FLEE</button>
      </div>
    </div>
  `;
}

window.registerARTap = function() {
  const data = window.arSpellData;
  if (!data || data.timeLeft <= 0 || data.isCapturing) return;

  data.currentTaps++;
  const progress = Math.min(100, Math.floor((data.currentTaps / data.requiredTaps) * 100));
  const bar = document.getElementById('arProgressBar');
  if (bar) bar.style.width = progress + '%';

  const wandEl = document.getElementById('visualWand');
  if (wandEl) {
    wandEl.classList.add('wand-active-anim');
    setTimeout(() => wandEl.classList.remove('wand-active-anim'), 120);
  }

  const arena = document.getElementById('arCenterArena');
  if (arena) {
    const beam = document.createElement('div');
    beam.style.cssText = `position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 8px; height: 40vh; background: linear-gradient(to top, #00ff80, #00ffff, transparent); box-shadow: 0 0 20px #00ff80; pointer-events: none; z-index: 2; opacity: 0.8; border-radius: 4px;`;
    document.getElementById('arControlsArea').appendChild(beam);
    setTimeout(() => beam.remove(), 150);
  }

  // 🎲 HARDCORE ESCAPE MATH 🎲
  if (data.currentTaps >= data.requiredTaps) {
    data.isCapturing = true;
    clearInterval(data.timerInterval);

    let wandLvl = (window.playerData && window.playerData.wandLevel) ? window.playerData.wandLevel : 1;
    let baseCatchRate = 50; 
    switch((data.rarity || '').toLowerCase()) {
        case 'uncommon': baseCatchRate = 35; break;
        case 'rare': baseCatchRate = 20; break;
        case 'epic': baseCatchRate = 10; break;
        case 'secret': baseCatchRate = 1; break;
    }
    
    let finalChance = baseCatchRate + ((wandLvl - 1) * 10);
    let roll = Math.random() * 100;
    
    console.log(`[CATCH MATH]: Target ${finalChance}% | Rolled ${roll.toFixed(1)}`);
    data.willCatch = roll < finalChance;

    const btnContainer = document.getElementById('arButtonContainer');
    if (btnContainer) btnContainer.style.display = 'none';
    document.getElementById('arTopHud').style.opacity = '0';
    document.getElementById('arSpellOverlay').style.background = '#020005'; 

    const vampireImg = document.getElementById('arTargetVampire');
    const wandImg = document.getElementById('visualWand');
    
    if (vampireImg && wandImg) {
      const vampRect = vampireImg.getBoundingClientRect();
      const wandRect = wandImg.getBoundingClientRect();
      const startX = vampRect.left + (vampRect.width / 2);
      const startY = vampRect.top + (vampRect.height / 2);
      const endX = wandRect.left + (wandRect.width / 2);
      const endY = wandRect.top + (wandRect.height / 2) - 30; 
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      vampireImg.classList.remove('fullscreen-vampire-float');
      vampireImg.style.transition = 'none';

      const vortex = document.createElement('div');
      vortex.style.cssText = `position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%) scale(0); width: 60px; height: 60px; background: #000; border-radius: 50%; box-shadow: 0 0 50px 20px #00ff80, 0 0 100px 50px #00ffff; z-index: 15; transition: transform 0.4s ease-out;`;
      document.getElementById('arControlsArea').appendChild(vortex);
      setTimeout(() => { vortex.style.transform = 'translateX(-50%) scale(1)'; }, 10);

      let startTime = null;
      
      function animateVFX(timestamp) {
        if (!startTime) startTime = timestamp;
        let elapsed = timestamp - startTime;
        let scaleX = 1.3, scaleY = 1.3, rot = 0, currentDeltaX = 0, currentDeltaY = 0;
        let brightness = 1, dropShadow = 15;

        if (elapsed < 500) {
          let shakeProgress = elapsed / 500;
          currentDeltaX = (Math.random() - 0.5) * 15; 
          currentDeltaY = (Math.random() - 0.5) * 15;
          brightness = 1 + (shakeProgress * 4); 
          dropShadow = 15 + (shakeProgress * 60);
        } else if (elapsed < 1100) {
          let suckProgress = (elapsed - 500) / 600;
          let easeIn = suckProgress * suckProgress * suckProgress; 
          currentDeltaX = deltaX * easeIn;
          currentDeltaY = deltaY * easeIn;
          scaleX = 1.3 - (1.25 * suckProgress); 
          scaleY = 1.3 + (1.5 * suckProgress) - (2.8 * easeIn); 
          rot = suckProgress * 1080; 
          brightness = 5;
          dropShadow = 80;
        } else {
          // TIME IS UP - PROCESS CATCH OR ESCAPE
          vortex.style.display = 'none';
          const shockwave = document.createElement('div');
          shockwave.className = 'vfx-shockwave';
          
          if (!data.willCatch) {
              // ❌ ESCAPE ANIMATION
              shockwave.style.borderColor = '#ff0033';
              shockwave.style.boxShadow = '0 0 50px #ff0055, inset 0 0 50px #ff0033';
              document.getElementById('arControlsArea').appendChild(shockwave);
              
              // The beast bursts back out and flees!
              vampireImg.style.transform = ''; // Clear inline styles
              vampireImg.style.filter = '';
              vampireImg.style.display = 'block';
              vampireImg.className = 'anim-flee'; // Apply new CSS keyframes
              
              setTimeout(() => {
                document.getElementById('arSpellOverlay').style.display = 'none';
                handleEscape(data);
              }, 900); // Wait for flee animation to finish
              
          } else {
              // ✨ SUCCESS CATCH
              vampireImg.style.display = 'none'; 
              document.getElementById('arControlsArea').appendChild(shockwave);
              
              setTimeout(() => {
                document.getElementById('arSpellOverlay').style.display = 'none';
                finalizeARCapture(data);
              }, 600);
          }
          return; 
        }

        vampireImg.style.transform = `translate(calc(-50% + ${currentDeltaX}px), calc(-50% + ${currentDeltaY}px)) scale(${scaleX}, ${scaleY}) rotate(${rot}deg)`;
        vampireImg.style.filter = `brightness(${brightness}) dropShadow(0 0 ${dropShadow}px #00ff80)`;
        requestAnimationFrame(animateVFX);
      }
      requestAnimationFrame(animateVFX);
    } else {
      document.getElementById('arSpellOverlay').style.display = 'none';
      if (data.willCatch) finalizeARCapture(data);
      else handleEscape(data);
    }
  }
};

function startARTimer() {
  const data = window.arSpellData;
  if (!data) return;
  if (data.timerInterval) clearInterval(data.timerInterval);

  data.timerInterval = setInterval(() => {
    if (data.isCapturing) return;
    data.timeLeft--;
    if (data.timeLeft <= 0) {
      clearInterval(data.timerInterval);
      document.getElementById('arSpellOverlay').style.display = 'none';
      if (typeof showGameToast === 'function') showGameToast("❌ The entity faded away... Time's up!");
      window.removeCapturedCreature();
    } else {
      const timerEl = document.getElementById('arTimerText');
      if (timerEl) timerEl.innerText = `⏱️ Time Remaining: ${data.timeLeft}s`;
    }
  }, 1000);
}

window.cancelARCapture = function() {
  const data = window.arSpellData;
  if (data && data.timerInterval) clearInterval(data.timerInterval);
  document.getElementById('arSpellOverlay').style.display = 'none';
};

// ❌ ESCAPE LOGIC
function handleEscape(data) {
  if (typeof window.removeCapturedCreature === 'function') window.removeCapturedCreature();
  if (typeof showGameToast === 'function') showGameToast(`💨 Oh no! The ${data.name} broke your spell and escaped! Upgrade your wand!`);
}

// ✨ SUCCESS LOGIC
function finalizeARCapture(data) {
  if (typeof playerData !== 'undefined') {
    let baseMaxHp = 60, baseAtk = 15, baseDef = 10;
    if (typeof paranormalSpawns !== 'undefined') {
        const dbEntry = paranormalSpawns.find(c => c.name === data.name);
        if (dbEntry) {
            baseMaxHp = dbEntry.baseHp || 60;
            baseAtk = dbEntry.baseAtk || 15;
            baseDef = dbEntry.baseDef || 10;
        }
    }

    const caughtEntity = {
      name: data.name, rarity: data.rarity, image: data.image, level: data.level,
      quality: 85, maxHp: baseMaxHp, hp: baseMaxHp, atk: baseAtk, def: baseDef,
      fainted: false, inGym: false
    };

    if (!playerData.inventory) playerData.inventory = [];
    playerData.inventory.push(caughtEntity);

    if (typeof window.addAccountXp === 'function') window.addAccountXp(20);
    if (typeof window.saveGameData === 'function') window.saveGameData();
  }

  if (typeof window.removeCapturedCreature === 'function') window.removeCapturedCreature();
  if (typeof showGameToast === 'function') showGameToast(`✨ Successfully captured Lvl ${data.level} ${data.name}!`);
}

// 🔥 BULLETPROOF MAP CLEANUP
window.removeCapturedCreature = function() {
  if (window.currentBattleEntry) {
    if (window.currentBattleEntry.marker) {
      window.currentBattleEntry.marker.remove();
      if (typeof map !== 'undefined' && map) {
          map.removeLayer(window.currentBattleEntry.marker);
      }
    }
    spawnedCreatures = spawnedCreatures.filter(c => c.id !== window.currentBattleEntry.id);
    window.activeCreatures = spawnedCreatures;
    window.currentBattleEntry = null;
  }
  
  if (typeof map !== 'undefined' && map && typeof map.closePopup === 'function') {
      map.closePopup();
  }
  document.querySelectorAll('.leaflet-popup').forEach(p => p.remove()); 
};

// ==========================================
// 🧬 APPLYING SPAWN RINGS TO THE MAP PINS 
// ==========================================
function spawnSingleCreature(lat, lng) {
  if (typeof L === 'undefined' || typeof map === 'undefined' || !map) return;

  const template = getRandomBrainrot();
  const level = getRandomLevel();
  
  const spawnId = 'spawn_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  
  const spawnLat = lat + (Math.random() - 0.5) * 0.0003;
  const spawnLng = lng + (Math.random() - 0.5) * 0.0003;

  const floaters = [
      "Vampire", "Siren", "Harpy", "Banshee", "Tengu", 
      "Griffin", "Thunderbird", "Roc", 
      "Basilisk", "Kraken", "Scylla", "Charybdis", "Grootslang",
      "Typhon", "Jörmungandr", "Tiamat", "Leviathan", "Bakunawa", "Vritra", "Apophis"
  ];

  let animationClass = "anim-stand";
  if (floaters.includes(template.name)) {
      animationClass = "anim-hover"; 
  }

  const cardHtml = `
    <div style="position: relative; transform-origin: bottom center; display: flex; flex-direction: column; align-items: center;">
      <div class="spawn-ring"></div>
      <img class="${animationClass}" src="${template.image}" style="width: 90px; height: 110px; object-fit: contain;" onerror="this.style.display='none';">
      <div style="background: rgba(10,10,20,0.85); border: 1px solid #ff0055; color: #ff0055; font-size: 9px; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-top: -5px; position: relative; z-index: 3;">
        ${template.name} (Lvl ${level})
      </div>
    </div>
  `;

  const customIcon = L.divIcon({ className: '', html: cardHtml, iconSize: [100, 130], iconAnchor: [50, 130] });
  const marker = L.marker([spawnLat, spawnLng], { icon: customIcon }).addTo(map);

  marker.bindPopup(`
    <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
      <b>${template.name}</b><br>
      <button onclick="startEncounter('${spawnId}', '${template.name.replace(/'/g, "\\'")}', '${template.rarity || 'common'}', '${template.reward || 3}', '${template.image}', ${level}, 60, false)" style="margin-top: 8px; background: #ff0055; color: white; border: none; padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer;">🪄 CAST SPELL</button>
    </div>
  `);

  spawnedCreatures.push({ id: spawnId, marker, data: template, lat: spawnLat, lng: spawnLng });
}

// ==========================================
// 🌲 ORGANIC WILDERNESS SPAWNING LOGIC 🌲
// ==========================================
function initSpawner() {
  setInterval(() => {
    let currentPos = null;
    if (typeof playerLat !== 'undefined' && typeof playerLat !== null) {
      currentPos = { lat: playerLat, lng: playerLng };
    } else if (typeof map !== 'undefined' && map && typeof map.getCenter === 'function') {
      const center = map.getCenter();
      currentPos = { lat: center.lat, lng: center.lng };
    }

    if (!currentPos || typeof map === 'undefined' || !map) return;

    spawnedCreatures = spawnedCreatures.filter(creature => {
      const distance = map.distance([currentPos.lat, currentPos.lng], [creature.lat, creature.lng]);
      if (distance > 70) { 
        if (creature.marker && typeof creature.marker.remove === 'function') {
          creature.marker.remove(); 
          if (typeof map !== 'undefined' && map) map.removeLayer(creature.marker);
        }
        return false; 
      }
      return true; 
    });

    if (spawnedCreatures.length < 6) {
        if (Math.random() < 0.40) return;
        const clusterSize = Math.floor(Math.random() * 3) + 1;
        const clusterLat = currentPos.lat + (Math.random() - 0.5) * 0.0006;
        const clusterLng = currentPos.lng + (Math.random() - 0.5) * 0.0006;
        for (let i = 0; i < clusterSize; i++) {
            if (spawnedCreatures.length >= 6) break; 
            spawnSingleCreature(clusterLat, clusterLng);
        }
        window.activeCreatures = spawnedCreatures;
    }
  }, 4000); 
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initSpawner, 2000);
});