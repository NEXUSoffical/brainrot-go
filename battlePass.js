// battlePass.js - 100-Level Progression & Reward System (Stripe Paid Pass)

if (typeof window.playerBattlePass === 'undefined') {
    window.playerBattlePass = {
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        claimedLevels: [],
        hasPaidPass: false // Unlocked via Stripe
    };
}

window.battlePassRewards = {};

function generateBattlePassRewards() {
    for (let i = 1; i <= 100; i++) {
        let type = 'currency';
        let name = '50 Braincoins';
        let icon = '🪙';
        let value = 50;

        if (i === 100) {
            type = 'og_rot';
            name = '👑 THE ULTIMATE OG GODFATHER ROT';
            icon = '🏆';
            value = 'og_godfather';
        } else if (i % 10 === 0) {
            type = 'legendary_rot';
            name = `Tier ${i/10} Legendary Rot`;
            icon = '👑';
            value = `legendary_${i}`;
        } else if (i % 5 === 0) {
            type = 'epic_rot';
            name = 'Epic Brainrot Fighter';
            icon = '⭐';
            value = `epic_${i}`;
        } else if (i % 2 === 0) {
            type = 'potions';
            name = '3x Health Potions';
            icon = '🧪';
            value = 3;
        }

        window.battlePassRewards[i] = { level: i, type, name, icon, value };
    }
}
generateBattlePassRewards();

function getXpRequirement(level) {
    if (level >= 100) return 999999;
    return Math.floor(1000 * Math.pow(1.045, level - 1));
}

// 💳 Purchase Battle Pass via Stripe
window.buyBattlePassStripe = async function() {
    try {
        alert("Opening secure Stripe checkout for Battle Pass...");

        const response = await fetch('https://brainrot-go.onrender.com/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                packageId: 'battle_pass',
                amount: 999, // $9.99
                username: (typeof playerData !== 'undefined' && playerData.username) ? playerData.username : "Guest"
            })
        });

        const session = await response.json();
        if (session.error) {
            alert("❌ Payment error: " + session.error);
            return;
        }

        if (session.url) {
            window.location.href = session.url;
        } else {
            alert("❌ Failed to retrieve checkout session URL.");
        }
    } catch (err) {
        console.error("Stripe Error:", err);
        alert("❌ Failed to connect to payment server.");
    }
};

window.openBattlePassModal = function() {
    let modal = document.getElementById('battlePassModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'battlePassModal';
        document.body.appendChild(modal);
    }

    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(5, 2, 10, 0.95) !important;
        z-index: 99999999 !important;
        display: flex !important;
        flex-direction: column !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
    `;

    let bp = window.playerBattlePass;

    // Check if player unlocked it via Stripe purchase
    if (!bp.hasPaidPass) {
        modal.innerHTML = `
            <div style="display: flex; justify-content: flex-end; width: 100%; margin-bottom: 20px;">
                <button onclick="document.getElementById('battlePassModal').remove()" style="background: #ff0055; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">CLOSE</button>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; max-width: 400px; margin: 0 auto;">
                <div style="font-size: 4rem; margin-bottom: 15px;">🏆</div>
                <h1 style="color: #ff0055; font-size: 1.8rem; margin-bottom: 10px;">SEASON 1 BATTLE PASS</h1>
                <p style="color: #ccc; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
                    Unlock all 100 tiers of epic rewards, legendary rots, and the Ultimate OG Godfather Rot!
                </p>
                <button onclick="window.buyBattlePassStripe()" style="background: linear-gradient(135deg, #ff0055, #ff5500); color: #fff; border: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; font-size: 1rem; cursor: pointer; font-family: monospace; box-shadow: 0 0 20px rgba(255,0,85,0.4); width: 100%;">
                    ⚡ UNLOCK PASS FOR $9.99
                </button>
            </div>
        `;
        return;
    }

    let currentXpGoal = getXpRequirement(bp.level);
    let progressPercent = Math.min(100, (bp.xp / currentXpGoal) * 100);

    let levelsHtml = '';
    for (let i = 1; i <= 100; i++) {
        let rew = window.battlePassRewards[i];
        let isUnlocked = bp.level >= i;
        let isClaimed = bp.claimedLevels.includes(i);

        let statusBg = isClaimed ? '#222' : (isUnlocked ? '#00ff55' : '#333');
        let statusColor = isClaimed ? '#777' : (isUnlocked ? '#000' : '#888');
        let statusText = isClaimed ? 'CLAIMED' : (isUnlocked ? 'CLAIM!' : 'LOCKED');
        let isOgTier = i === 100;

        levelsHtml += `
            <div style="background: ${isOgTier ? '#2a0815' : '#110820'}; border: 2px solid ${isOgTier ? '#ff0055' : (isUnlocked ? '#00ff55' : '#444')}; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: ${isOgTier ? '#ff0055' : '#00ff55'}; width: 45px;">Lvl ${i}</div>
                    <div style="font-size: 1.5rem;">${rew.icon}</div>
                    <div>
                        <div style="font-size: 0.85rem; font-weight: bold; color: ${isOgTier ? '#ff0055' : '#fff'};">${rew.name}</div>
                        <div style="font-size: 0.65rem; color: #aaa;">${isOgTier ? 'Ultimate Flex Reward' : 'Tier reward'}</div>
                    </div>
                </div>
                <button onclick="window.claimBattlePassReward(${i})" ${!isUnlocked || isClaimed ? 'disabled' : ''} style="background: ${statusBg}; color: ${statusColor}; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: ${isUnlocked && !isClaimed ? 'pointer' : 'not-allowed'}; font-family: monospace; font-size: 0.75rem;">
                    ${statusText}
                </button>
            </div>
        `;
    }

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>
                <h1 style="color: #00ff55; font-size: 1.5rem; margin: 0;">🏆 SEASON 1 BATTLE PASS</h1>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">Level ${bp.level} | XP: ${bp.xp} / ${currentXpGoal} | <span style="color:#00ff55;">Pass Unlocked ✅</span></p>
            </div>
            <button onclick="document.getElementById('battlePassModal').remove()" style="background: #ff0055; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">CLOSE</button>
        </div>

        <div style="width: 100%; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid #444; margin-bottom: 15px;">
            <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #00ff55, #00ffee); transition: width 0.3s;"></div>
        </div>

        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; padding-right: 5px;">
            ${levelsHtml}
        </div>
    `;
};

