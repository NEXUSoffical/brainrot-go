// battlePass.js - 100-Level Progression & Reward System (with Automatic Catch XP Hook)

if (typeof window.playerBattlePass === 'undefined') {
    window.playerBattlePass = {
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        claimedLevels: []
    };
}

// Master list or dynamic generator for 100 levels of rewards
window.battlePassRewards = {};

function generateBattlePassRewards() {
    for (let i = 1; i <= 100; i++) {
        let type = 'currency';
        let name = '50 Braincoins';
        let icon = '🪙';
        let value = 50;

        if (i % 10 === 0) {
            type = 'legendary_rot';
            name = `Tier ${i/10} Legendary Rot`;
            icon = '👑';
            value = `legendary_${i}`;
        } else if (i % 5 === 0) {
            type = 'epic_rot';
            name = `Epic Brainrot Fighter`;
            icon = '⭐';
            value = `epic_${i}`;
        } else if (i % 2 === 0) {
            type = 'potions';
            name = '3x Health Potions';
            icon = '🧪';
            value = 3;
        }

        // Custom high-tier flex rewards at the very end
        if (i === 50) {
            name = 'HALFWAY GOD ROT';
            icon = '⚡';
        }
        if (i === 100) {
            name = 'MAX LEVEL OMEGA GODFATHER ROT';
            icon = '🏆';
        }

        window.battlePassRewards[i] = { level: i, type, name, icon, value };
    }
}
generateBattlePassRewards();

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
    let progressPercent = Math.min(100, (bp.xp / bp.xpToNextLevel) * 100);

    let levelsHtml = '';
    for (let i = 1; i <= 100; i++) {
        let rew = window.battlePassRewards[i];
        let isUnlocked = bp.level >= i;
        let isClaimed = bp.claimedLevels.includes(i);

        let statusBg = isClaimed ? '#222' : (isUnlocked ? '#00ff55' : '#333');
        let statusColor = isClaimed ? '#777' : (isUnlocked ? '#000' : '#888');
        let statusText = isClaimed ? 'CLAIMED' : (isUnlocked ? 'CLAIM!' : 'LOCKED');

        levelsHtml += `
            <div style="background: #110820; border: 2px solid ${isUnlocked ? '#00ff55' : '#444'}; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #ff0055; width: 45px;">Lvl ${i}</div>
                    <div style="font-size: 1.5rem;">${rew.icon}</div>
                    <div>
                        <div style="font-size: 0.85rem; font-weight: bold; color: #fff;">${rew.name}</div>
                        <div style="font-size: 0.65rem; color: #aaa;">Tier reward</div>
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
                <h1 style="color: #00ff55; font-size: 1.5rem; margin: 0;">🏆 BRAINROT BATTLE PASS</h1>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">Level ${bp.level} | XP: ${bp.xp} / ${bp.xpToNextLevel}</p>
            </div>
            <button onclick="document.getElementById('battlePassModal').remove()" style="background: #ff0055; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">CLOSE</button>
        </div>

        <!-- PROGRESS BAR -->
        <div style="width: 100%; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid #444; margin-bottom: 15px;">
            <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #00ff55, #00ffee); transition: width 0.3s;"></div>
        </div>

        <!-- REWARDS SCROLL LIST -->
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
    }

    window.openBattlePassModal();
};

window.addBattlePassXP = function(amount) {
    let bp = window.playerBattlePass;
    bp.xp += amount;
    
    while (bp.xp >= bp.xpToNextLevel && bp.level < 100) {
        bp.xp -= bp.xpToNextLevel;
        bp.level++;
        alert(`⭐ LEVEL UP! Your Battle Pass is now Level ${bp.level}! Check the Battle Pass menu for rewards.`);
    }

    if (bp.level >= 100) {
        bp.level = 100;
        bp.xp = bp.xpToNextLevel;
    }
};

// AUTOMATIC BATTLE PASS XP HOOK FOR INVENTORY CATCHES
if (typeof playerData !== 'undefined' && playerData.inventory) {
    const originalPush = playerData.inventory.push;
    playerData.inventory.push = function(...args) {
        const result = originalPush.apply(this, args);
        if (typeof window.addBattlePassXP === 'function') {
            window.addBattlePassXP(150);
        }
        return result;
    };
}