window.claimBattlePassReward = function(level) {
    let bp = window.playerBattlePass;
    if (bp.level < level || bp.claimedLevels.includes(level)) return;

    bp.claimedLevels.push(level);
    let rew = window.battlePassRewards[level];
    
    alert(`🎉 Successfully claimed Level ${level} reward: ${rew.name}!`);
    
    if (rew.type === 'currency' && typeof playerData !== 'undefined') {
        playerData.coins = (playerData.coins || 0) + rew.value;
    } else if (rew.type === 'og_rot' && typeof playerData !== 'undefined' && typeof brainrotCharacters !== 'undefined') {
        const ogChar = brainrotCharacters.find(c => (c.rarity || '').toLowerCase() === 'og') || brainrotCharacters[0];
        playerData.inventory.push({
            name: ogChar.name,
            rarity: 'og',
            level: 50,
            image: ogChar.image,
            hp: ogChar.baseHp * 4,
            maxHp: ogChar.baseHp * 4,
            atk: ogChar.baseAtk * 4,
            def: ogChar.baseDef * 4
        });
    }

    window.openBattlePassModal();
};

window.addBattlePassXP = function(amount) {
    let bp = window.playerBattlePass;
    bp.xp += amount;
    
    let requiredXp = getXpRequirement(bp.level);
    while (bp.xp >= requiredXp && bp.level < 100) {
        bp.xp -= requiredXp;
        bp.level++;
        requiredXp = getXpRequirement(bp.level);
        alert(`⭐ LEVEL UP! Your Battle Pass is now Level ${bp.level}! Check the Battle Pass menu for rewards.`);
    }

    if (bp.level >= 100) {
        bp.level = 100;
        bp.xp = getXpRequirement(100);
    }
};

// Automatic detection when Stripe redirects back after purchasing the Battle Pass
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success' && urlParams.get('pack') === 'battle_pass') {
        if (typeof window.playerBattlePass !== 'undefined') {
            window.playerBattlePass.hasPaidPass = true;
            alert("🎉 Battle Pass Unlocked Successfully via Stripe!");
            window.openBattlePassModal();
        }
    }
});

if (typeof playerData !== 'undefined' && playerData.inventory) {
    const originalPush = playerData.inventory.push;
    playerData.inventory.push = function(...args) {
        const result = originalPush.apply(this, args);
        if (typeof window.addBattlePassXP === 'function') {
            window.addBattlePassXP(100);
        }
        return result;
    };
}