// battle.js - Universal Battle Engine with God Cloud, Hashtag Hell, Fomo Phantom, Fomo Doom, Blimpy, Pufflet, Wafflet, WaffleWrecker, Giga Byte, Titan Mech, Meow Meow, & Cat Evolutions support + QTE & Type Matchups

if (typeof window.currentWildCreature === 'undefined') {
    window.currentWildCreature = null;
    window.wildHp = 100;
    window.maxWildHp = 100;
    window.playerHp = 50;
    window.maxPlayerHp = 50;
    
    window.playerLightningUsed = false;
    window.cloudLightningUsed = false;
    
    window.playerHashtagUltUsed = false;
    window.wildHashtagUltUsed = false;
    
    window.playerHashtagHellUltUsed = false;
    window.wildHashtagHellUltUsed = false;

    window.playerGodCloudUltUsed = false;
    window.wildGodCloudUltUsed = false;

    window.playerFomoDoomUltUsed = false;
    window.wildFomoDoomUltUsed = false;

    window.playerBlimpySnoozeUsed = false;
    window.wildBlimpySnoozeUsed = false;

    window.playerPuffletInflationUsed = false;
    window.wildPuffletInflationUsed = false;

    window.playerWaffletUltUsed = false;
    window.wildWaffletUltUsed = false;

    window.playerWaffleWreckerUltUsed = false;
    window.wildWaffleWreckerUltUsed = false;

    window.playerGigaByteUltUsed = false;
    window.wildGigaByteUltUsed = false;

    window.playerTitanMechUltUsed = false;
    window.wildTitanMechUltUsed = false;

    window.playerMeowMeowUltUsed = false;
    window.wildMeowMeowUltUsed = false;

    window.playerGlitchNyanUltUsed = false;
    window.wildGlitchNyanUltUsed = false;

    window.playerVoidProwlerUltUsed = false;
    window.wildVoidProwlerUltUsed = false;

    window.playerCelestialPurrUltUsed = false;
    window.wildCelestialPurrUltUsed = false;

    window.playerBlazeMewUltUsed = false;
    window.wildBlazeMewUltUsed = false;

    window.playerVerdantStalkerUltUsed = false;
    window.wildVerdantStalkerUltUsed = false;

    window.activeQteMultiplier = 1.0;
}

// Inject Floating & Guaranteed Visible CSS Combat FX Styles + QTE Styles
function injectBattleAnimations() {
    if (document.getElementById('battleCustomAnimations')) return;
    const style = document.createElement('style');
    style.id = 'battleCustomAnimations';
    style.innerHTML = `
        @keyframes battleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
        }
        .battle-float {
            animation: battleFloat 2.5s ease-in-out infinite !important;
        }

        #wildCardContainer, #playerCardContainer, .battle-card-box {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
        }

        /* QTE Timing Bar Styles */
        @keyframes qteSlide {
            0% { left: 0%; }
            50% { left: 90%; }
            100% { left: 0%; }
        }
        .qte-marker {
            position: absolute; top: 0; width: 6px; height: 100%; background: #fff;
            box-shadow: 0 0 10px #00ffff; animation: qteSlide 1.1s infinite ease-in-out;
        }
        .qte-target-zone {
            position: absolute; top: 0; left: 62% !important; width: 22% !important; height: 100%;
            background: rgba(0, 255, 128, 0.45); border-left: 2px dashed #00ff80; border-right: 2px dashed #00ff80;
        }

        @keyframes waterShotArcPlayer {
            0% { transform: translate(0px, 0px) scale(0.6); opacity: 0; }
            20% { opacity: 1; transform: translate(100px, -80px) scale(1.4); }
            80% { transform: translate(200px, -160px) scale(1.8); opacity: 1; }
            100% { transform: translate(250px, -200px) scale(2.5); opacity: 0; }
        }
        .water-projectile-player {
            position: absolute; bottom: 25%; left: 25%; width: 32px; height: 32px;
            background: radial-gradient(circle, #ffffff 0%, #00ffff 50%, #0088ff 100%);
            box-shadow: 0 0 25px #00ffff, 0 0 10px #ffffff; border-radius: 50%;
            animation: waterShotArcPlayer 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes waterShotArcEnemy {
            0% { transform: translate(0px, 0px) scale(0.6); opacity: 0; }
            20% { opacity: 1; transform: translate(-100px, 80px) scale(1.4); }
            80% { transform: translate(-200px, 160px) scale(1.8); opacity: 1; }
            100% { transform: translate(-250px, 200px) scale(2.5); opacity: 0; }
        }
        .water-projectile-enemy {
            position: absolute; top: 25%; right: 25%; width: 32px; height: 32px;
            background: radial-gradient(circle, #ffffff 0%, #00ffff 50%, #0088ff 100%);
            box-shadow: 0 0 25px #00ffff, 0 0 10px #ffffff; border-radius: 50%;
            animation: waterShotArcEnemy 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes impactSplashRipple {
            0% { transform: scale(0.5); opacity: 1; border-width: 6px; }
            100% { transform: scale(2.2); opacity: 0; border-width: 1px; }
        }
        .water-impact-ring-player {
            position: absolute; top: 25px; right: 25px; width: 80px; height: 40px;
            border: 4px solid #00ffff; border-radius: 50%; box-shadow: 0 0 20px #00ffff, inset 0 0 15px #00ffff;
            animation: impactSplashRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }
        .water-impact-ring-enemy {
            position: absolute; bottom: 25px; left: 25px; width: 80px; height: 40px;
            border: 4px solid #00ffff; border-radius: 50%; box-shadow: 0 0 20px #00ffff, inset 0 0 15px #00ffff;
            animation: impactSplashRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }

        .psychic-projectile-player {
            position: absolute; bottom: 25%; left: 25%; width: 36px; height: 36px;
            background: radial-gradient(circle, #ffffff 0%, #ff00ff 50%, #9900ff 100%);
            box-shadow: 0 0 25px #ff00ff, 0 0 10px #ffffff; border-radius: 50%;
            animation: waterShotArcPlayer 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        .psychic-projectile-enemy {
            position: absolute; top: 25%; right: 25%; width: 36px; height: 36px;
            background: radial-gradient(circle, #ffffff 0%, #ff00ff 50%, #9900ff 100%);
            box-shadow: 0 0 25px #ff00ff, 0 0 10px #ffffff; border-radius: 50%;
            animation: waterShotArcEnemy 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }

        @keyframes voidStorm {
            0%, 100% { filter: brightness(1); background: transparent; }
            20% { filter: brightness(4) drop-shadow(0 0 60px #9900ff); background: rgba(153, 0, 255, 0.4); }
            40% { filter: brightness(0.1); background: rgba(20, 0, 50, 0.8); }
            60% { filter: brightness(6) drop-shadow(0 0 90px #ff00ff); background: rgba(255, 0, 255, 0.6); }
            80% { filter: brightness(1.5); }
        }
        .void-storm-effect { animation: voidStorm 0.8s ease-in-out; }
        
        @keyframes doomEyeFlash {
            0% { transform: translateY(-50px) scale(0.2) rotate(0deg); opacity: 0; }
            50% { transform: translateY(0px) scale(2.2) rotate(180deg); opacity: 1; }
            100% { transform: translateY(20px) scale(2) rotate(360deg); opacity: 0; }
        }
        .doom-eye-particle {
            position: absolute; font-size: 3rem; animation: doomEyeFlash 0.65s linear forwards; pointer-events: none; z-index: 9999999;
        }
        
        @keyframes arenaLightningStorm {
            0%, 100% { filter: brightness(1); background: transparent; }
            20% { filter: brightness(4) drop-shadow(0 0 50px #ffff00); background: rgba(255, 255, 0, 0.35); }
            40% { filter: brightness(0.1); background: rgba(0, 204, 255, 0.5); }
            60% { filter: brightness(5) drop-shadow(0 0 70px #00ffff); background: rgba(255, 255, 255, 0.65); }
            80% { filter: brightness(1.5); }
        }
        .lightning-storm-effect { animation: arenaLightningStorm 0.7s ease-in-out; }

        @keyframes boltFlash {
            0% { transform: translateY(-50px) scaleY(0.1); opacity: 0; }
            50% { transform: translateY(0px) scaleY(1.8); opacity: 1; }
            100% { transform: translateY(60px) scaleY(0.2); opacity: 0; }
        }
        .lightning-bolt-particle {
            position: absolute; font-size: 3.5rem; animation: boltFlash 0.6s linear forwards; pointer-events: none; z-index: 9999999;
        }

        @keyframes tridentShotArcPlayer {
            0% { transform: translate(0px, 0px) scale(0.6) rotate(0deg); opacity: 0; }
            20% { opacity: 1; transform: translate(100px, -80px) scale(1.5) rotate(15deg); }
            80% { transform: translate(200px, -160px) scale(2) rotate(30deg); opacity: 1; }
            100% { transform: translate(250px, -200px) scale(2.8) rotate(45deg); opacity: 0; }
        }
        .trident-projectile-player {
            position: absolute; bottom: 25%; left: 25%; font-size: 2.5rem;
            filter: drop-shadow(0 0 25px #ffd700) drop-shadow(0 0 10px #00ffff);
            animation: tridentShotArcPlayer 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes tridentShotArcEnemy {
            0% { transform: translate(0px, 0px) scale(0.6) rotate(0deg); opacity: 0; }
            20% { opacity: 1; transform: translate(-100px, 80px) scale(1.5) rotate(15deg); }
            80% { transform: translate(-200px, 160px) scale(2) rotate(30deg); opacity: 1; }
            100% { transform: translate(-250px, 200px) scale(2.8) rotate(45deg); opacity: 0; }
        }
        .trident-projectile-enemy {
            position: absolute; top: 25%; right: 25%; font-size: 2.5rem;
            filter: drop-shadow(0 0 25px #ffd700) drop-shadow(0 0 10px #00ffff);
            animation: tridentShotArcEnemy 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes godWrathStorm {
            0%, 100% { filter: brightness(1); background: transparent; }
            20% { filter: brightness(5) drop-shadow(0 0 80px #ffd700); background: rgba(255, 215, 0, 0.45); }
            40% { filter: brightness(0.1); background: rgba(138, 43, 226, 0.6); }
            60% { filter: brightness(6) drop-shadow(0 0 100px #00ffff); background: rgba(255, 255, 255, 0.8); }
            80% { filter: brightness(2); }
        }
        .god-wrath-storm-effect { animation: godWrathStorm 0.8s ease-in-out; }

        @keyframes blimpySnoozeGlow {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 10px #00ccff); }
            50% { filter: brightness(1.4) drop-shadow(0 0 30px #00ffcc); }
        }
        .blimpy-snooze-effect { animation: blimpySnoozeGlow 1s ease-in-out infinite; }

        @keyframes pinballBounce {
            0% { transform: translate(0, 0) scale(1) rotate(0deg); }
            25% { transform: translate(-80px, -40px) scale(1.6) rotate(90deg); }
            50% { transform: translate(80px, 40px) scale(1.6) rotate(180deg); }
            75% { transform: translate(-50px, 30px) scale(1.5) rotate(270deg); }
            100% { transform: translate(0, 0) scale(1) rotate(360deg); }
        }
        .pufflet-pinball-effect { animation: pinballBounce 0.6s ease-in-out; }

        #zzzzParticle {
            position: absolute; font-size: 2rem; font-weight: bold; color: #00ccff;
            text-shadow: 0 0 10px #ffffff; pointer-events: none; z-index: 9999999;
            animation: doomEyeFlash 0.8s linear forwards;
        }

        #gustParticle {
            position: absolute; font-size: 2.2rem; pointer-events: none; z-index: 9999999;
            animation: waterShotArcPlayer 0.5s linear forwards;
        }

        @keyframes syrupShotArcPlayer {
            0% { transform: translate(0px, 0px) scale(0.5); opacity: 0; }
            20% { opacity: 1; transform: translate(100px, -60px) scale(1.2) rotate(45deg); }
            80% { transform: translate(200px, -120px) scale(1.6) rotate(180deg); opacity: 1; }
            100% { transform: translate(250px, -180px) scale(2.2); opacity: 0; }
        }
        .syrup-projectile-player {
            position: absolute; bottom: 25%; left: 25%; width: 30px; height: 30px;
            background: radial-gradient(circle, #ffcc00 0%, #cc7700 70%, #884400 100%);
            box-shadow: 0 0 15px #ffaa00, inset 0 0 10px #ffcc00; 
            border-radius: 40% 60% 60% 40% / 50% 50% 50% 50%;
            animation: syrupShotArcPlayer 0.6s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes syrupShotArcEnemy {
            0% { transform: translate(0px, 0px) scale(0.5); opacity: 0; }
            20% { opacity: 1; transform: translate(-100px, 60px) scale(1.2) rotate(45deg); }
            80% { transform: translate(-200px, 120px) scale(1.6) rotate(180deg); opacity: 1; }
            100% { transform: translate(-250px, 180px) scale(2.2); opacity: 0; }
        }
        .syrup-projectile-enemy {
            position: absolute; top: 25%; right: 25%; width: 30px; height: 30px;
            background: radial-gradient(circle, #ffcc00 0%, #cc7700 70%, #884400 100%);
            box-shadow: 0 0 15px #ffaa00, inset 0 0 10px #ffcc00; 
            border-radius: 40% 60% 60% 40% / 50% 50% 50% 50%;
            animation: syrupShotArcEnemy 0.6s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes syrupSplatRing {
            0% { transform: scale(0.5); opacity: 1; border-width: 8px; }
            100% { transform: scale(2.5); opacity: 0; border-width: 2px; }
        }
        .syrup-impact-ring {
            position: absolute; width: 70px; height: 50px;
            border: 6px solid #cc7700; border-radius: 50%; 
            background: rgba(255, 170, 0, 0.3);
            box-shadow: 0 0 20px #ffaa00, inset 0 0 15px #ffcc00;
            animation: syrupSplatRing 0.5s ease-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes mapleFloodStorm {
            0%, 100% { filter: brightness(1); background: transparent; }
            20% { filter: brightness(1.2) drop-shadow(0 0 40px #ffaa00); background: rgba(255, 170, 0, 0.4); }
            40% { filter: brightness(0.8); background: rgba(204, 119, 0, 0.6); }
            60% { filter: brightness(1.5) drop-shadow(0 0 60px #ffcc00); background: rgba(255, 204, 0, 0.5); }
        }
        .maple-flood-effect { animation: mapleFloodStorm 0.8s ease-in-out; }

        @keyframes waffleWreckerShockwave {
            0%, 100% { filter: brightness(1); background: transparent; }
            20% { filter: brightness(5) drop-shadow(0 0 90px #ffaa00); background: rgba(255, 170, 0, 0.5); }
            40% { filter: brightness(0.2); background: rgba(102, 51, 0, 0.7); }
            60% { filter: brightness(6) drop-shadow(0 0 120px #ffffff); background: rgba(255, 255, 255, 0.8); }
            80% { filter: brightness(2); }
        }
        .waffle-wrecker-storm-effect { animation: waffleWreckerShockwave 0.8s ease-in-out; }

        @keyframes hashtagShotArcPlayer {
            0% { transform: translate(0px, 0px) scale(0.6) rotate(0deg); opacity: 0; }
            20% { opacity: 1; transform: translate(100px, -80px) scale(1.5) rotate(45deg); }
            80% { transform: translate(200px, -160px) scale(2) rotate(90deg); opacity: 1; }
            100% { transform: translate(250px, -200px) scale(2.8) rotate(180deg); opacity: 0; }
        }
        .hashtag-projectile-player {
            position: absolute; bottom: 25%; left: 25%; font-size: 2.2rem; font-weight: 900;
            color: #76ff03; text-shadow: 0 0 20px #76ff03, 0 0 10px #ffffff;
            animation: hashtagShotArcPlayer 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes hashtagShotArcEnemy {
            0% { transform: translate(0px, 0px) scale(0.6) rotate(0deg); opacity: 0; }
            20% { opacity: 1; transform: translate(-100px, 80px) scale(1.5) rotate(45deg); }
            80% { transform: translate(-200px, 160px) scale(2) rotate(90deg); opacity: 1; }
            100% { transform: translate(-250px, 200px) scale(2.8) rotate(180deg); opacity: 0; }
        }
        .hashtag-projectile-enemy {
            position: absolute; top: 25%; right: 25%; font-size: 2.2rem; font-weight: 900;
            color: #76ff03; text-shadow: 0 0 20px #76ff03, 0 0 10px #ffffff;
            animation: hashtagShotArcEnemy 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        .hashtag-impact-ring-player {
            position: absolute; top: 25px; right: 25px; width: 80px; height: 40px;
            border: 4px solid #76ff03; border-radius: 50%; box-shadow: 0 0 25px #76ff03, inset 0 0 15px #ffffff;
            animation: impactSplashRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }
        .hashtag-impact-ring-enemy {
            position: absolute; bottom: 25px; left: 25px; width: 80px; height: 40px;
            border: 4px solid #76ff03; border-radius: 50%; box-shadow: 0 0 25px #76ff03, inset 0 0 15px #ffffff;
            animation: impactSplashRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }

        @keyframes shitpostStorm {
            0%, 100% { filter: brightness(1); background: transparent; }
            20% { filter: brightness(4) drop-shadow(0 0 60px #76ff03); background: rgba(118, 255, 3, 0.4); }
            40% { filter: brightness(0.1); background: rgba(0, 50, 0, 0.7); }
            60% { filter: brightness(6) drop-shadow(0 0 90px #ffffff); background: rgba(255, 255, 255, 0.7); }
            80% { filter: brightness(1.5); }
        }
        .shitpost-storm-effect { animation: shitpostStorm 0.8s ease-in-out; }
        @keyframes pileUpHashtags {
            0% { transform: translateY(-100px) scale(0.2) rotate(0deg); opacity: 0; }
            40% { transform: translateY(0px) scale(2.5) rotate(45deg); opacity: 1; }
            80% { transform: translateY(10px) scale(2.2) rotate(15deg); opacity: 1; }
            100% { transform: translateY(20px) scale(2) rotate(0deg); opacity: 0.95; }
        }
        .buried-hashtag-pile {
            position: absolute; font-size: 3.5rem; font-weight: 900; color: #76ff03;
            text-shadow: 0 0 25px #76ff03, 0 0 10px #ffffff;
            animation: pileUpHashtags 0.75s ease-in-out forwards; pointer-events: none; z-index: 9999999;
        }

        @keyframes fireShotArcPlayer {
            0% { transform: translate(0px, 0px) scale(0.6); opacity: 0; }
            20% { opacity: 1; transform: translate(100px, -80px) scale(1.4) skewX(-10deg); }
            80% { transform: translate(200px, -160px) scale(1.8) skewX(10deg); opacity: 1; }
            100% { transform: translate(250px, -200px) scale(2.5); opacity: 0; }
        }
        .fire-projectile-player {
            position: absolute; bottom: 25%; left: 25%; width: 34px; height: 34px;
            background: radial-gradient(circle, #ffff00 0%, #ff0055 50%, #9900ff 100%);
            box-shadow: 0 0 25px #ff0055, 0 0 10px #ffff00; border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            animation: fireShotArcPlayer 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes fireShotArcEnemy {
            0% { transform: translate(0px, 0px) scale(0.6); opacity: 0; }
            20% { opacity: 1; transform: translate(-100px, 80px) scale(1.4) skewX(-10deg); }
            80% { transform: translate(-200px, 160px) scale(1.8) skewX(10deg); opacity: 1; }
            100% { transform: translate(-250px, 200px) scale(2.5); opacity: 0; }
        }
        .fire-projectile-enemy {
            position: absolute; top: 25%; right: 25%; width: 34px; height: 34px;
            background: radial-gradient(circle, #ffff00 0%, #ff0055 50%, #9900ff 100%);
            box-shadow: 0 0 25px #ff0055, 0 0 10px #ffff00; border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            animation: fireShotArcEnemy 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes fireImpactRipple {
            0% { transform: scale(0.5); opacity: 1; border-width: 6px; }
            100% { transform: scale(2.4); opacity: 0; border-width: 1px; }
        }
        .fire-impact-ring-player {
            position: absolute; top: 25px; right: 25px; width: 80px; height: 40px;
            border: 4px solid #ff0055; border-radius: 50%; box-shadow: 0 0 25px #ff0055, inset 0 0 15px #ffff00;
            animation: fireImpactRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }
        .fire-impact-ring-enemy {
            position: absolute; bottom: 25px; left: 25px; width: 80px; height: 40px;
            border: 4px solid #ff0055; border-radius: 50%; box-shadow: 0 0 25px #ff0055, inset 0 0 15px #ffff00;
            animation: fireImpactRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }

        @keyframes hellfireCorruptionStorm {
            0%, 100% { filter: brightness(1); background: transparent; }
            20% { filter: brightness(4) drop-shadow(0 0 50px #ff0055); background: rgba(255, 0, 85, 0.35); }
            40% { filter: brightness(0.1); background: rgba(153, 0, 255, 0.5); }
            60% { filter: brightness(5) drop-shadow(0 0 70px #ffff00); background: rgba(255, 255, 0, 0.65); }
            80% { filter: brightness(1.5); }
        }
        .hellfire-storm-effect { animation: hellfireCorruptionStorm 0.7s ease-in-out; }
        @keyframes glitchFlameFlash {
            0% { transform: translateY(-50px) scaleY(0.1) skewX(20deg); opacity: 0; }
            50% { transform: translateY(0px) scaleY(1.8) skewX(-20deg); opacity: 1; }
            100% { transform: translateY(60px) scaleY(0.2) skewX(10deg); opacity: 0; }
        }
        .hellfire-particle {
            position: absolute; font-size: 3.5rem; animation: glitchFlameFlash 0.6s linear forwards; pointer-events: none; z-index: 9999999;
        }
    `;
    document.head.appendChild(style);
}
injectBattleAnimations();

function shouldFloat(charName) {
    if (!charName) return false;
    const lower = charName.toLowerCase();
    return lower.includes('cloud') || lower.includes('god') || lower.includes('hashtag') || lower.includes('hell') || lower.includes('glitch') || lower.includes('spirit') || lower.includes('phantom') || lower.includes('fomo') || lower.includes('blimpy') || lower.includes('pufflet') || lower.includes('wafflet') || lower.includes('wafflewrecker') || lower.includes('gigabyte');
}

// Element & Type Matchup Helpers
function getRotElement(name) {
    if (!name) return 'tech';
    const n = name.toLowerCase();
    if (n.includes('waffle') || n.includes('blimpy') || n.includes('pufflet')) return 'food';
    if (n.includes('void') || n.includes('fomo') || n.includes('phantom')) return 'void';
    if (n.includes('blaze') || n.includes('hell') || n.includes('titan')) return 'glitch';
    return 'tech';
}

function getTypeMultiplier(attackerType, defenderType) {
    if (attackerType === 'glitch' || defenderType === 'glitch') return 1.2;
    if (attackerType === 'food' && defenderType === 'tech') return 1.5;
    if (attackerType === 'tech' && defenderType === 'void') return 1.5;
    if (attackerType === 'void' && defenderType === 'food') return 1.5;
    if (attackerType === defenderType) return 1.0;
    return 0.75;
}

window.initBattle = function(creature) {
    window.currentWildCreature = creature;
    window.activeQteMultiplier = 1.0;
    window.playerLightningUsed = false;
    window.cloudLightningUsed = false;
    window.playerHashtagUltUsed = false;
    window.wildHashtagUltUsed = false;
    window.playerHashtagHellUltUsed = false;
    window.wildHashtagHellUltUsed = false;
    window.playerGodCloudUltUsed = false;
    window.wildGodCloudUltUsed = false;
    window.playerFomoDoomUltUsed = false;
    window.wildFomoDoomUltUsed = false;
    window.playerBlimpySnoozeUsed = false;
    window.wildBlimpySnoozeUsed = false;
    window.playerPuffletInflationUsed = false;
    window.wildPuffletInflationUsed = false;
    window.playerWaffletUltUsed = false;
    window.wildWaffletUltUsed = false;
    window.playerWaffleWreckerUltUsed = false;
    window.wildWaffleWreckerUltUsed = false;
    window.playerGigaByteUltUsed = false;
    window.wildGigaByteUltUsed = false;
    window.playerTitanMechUltUsed = false;
    window.wildTitanMechUltUsed = false;
    window.playerMeowMeowUltUsed = false;
    window.wildMeowMeowUltUsed = false;
    window.playerGlitchNyanUltUsed = false;
    window.wildGlitchNyanUltUsed = false;
    window.playerVoidProwlerUltUsed = false;
    window.wildVoidProwlerUltUsed = false;
    window.playerCelestialPurrUltUsed = false;
    window.wildCelestialPurrUltUsed = false;
    window.playerBlazeMewUltUsed = false;
    window.wildBlazeMewUltUsed = false;
    window.playerVerdantStalkerUltUsed = false;
    window.wildVerdantStalkerUltUsed = false;
    
    const wildLvl = creature.level || 1;
    let wildStats = typeof window.calculateRotStats === 'function' 
        ? window.calculateRotStats(creature) 
        : { maxHp: 50 + (wildLvl - 1) * 12, atk: 10, def: 10 };
        
    if (creature && creature.shiny) {
        wildStats.atk *= 1.3;
        wildStats.def *= 1.3;
        wildStats.maxHp = Math.floor(wildStats.maxHp * 1.3);
    }
        
    window.maxWildHp = wildStats.maxHp;
    window.wildHp = window.maxWildHp;

    if (typeof playerData === 'undefined') {
        window.playerData = { username: "Player", rotBalance: 500, inventory: [], activeFighterIndex: 0, revivePotions: 0, candies: {} };
    }
    if (!playerData.inventory || playerData.inventory.length === 0) {
        playerData.inventory = [{ name: "Skibidi", rarity: "common", image: "", level: 1, hp: 50, maxHp: 50, fainted: false }];
        playerData.activeFighterIndex = 0;
    }

    let activeFighter = playerData.inventory[playerData.activeFighterIndex] || playerData.inventory[0];
    if (activeFighter && activeFighter.fainted) {
        const healthyIndex = playerData.inventory.findIndex(r => !r.fainted);
        if (healthyIndex !== -1) {
            playerData.activeFighterIndex = healthyIndex;
            activeFighter = playerData.inventory[healthyIndex];
        }
    }

    const fighterLvl = activeFighter.level || 1;
    let pStats = typeof window.calculateRotStats === 'function' 
        ? window.calculateRotStats(activeFighter) 
        : { maxHp: 50 + (fighterLvl * 15), atk: 15, def: 10 };

    if (activeFighter && activeFighter.shiny) {
        pStats.atk *= 1.3;
        pStats.def *= 1.3;
        pStats.maxHp = Math.floor(pStats.maxHp * 1.3);
    }

    window.maxPlayerHp = pStats.maxHp;
    window.playerHp = activeFighter.fainted ? 0 : window.maxPlayerHp;

    const wildElem = getRotElement(creature.name);
    document.getElementById('wildName').innerText = `${creature.shiny ? '💎 SHINY ' : ''}${(creature.name || "Unknown").toUpperCase()} (Lvl ${wildLvl}) [${wildElem.toUpperCase()}]`;
    document.getElementById('wildBadgeName').innerText = `${creature.shiny ? '💎 ' : ''}${creature.name || "Unknown"} (Lvl ${wildLvl})`;
    document.getElementById('wildRarity').innerText = `TYPE: ${wildElem.toUpperCase()} | RARITY: ${(creature.rarity || 'common').toUpperCase()}${creature.shiny ? ' [💎 SHINY]' : ''}`;
    
    const wildIsFloating = shouldFloat(creature.name);
    const wildCardContainer = document.getElementById('wildCardContainer');
    if (wildCardContainer) {
        wildCardContainer.style.background = 'transparent';
        wildCardContainer.style.border = 'none';
        wildCardContainer.style.boxShadow = 'none';
        wildCardContainer.style.padding = '0';
        wildCardContainer.innerHTML = `
            <div id="wildFighterInner" class="${wildIsFloating ? 'battle-float' : ''}" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: transparent !important; ${creature.shiny ? 'animation: diamondPulse 1.5s infinite;' : ''}">
                <img src="${creature.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.8)) ${creature.shiny ? 'drop-shadow(0 0 10px #00ffff)' : ''};" onerror="this.style.display='none';">
            </div>
        `;
    }

    updatePlayerFighterDisplay(activeFighter, fighterLvl);
    updateHpBars();
    renderTacticalBattleMenu();

    const battleLog = document.getElementById('battleLog');
    if (battleLog) {
        if (activeFighter.fainted) {
            battleLog.innerText = `⚠️ Your active fighter is FAINTED! Switch fighters or visit the Revive Station!`;
        } else {
            battleLog.innerText = `A wild ${creature.shiny ? '💎 DIAMOND SHINY ' : ''}Level ${wildLvl} ${creature.name} appeared!`;
        }
    }
};

function updatePlayerFighterDisplay(activeFighter, fighterLvl) {
    const playerIsFloating = shouldFloat(activeFighter.name);
    const playerFighterInner = document.getElementById('playerFighterInner');
    const playerCardContainer = document.getElementById('playerCardContainer');
    
    if (playerFighterInner) {
        playerFighterInner.className = playerIsFloating ? 'battle-float' : '';
    }

    let imagePath = activeFighter.image || '';
    const cleanName = activeFighter.name ? activeFighter.name.toLowerCase().replace(/[\s-]/g, '') : '';
    if (cleanName === 'hashtaghell') {
        imagePath = 'brainrots/hashtag_hell.png';
    }

    if (playerCardContainer) {
        playerCardContainer.style.background = 'transparent';
        playerCardContainer.style.border = 'none';
        playerCardContainer.style.boxShadow = 'none';
        playerCardContainer.style.padding = '0';
        playerCardContainer.innerHTML = `
            <div class="${playerIsFloating ? 'battle-float' : ''}" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: transparent !important; ${activeFighter.shiny ? 'animation: diamondPulse 1.5s infinite;' : ''}">
                <img src="${imagePath}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.8)) ${activeFighter.shiny ? 'drop-shadow(0 0 10px #00ffff)' : ''}; ${activeFighter.fainted ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
            </div>
        `;
    }

    const fighterElem = getRotElement(activeFighter.name);
    const fighterNameEl = document.getElementById('myFighterName');
    if (fighterNameEl) {
        fighterNameEl.innerText = `${activeFighter.shiny ? '💎 ' : ''}${activeFighter.name || 'Fighter'} (Lvl ${fighterLvl}) [${fighterElem.toUpperCase()}] ${activeFighter.fainted ? '💀 [FAINTED]' : ''}`;
    }
}

function updateHpBars() {
    const wildPercent = Math.max(0, (window.wildHp / window.maxWildHp) * 100);
    const playerPercent = Math.max(0, (window.playerHp / window.maxPlayerHp) * 100);

    const wildHpBar = document.getElementById('wildHpBar');
    if (wildHpBar) wildHpBar.style.width = wildPercent + '%';
    const wildHpText = document.getElementById('wildHpText');
    if (wildHpText) wildHpText.innerText = `${Math.ceil(window.wildHp)}/${window.maxWildHp} HP`;

    const myHpBar = document.getElementById('myHpBar');
    if (myHpBar) myHpBar.style.width = playerPercent + '%';
    const myHpText = document.getElementById('myHpText');
    if (myHpText) myHpText.innerText = `${Math.ceil(window.playerHp)}/${window.maxPlayerHp} HP`;
}

// 🎮 RENDER TACTICAL SKILL UI & QTE MENU
function renderTacticalBattleMenu() {
    const actionContainer = document.querySelector('.battle-actions') || document.getElementById('battleActionsContainer');
    if (!actionContainer) return;

    actionContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; width: 100%;">
            <button onclick="battleAttack()" style="background: #00ccff; color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">✨ Signature Move</button>
            <button onclick="openQTEPrompt()" style="background: #9900ff; color: #fff; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">🎯 Critical QTE</button>
            <button onclick="openBattleSwitch()" style="background: #00ff80; color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">🔄 Switch</button>
            <button onclick="battleCatch()" style="background: #ffaa00; color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">📦 Catch / Vault</button>
        </div>
    `;
}

// Interactive QTE Timing Modal Popup
window.openQTEPrompt = function() {
    let activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
    if (activeFighter && (activeFighter.fainted || window.playerHp <= 0)) {
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `⚠️ Your fighter is fainted! Click 'Switch' to choose another Rot.`;
        if (typeof openBattleSwitch === 'function') openBattleSwitch();
        return;
    }

    if (window.wildHp <= 0 || window.playerHp <= 0) return;

    let qteModal = document.getElementById('qteModal');
    if (!qteModal) {
        qteModal = document.createElement('div');
        qteModal.id = 'qteModal';
        qteModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); z-index: 9999999; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: monospace; color: #fff;
        `;
        document.body.appendChild(qteModal);
    }

    qteModal.innerHTML = `
        <div style="background: #111; border: 3px solid #00ff80; padding: 25px; border-radius: 12px; text-align: center; width: 90%; max-width: 320px; box-shadow: 0 0 25px rgba(0,255,128,0.3);">
            <h3 style="color: #00ff80; margin-bottom: 10px;">TIMING STRIKE!</h3>
            <p style="font-size: 0.8rem; margin-bottom: 15px; color: #ccc;">Tap when the marker is inside the green target zone!</p>
            <div id="qteTrack" style="position: relative; width: 100%; height: 35px; background: #222; border-radius: 6px; overflow: hidden; margin-bottom: 20px; border: 1px solid #444;">
                <div class="qte-target-zone"></div>
                <div id="movingQteMarker" class="qte-marker"></div>
            </div>
            <button onclick="resolveQTE()" style="background: #00ff80; color: #000; font-weight: bold; border: none; padding: 12px 20px; border-radius: 6px; width: 100%; cursor: pointer; font-size: 1rem;">STRIKE NOW!</button>
        </div>
    `;
    qteModal.style.display = 'flex';
};

window.resolveQTE = function() {
    const marker = document.getElementById('movingQteMarker');
    const qteModal = document.getElementById('qteModal');
    if (!marker) return;

    const computedStyle = window.getComputedStyle(marker);
    const leftPercent = parseFloat(computedStyle.left);

    let multiplier = 0.75; 
    let resultText = "❌ Weak Timing Strike!";

    if (leftPercent >= 60 && leftPercent <= 86) {
        multiplier = 2.0; 
        resultText = "🔥 PERFECT CRITICAL STRIKE! (2x)";
    } else if (leftPercent >= 52 && leftPercent <= 92) {
        multiplier = 1.35;
        resultText = "⚡ Good Timing Hit! (1.35x)";
    }

    if (qteModal) qteModal.style.display = 'none';
    window.activeQteMultiplier = multiplier;
    
    const battleLog = document.getElementById('battleLog');
    if (battleLog) battleLog.innerText = `${resultText} Now execute your attack!`;
    
    window.battleAttack();
};

// 💻 GIGA BYTE CYBER PULSE & OVERCLOCK FX
window.playPlayerGigaByteAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerGigaByteUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerGigaByteUltUsed = true;
        window.isPlayerGigaByteBoost = true;

        if (wildModal) wildModal.classList.add('lightning-storm-effect');
        if (battleLog) battleLog.innerText = `⚡ ULTIMATE: Giga Byte triggered Overclock Shield Surge!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerGigaByteBoost = false;
        if (battleLog) battleLog.innerText = `💻 Giga Byte fired a Cyber Pulse Laser!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-player';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #00ffff 50%, #0044ff 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#00ffff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildGigaByteAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildGigaByteUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildGigaByteUltUsed = true;
        window.isWildGigaByteBoost = true;

        if (wildModal) wildModal.classList.add('lightning-storm-effect');
        if (battleLog) battleLog.innerText = `⚡ ULTIMATE: Wild Giga Byte triggered Overclock Shield Surge!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildGigaByteBoost = false;
        if (battleLog) battleLog.innerText = `💻 Wild Giga Byte fired a Cyber Pulse Laser at you!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-enemy';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #00ffff 50%, #0044ff 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#00ffff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🤖 TITAN MECH NUCLEAR LASER FX
window.playPlayerTitanMechAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerTitanMechUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerTitanMechUltUsed = true;
        window.isPlayerTitanMechBoost = true;

        if (wildModal) wildModal.classList.add('lightning-storm-effect');
        if (battleLog) battleLog.innerText = `🤖 ULTIMATE: Titan Mech fired a Devastating Nuclear Cannon!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerTitanMechBoost = false;
        if (battleLog) battleLog.innerText = `🤖 Titan Mech executed a Heavy Metal Slam!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-player';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #ff5500 50%, #550000 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#ff5500';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildTitanMechAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildTitanMechUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildTitanMechUltUsed = true;
        window.isWildTitanMechBoost = true;

        if (wildModal) wildModal.classList.add('lightning-storm-effect');
        if (battleLog) battleLog.innerText = `🤖 ULTIMATE: Wild Titan Mech fired a Devastating Nuclear Cannon!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildTitanMechBoost = false;
        if (battleLog) battleLog.innerText = `🤖 Wild Titan Mech executed a Heavy Metal Slam!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-enemy';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #ff5500 50%, #550000 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#ff5500';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🐾 MEOW MEOW NEON CLAW & PURR BEAM FX
window.playPlayerMeowMeowAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerMeowMeowUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerMeowMeowUltUsed = true;
        window.isPlayerMeowMeowBoost = true;

        if (wildModal) wildModal.classList.add('void-storm-effect');
        if (battleLog) battleLog.innerText = `🐾 ULTIMATE: Meow Meow unleashed a Neon Rainbow Purr Beam!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('void-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerMeowMeowBoost = false;
        if (battleLog) battleLog.innerText = `🐾 Meow Meow slashed with Neon Claws!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'psychic-projectile-player';
            projectile.style.background = 'radial-gradient(circle, #ff00ff 0%, #00ffff 50%, #ffcc00 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#ff00ff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildMeowMeowAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildMeowMeowUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildMeowMeowUltUsed = true;
        window.isWildMeowMeowBoost = true;

        if (wildModal) wildModal.classList.add('void-storm-effect');
        if (battleLog) battleLog.innerText = `🐾 ULTIMATE: Wild Meow Meow unleashed a Neon Rainbow Purr Beam!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('void-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildMeowMeowBoost = false;
        if (battleLog) battleLog.innerText = `🐾 Wild Meow Meow slashed you with Neon Claws!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'psychic-projectile-enemy';
            projectile.style.background = 'radial-gradient(circle, #ff00ff 0%, #00ffff 50%, #ffcc00 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#ff00ff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// ⚡ GLITCHNYAN ATTACK FX
window.playPlayerGlitchNyanAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerGlitchNyanUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerGlitchNyanUltUsed = true;
        window.isPlayerGlitchNyanBoost = true;
        if (wildModal) wildModal.classList.add('lightning-storm-effect');
        if (battleLog) battleLog.innerText = `⚡ ULTIMATE: GlitchNyan corrupted enemy files with Binary Overload!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerGlitchNyanBoost = false;
        if (battleLog) battleLog.innerText = `⚡ GlitchNyan unleashed a Code Slash!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-player';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #00ff55 50%, #002200 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#00ff55';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildGlitchNyanAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildGlitchNyanUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildGlitchNyanUltUsed = true;
        window.isWildGlitchNyanBoost = true;
        if (wildModal) wildModal.classList.add('lightning-storm-effect');
        if (battleLog) battleLog.innerText = `⚡ ULTIMATE: Wild GlitchNyan corrupted your files with Binary Overload!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildGlitchNyanBoost = false;
        if (battleLog) battleLog.innerText = `⚡ Wild GlitchNyan unleashed a Code Slash!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-enemy';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #00ff55 50%, #002200 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#00ff55';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🌌 VOIDPROWLER ATTACK FX
window.playPlayerVoidProwlerAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerVoidProwlerUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerVoidProwlerUltUsed = true;
        window.isPlayerVoidProwlerBoost = true;
        if (wildModal) wildModal.classList.add('void-storm-effect');
        if (battleLog) battleLog.innerText = `🌌 ULTIMATE: VoidProwler executed Cosmic Nebula Drain!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('void-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerVoidProwlerBoost = false;
        if (battleLog) battleLog.innerText = `🌌 VoidProwler slashed with Shadow Claws!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'psychic-projectile-player';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#9900ff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildVoidProwlerAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildVoidProwlerUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildVoidProwlerUltUsed = true;
        window.isWildVoidProwlerBoost = true;
        if (wildModal) wildModal.classList.add('void-storm-effect');
        if (battleLog) battleLog.innerText = `🌌 ULTIMATE: Wild VoidProwler executed Cosmic Nebula Drain!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('void-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildVoidProwlerBoost = false;
        if (battleLog) battleLog.innerText = `🌌 Wild VoidProwler slashed with Shadow Claws!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'psychic-projectile-enemy';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#9900ff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// ✨ CELESTIAL PURR ATTACK FX
window.playPlayerCelestialPurrAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerCelestialPurrUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerCelestialPurrUltUsed = true;
        window.isPlayerCelestialPurrBoost = true;
        if (wildModal) wildModal.classList.add('god-wrath-storm-effect');
        if (battleLog) battleLog.innerText = `✨ ULTIMATE: Celestial Purr rained Holy Fiber-Optic Smite!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('god-wrath-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerCelestialPurrBoost = false;
        if (battleLog) battleLog.innerText = `✨ Celestial Purr cast Divine Light!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-player';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #ffd700 50%, #ff8800 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#ffd700';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildCelestialPurrAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildCelestialPurrUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildCelestialPurrUltUsed = true;
        window.isWildCelestialPurrBoost = true;
        if (wildModal) wildModal.classList.add('god-wrath-storm-effect');
        if (battleLog) battleLog.innerText = `✨ ULTIMATE: Wild Celestial Purr rained Holy Fiber-Optic Smite!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('god-wrath-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildCelestialPurrBoost = false;
        if (battleLog) battleLog.innerText = `✨ Wild Celestial Purr cast Divine Light!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-enemy';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #ffd700 50%, #ff8800 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#ffd700';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🔥 BLAZEMEW ATTACK FX
window.playPlayerBlazeMewAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerBlazeMewUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerBlazeMewUltUsed = true;
        window.isPlayerBlazeMewBoost = true;
        if (wildModal) wildModal.classList.add('hellfire-storm-effect');
        if (battleLog) battleLog.innerText = `🔥 ULTIMATE: BlazeMew unleashed Magma Firewall Destruction!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('hellfire-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerBlazeMewBoost = false;
        if (battleLog) battleLog.innerText = `🔥 BlazeMew hurled a Magma Claw!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'fire-projectile-player';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'fire-impact-ring-player';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildBlazeMewAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildBlazeMewUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildBlazeMewUltUsed = true;
        window.isWildBlazeMewBoost = true;
        if (wildModal) wildModal.classList.add('hellfire-storm-effect');
        if (battleLog) battleLog.innerText = `🔥 ULTIMATE: Wild BlazeMew unleashed Magma Firewall Destruction!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('hellfire-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildBlazeMewBoost = false;
        if (battleLog) battleLog.innerText = `🔥 Wild BlazeMew hurled a Magma Claw!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'fire-projectile-enemy';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'fire-impact-ring-enemy';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🌿 VERDANTSTALKER ATTACK FX
window.playPlayerVerdantStalkerAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerVerdantStalkerUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerVerdantStalkerUltUsed = true;
        window.isPlayerVerdantStalkerBoost = true;
        if (wildModal) wildModal.classList.add('maple-flood-effect');
        if (battleLog) battleLog.innerText = `🌿 ULTIMATE: VerdantStalker executed Thorn Whip Jungle Frenzy!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('maple-flood-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerVerdantStalkerBoost = false;
        if (battleLog) battleLog.innerText = `🌿 VerdantStalker lashed with Razor Vines!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-player';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #00ff00 50%, #003300 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#00ff00';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildVerdantStalkerAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildVerdantStalkerUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildVerdantStalkerUltUsed = true;
        window.isWildVerdantStalkerBoost = true;
        if (wildModal) wildModal.classList.add('maple-flood-effect');
        if (battleLog) battleLog.innerText = `🌿 ULTIMATE: Wild VerdantStalker executed Thorn Whip Jungle Frenzy!`;
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('maple-flood-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildVerdantStalkerBoost = false;
        if (battleLog) battleLog.innerText = `🌿 Wild VerdantStalker lashed with Razor Vines!`;
        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'water-projectile-enemy';
            projectile.style.background = 'radial-gradient(circle, #ffffff 0%, #00ff00 50%, #003300 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#00ff00';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🥞 WAFFLET STICKY SYRUP FX
window.playPlayerWaffletAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerWaffletUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerWaffletUltUsed = true;
        window.isPlayerWaffletBoost = true;

        if (wildModal) wildModal.classList.add('maple-flood-effect');
        if (battleLog) battleLog.innerText = `🥞 ULTIMATE: Wafflet unleashed a Sticky Maple Flood!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('maple-flood-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerWaffletBoost = false;
        if (battleLog) battleLog.innerText = `🥞 Wafflet lobbed a Sticky Syrup Splat!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'syrup-projectile-player';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'syrup-impact-ring';
                impactRing.style.top = '25px';
                impactRing.style.right = '25px';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildWaffletAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildWaffletUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildWaffletUltUsed = true;
        window.isWildWaffletBoost = true;

        if (wildModal) wildModal.classList.add('maple-flood-effect');
        if (battleLog) battleLog.innerText = `🥞 ULTIMATE: Wild Wafflet unleashed a Sticky Maple Flood!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('maple-flood-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildWaffletBoost = false;
        if (battleLog) battleLog.innerText = `🥞 Wild Wafflet lobbed a Sticky Syrup Splat at you!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'syrup-projectile-enemy';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'syrup-impact-ring';
                impactRing.style.bottom = '25px';
                impactRing.style.left = '25px';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🛡️ WAFFLE WRECKER ATTACK & ULTIMATE FX
window.playPlayerWaffleWreckerAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.playerWaffleWreckerUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerWaffleWreckerUltUsed = true;
        window.isPlayerWaffleWreckerBoost = true;

        if (wildModal) wildModal.classList.add('waffle-wrecker-storm-effect');
        if (battleLog) battleLog.innerText = `🛡️ ULTIMATE: WaffleWrecker triggered Golden Crunch Obliteration!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('waffle-wrecker-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerWaffleWreckerBoost = false;
        if (battleLog) battleLog.innerText = `🪓 WaffleWrecker swung his Syrup-Smasher Axe!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'syrup-projectile-player';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'syrup-impact-ring';
                impactRing.style.top = '25px';
                impactRing.style.right = '25px';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildWaffleWreckerAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const battleLog = document.getElementById('battleLog');

    const useUltimate = !window.wildWaffleWreckerUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildWaffleWreckerUltUsed = true;
        window.isWildWaffleWreckerBoost = true;

        if (wildModal) wildModal.classList.add('waffle-wrecker-storm-effect');
        if (battleLog) battleLog.innerText = `🛡️ ULTIMATE: Wild WaffleWrecker triggered Golden Crunch Obliteration!`;

        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('waffle-wrecker-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildWaffleWreckerBoost = false;
        if (battleLog) battleLog.innerText = `🪓 Wild WaffleWrecker swung his Syrup-Smasher Axe at you!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'syrup-projectile-enemy';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'syrup-impact-ring';
                impactRing.style.bottom = '25px';
                impactRing.style.left = '25px';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🎈 BLIMPY CUSTOM ABILITY FX (SNOOZE & AIRBAG BOUNCE)
window.playPlayerBlimpyAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const playerCombatant = document.getElementById('playerCombatant');
    const battleLog = document.getElementById('battleLog');

    const useSnooze = !window.playerBlimpySnoozeUsed && Math.random() < 0.5;

    if (useSnooze) {
        window.playerBlimpySnoozeUsed = true;
        window.isPlayerBlimpyHeal = true;

        if (playerCombatant) playerCombatant.classList.add('blimpy-snooze-effect');
        if (battleLog) battleLog.innerText = `💤 Blimpy takes a little snooze mid-battle to catch some Zs and gain health!`;

        if (arenaField) {
            const zzz = document.createElement('div');
            zzz.id = 'zzzzParticle';
            zzz.innerText = '💤 ZZZ...';
            zzz.style.top = '60%';
            zzz.style.left = '30%';
            arenaField.appendChild(zzz);
            setTimeout(() => zzz.remove(), 800);
        }

        setTimeout(() => {
            if (playerCombatant) playerCombatant.classList.remove('blimpy-snooze-effect');
            if (callback) callback();
        }, 850);
    } else {
        window.isPlayerBlimpyHeal = false;
        if (battleLog) battleLog.innerText = `🎈 Blimpy uses Airbag Bounce! Rubbery physics reflect impact!`;

        if (playerCombatant) {
            playerCombatant.classList.add('hit-knockback');
        }
        setTimeout(() => {
            if (playerCombatant) playerCombatant.classList.remove('hit-knockback');
            if (callback) callback();
        }, 550);
    }
};

window.playWildBlimpyAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildCombatant = document.getElementById('wildCombatant');
    const battleLog = document.getElementById('battleLog');

    const useSnooze = !window.wildBlimpySnoozeUsed && Math.random() < 0.5;

    if (useSnooze) {
        window.wildBlimpySnoozeUsed = true;
        window.isWildBlimpyHeal = true;

        if (wildCombatant) wildCombatant.classList.add('blimpy-snooze-effect');
        if (battleLog) battleLog.innerText = `💤 Wild Blimpy takes a little snooze and gains health!`;

        if (arenaField) {
            const zzz = document.createElement('div');
            zzz.id = 'zzzzParticle';
            zzz.innerText = '💤 ZZZ...';
            zzz.style.top = '25%';
            zzz.style.left = '60%';
            arenaField.appendChild(zzz);
            setTimeout(() => zzz.remove(), 800);
        }

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.remove('blimpy-snooze-effect');
            if (callback) callback();
        }, 850);
    } else {
        window.isWildBlimpyHeal = false;
        if (battleLog) battleLog.innerText = `🎈 Wild Blimpy uses Airbag Bounce!`;

        if (wildCombatant) wildCombatant.classList.add('hit-knockback');
        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.remove('hit-knockback');
            if (callback) callback();
        }, 550);
    }
};

// 🎈 PUFFLET CUSTOM ABILITY FX (EMERGENCY INFLATION & ACCIDENTAL GUST)
window.playPlayerPuffletAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const playerCombatant = document.getElementById('playerCombatant');
    const battleLog = document.getElementById('battleLog');

    const useInflation = !window.playerPuffletInflationUsed && Math.random() < 0.5;

    if (useInflation) {
        window.playerPuffletInflationUsed = true;
        window.isPlayerPuffletInflation = true;

        if (playerCombatant) playerCombatant.classList.add('pufflet-pinball-effect');
        if (battleLog) battleLog.innerText = `🎈 EMERGENCY INFLATION! Pufflet panics into a giant pinball bouncing around!`;

        setTimeout(() => {
            if (playerCombatant) playerCombatant.classList.remove('pufflet-pinball-effect');
            if (callback) callback();
        }, 650);
    } else {
        window.isPlayerPuffletInflation = false;
        if (battleLog) battleLog.innerText = `💨 Pufflet flaps frantically, whipping up an Accidental Gust!`;

        if (arenaField) {
            const gust = document.createElement('div');
            gust.id = 'gustParticle';
            gust.innerText = '💨';
            gust.style.top = '50%';
            gust.style.left = '30%';
            arenaField.appendChild(gust);
            setTimeout(() => gust.remove(), 500);
        }

        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.playWildPuffletAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildCombatant = document.getElementById('wildCombatant');
    const battleLog = document.getElementById('battleLog');

    const useInflation = !window.wildPuffletInflationUsed && Math.random() < 0.5;

    if (useInflation) {
        window.wildPuffletInflationUsed = true;
        window.isWildPuffletInflation = true;

        if (wildCombatant) wildCombatant.classList.add('pufflet-pinball-effect');
        if (battleLog) battleLog.innerText = `🎈 Wild Pufflet triggers Emergency Inflation pinball chaos!`;

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.remove('pufflet-pinball-effect');
            if (callback) callback();
        }, 650);
    } else {
        window.isWildPuffletInflation = false;
        if (battleLog) battleLog.innerText = `💨 Wild Pufflet creates a chaotic Accidental Gust!`;

        if (arenaField) {
            const gust = document.createElement('div');
            gust.id = 'gustParticle';
            gust.innerText = '💨';
            gust.style.top = '30%';
            gust.style.left = '60%';
            arenaField.appendChild(gust);
            setTimeout(() => gust.remove(), 500);
        }

        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🔮 PLAYER FOMO PHANTOM ATTACK FX
window.playPlayerFomoAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const battleLog = document.getElementById('battleLog');
    
    if (battleLog) battleLog.innerText = `🔮 Fomo Phantom fired a Psychic Pulse!`;

    if (arenaField) {
        const projectile = document.createElement('div');
        projectile.className = 'psychic-projectile-player';
        arenaField.appendChild(projectile);
        setTimeout(() => {
            projectile.remove();
            const impactRing = document.createElement('div');
            impactRing.className = 'water-impact-ring-player';
            impactRing.style.borderColor = '#ff00ff';
            arenaField.appendChild(impactRing);
            setTimeout(() => impactRing.remove(), 400);
        }, 500);
    }
    setTimeout(() => { if (callback) callback(); }, 550);
};

// 🔮 WILD FOMO PHANTOM ATTACK FX
window.playWildFomoAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const battleLog = document.getElementById('battleLog');
    
    if (battleLog) battleLog.innerText = `🔮 Wild Fomo Phantom fired a Psychic Pulse at you!`;

    if (arenaField) {
        const projectile = document.createElement('div');
        projectile.className = 'psychic-projectile-enemy';
        arenaField.appendChild(projectile);
        setTimeout(() => {
            projectile.remove();
            const impactRing = document.createElement('div');
            impactRing.className = 'water-impact-ring-enemy';
            impactRing.style.borderColor = '#ff00ff';
            arenaField.appendChild(impactRing);
            setTimeout(() => impactRing.remove(), 400);
        }, 500);
    }
    setTimeout(() => { if (callback) callback(); }, 550);
};

// 👁️ PLAYER FOMO DOOM ATTACK FX
window.playPlayerFomoDoomAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    
    const useUltimate = !window.playerFomoDoomUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.playerFomoDoomUltUsed = true;
        window.isPlayerFomoDoomBoost = true;

        if (wildModal) wildModal.classList.add('void-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `👁️ ULTIMATE: Fomo Doom unleashed a Void Mind Storm!`;

        if (arenaField) {
            for (let i = 0; i < 4; i++) {
                const eye = document.createElement('div');
                eye.className = 'doom-eye-particle';
                eye.innerText = '👁️';
                eye.style.top = (20 + (i * 15)) + '%';
                eye.style.left = (25 + (i * 15)) + '%';
                arenaField.appendChild(eye);
                setTimeout(() => eye.remove(), 650);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('void-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerFomoDoomBoost = false;
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `👁️ Fomo Doom blasted a dark psychic beam!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'psychic-projectile-player';
            projectile.style.background = 'radial-gradient(circle, #ff00ff 0%, #9900ff 50%, #110022 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                impactRing.style.borderColor = '#9900ff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 👁️ WILD FOMO DOOM ATTACK FX
window.playWildFomoDoomAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    
    const useUltimate = !window.wildFomoDoomUltUsed && Math.random() < 0.6;

    if (useUltimate) {
        window.wildFomoDoomUltUsed = true;
        window.isWildFomoDoomBoost = true;

        if (wildModal) wildModal.classList.add('void-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `👁️ ULTIMATE: Wild Fomo Doom unleashed a Void Mind Storm!`;

        if (arenaField) {
            for (let i = 0; i < 4; i++) {
                const eye = document.createElement('div');
                eye.className = 'doom-eye-particle';
                eye.innerText = '👁️';
                eye.style.top = (20 + (i * 15)) + '%';
                eye.style.left = (25 + (i * 15)) + '%';
                arenaField.appendChild(eye);
                setTimeout(() => eye.remove(), 650);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('void-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildFomoDoomBoost = false;
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `👁️ Wild Fomo Doom blasted a dark psychic beam at you!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'psychic-projectile-enemy';
            projectile.style.background = 'radial-gradient(circle, #ff00ff 0%, #9900ff 50%, #110022 100%)';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                impactRing.style.borderColor = '#9900ff';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🌩️ PLAYER CLOUD / GOD CLOUD ATTACK FX
window.playPlayerCloudAttack = function(callback, isGodCloud = false) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    
    const useUltimate = isGodCloud 
        ? (!window.playerGodCloudUltUsed && Math.random() < 0.6)
        : (!window.playerLightningUsed && Math.random() < 0.6);

    if (useUltimate) {
        if (isGodCloud) {
            window.playerGodCloudUltUsed = true;
            window.isPlayerGodCloudBoost = true;
        } else {
            window.playerLightningUsed = true;
            window.isPlayerLightningBoost = true;
        }

        if (wildModal) wildModal.classList.add(isGodCloud ? 'god-wrath-storm-effect' : 'lightning-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            battleLog.innerText = isGodCloud 
                ? `🔱 ULTIMATE: God Cloud unleashed God Cloud Wrath with his golden trident!` 
                : `⚡ ULTIMATE: Your Chad Cloud unleashed a Lightning Strike!`;
        }

        if (arenaField) {
            for (let i = 0; i < 4; i++) {
                const bolt = document.createElement('div');
                bolt.className = 'lightning-bolt-particle';
                bolt.innerText = isGodCloud ? '🔱' : '⚡';
                bolt.style.top = (20 + (i * 15)) + '%';
                bolt.style.left = (25 + (i * 15)) + '%';
                arenaField.appendChild(bolt);
                setTimeout(() => bolt.remove(), 600);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove(isGodCloud ? 'god-wrath-storm-effect' : 'lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        if (isGodCloud) {
            window.isPlayerGodCloudBoost = false;
        } else {
            window.isPlayerLightningBoost = false;
        }
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            battleLog.innerText = isGodCloud 
                ? `🔱 God Cloud executed a piercing Trident Strike!` 
                : `🌊 Your Chad Cloud shot a water blast!`;
        }

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = isGodCloud ? 'trident-projectile-player' : 'water-projectile-player';
            if (isGodCloud) projectile.innerText = '🔱';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-player';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🌩️ WILD CLOUD / GOD CLOUD ATTACK FX
window.playWildCloudAttack = function(callback, isGodCloud = false) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    
    const useUltimate = isGodCloud 
        ? (!window.wildGodCloudUltUsed && Math.random() < 0.6)
        : (!window.cloudLightningUsed && Math.random() < 0.6);

    if (useUltimate) {
        if (isGodCloud) {
            window.wildGodCloudUltUsed = true;
            window.isWildGodCloudBoost = true;
        } else {
            window.cloudLightningUsed = true;
            window.isWildLightningBoost = true;
        }

        if (wildModal) wildModal.classList.add(isGodCloud ? 'god-wrath-storm-effect' : 'lightning-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            battleLog.innerText = isGodCloud 
                ? `🔱 ULTIMATE: Wild God Cloud unleashed God Cloud Wrath!` 
                : `⚡ ULTIMATE: Wild Cloud unleashed a Lightning Strike!`;
        }

        if (arenaField) {
            for (let i = 0; i < 4; i++) {
                const bolt = document.createElement('div');
                bolt.className = 'lightning-bolt-particle';
                bolt.innerText = isGodCloud ? '🔱' : '⚡';
                bolt.style.top = (20 + (i * 15)) + '%';
                bolt.style.left = (25 + (i * 15)) + '%';
                arenaField.appendChild(bolt);
                setTimeout(() => bolt.remove(), 600);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove(isGodCloud ? 'god-wrath-storm-effect' : 'lightning-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        if (isGodCloud) {
            window.isWildGodCloudBoost = false;
        } else {
            window.isWildLightningBoost = false;
        }
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            battleLog.innerText = isGodCloud 
                ? `🔱 Wild God Cloud struck you with a golden Trident!` 
                : `🌊 Wild Cloud shot a water blast at you!`;
        }

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = isGodCloud ? 'trident-projectile-enemy' : 'water-projectile-enemy';
            if (isGodCloud) projectile.innerText = '🔱';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'water-impact-ring-enemy';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// ♯ PLAYER HASHTAG (BASE) ATTACK FX
window.playPlayerHashtagBaseAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const wildCombatant = document.getElementById('wildCombatant');
    
    const useShitpostStorm = !window.playerHashtagUltUsed && Math.random() < 0.6;

    if (useShitpostStorm) {
        window.playerHashtagUltUsed = true;
        window.isPlayerHashtagBoost = true;

        if (wildModal) wildModal.classList.add('shitpost-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `📦🖥️ ULTIMATE: #SHITPOST STORM! Enemy buried under internet noise!`;

        if (wildCombatant) wildCombatant.style.opacity = '0.1';

        if (arenaField) {
            for (let i = 0; i < 6; i++) {
                const tag = document.createElement('div');
                tag.className = 'buried-hashtag-pile';
                tag.innerText = '#';
                tag.style.top = (15 + (i * 12)) + '%';
                tag.style.left = (35 + ((i % 3) * 10)) + '%';
                arenaField.appendChild(tag);
                setTimeout(() => tag.remove(), 750);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('shitpost-storm-effect');
            if (wildCombatant) wildCombatant.style.opacity = '1';
            if (callback) callback();
        }, 800);
    } else {
        window.isPlayerHashtagBoost = false;
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `🔥 Hashtag shot a glowing #hashtag at the enemy!`;

        if (arenaField) {
            const hashtagProj = document.createElement('div');
            hashtagProj.className = 'hashtag-projectile-player';
            hashtagProj.innerText = '#';
            arenaField.appendChild(hashtagProj);
            setTimeout(() => {
                hashtagProj.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'hashtag-impact-ring-player';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// ♯ WILD HASHTAG (BASE) ATTACK FX
window.playWildHashtagBaseAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    const playerCombatant = document.getElementById('playerCombatant');
    
    const useShitpostStorm = !window.wildHashtagUltUsed && Math.random() < 0.6;

    if (useShitpostStorm) {
        window.wildHashtagUltUsed = true;
        window.isWildHashtagBoost = true;

        if (wildModal) wildModal.classList.add('shitpost-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `📦🖥️ ULTIMATE: Wild #SHITPOST STORM! You are buried!`;

        if (playerCombatant) playerCombatant.style.opacity = '0.1'; 

        if (arenaField) {
            for (let i = 0; i < 6; i++) {
                const tag = document.createElement('div');
                tag.className = 'buried-hashtag-pile';
                tag.innerText = '#';
                tag.style.top = (45 + (i * 8)) + '%';
                tag.style.left = (15 + ((i % 3) * 10)) + '%';
                arenaField.appendChild(tag);
                setTimeout(() => tag.remove(), 750);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('shitpost-storm-effect');
            if (playerCombatant) playerCombatant.style.opacity = '1';
            if (callback) callback();
        }, 800);
    } else {
        window.isWildHashtagBoost = false;
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `🔥 Wild Hashtag shot a glowing #hashtag at you!`;

        if (arenaField) {
            const hashtagProj = document.createElement('div');
            hashtagProj.className = 'hashtag-projectile-enemy';
            hashtagProj.innerText = '#';
            arenaField.appendChild(hashtagProj);
            setTimeout(() => {
                hashtagProj.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'hashtag-impact-ring-enemy';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🔥 PLAYER HASHTAG HELL (EVOLVED) ATTACK FX
window.playPlayerHashtagHellAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    
    const useHellfireStorm = !window.playerHashtagHellUltUsed && Math.random() < 0.6;

    if (useHellfireStorm) {
        window.playerHashtagHellUltUsed = true;
        window.isPlayerHashtagHellBoost = true;

        if (wildModal) wildModal.classList.add('hellfire-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `😈 ULTIMATE: Hashtag Hell unleashed Hellfire Corruption!`;

        if (arenaField) {
            for (let i = 0; i < 4; i++) {
                const flame = document.createElement('div');
                flame.className = 'hellfire-particle';
                flame.innerText = '🔥';
                flame.style.top = (20 + (i * 15)) + '%';
                flame.style.left = (25 + (i * 15)) + '%';
                arenaField.appendChild(flame);
                setTimeout(() => flame.remove(), 600);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('hellfire-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isPlayerHashtagHellBoost = false;
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `🔥 Hashtag Hell fired a glitch fire blast!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'fire-projectile-player';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'fire-impact-ring-player';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

// 🔥 WILD HASHTAG HELL (EVOLVED) ATTACK FX
window.playWildHashtagHellAttack = function(callback) {
    const arenaField = document.getElementById('arenaField');
    const wildModal = document.getElementById('battleModal');
    
    const useHellfireStorm = !window.wildHashtagHellUltUsed && Math.random() < 0.6;

    if (useHellfireStorm) {
        window.wildHashtagHellUltUsed = true;
        window.isWildHashtagHellBoost = true;

        if (wildModal) wildModal.classList.add('hellfire-storm-effect');
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `😈 ULTIMATE: Wild Hashtag Hell unleashed Hellfire Corruption!`;

        if (arenaField) {
            for (let i = 0; i < 4; i++) {
                const flame = document.createElement('div');
                flame.className = 'hellfire-particle';
                flame.innerText = '🔥';
                flame.style.top = (20 + (i * 15)) + '%';
                flame.style.left = (25 + (i * 15)) + '%';
                arenaField.appendChild(flame);
                setTimeout(() => flame.remove(), 600);
            }
        }
        setTimeout(() => {
            if (wildModal) wildModal.classList.remove('hellfire-storm-effect');
            if (callback) callback();
        }, 700);
    } else {
        window.isWildHashtagHellBoost = false;
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `🔥 Wild Hashtag Hell fired a glitch fire blast at you!`;

        if (arenaField) {
            const projectile = document.createElement('div');
            projectile.className = 'fire-projectile-enemy';
            arenaField.appendChild(projectile);
            setTimeout(() => {
                projectile.remove();
                const impactRing = document.createElement('div');
                impactRing.className = 'fire-impact-ring-enemy';
                arenaField.appendChild(impactRing);
                setTimeout(() => impactRing.remove(), 400);
            }, 500);
        }
        setTimeout(() => { if (callback) callback(); }, 550);
    }
};

window.battleAttack = function() {
    let activeFighter = null;
    if (typeof playerData !== 'undefined' && playerData.inventory && playerData.inventory.length > 0) {
        activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
    }

    // Safety check: if active fighter is fainted, block attack and force switch menu
    if (activeFighter && (activeFighter.fainted || window.playerHp <= 0)) {
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `⚠️ Active fighter is fainted! Click 'Switch' to choose another Rot.`;
        if (typeof openBattleSwitch === 'function') openBattleSwitch();
        return;
    }

    if (window.wildHp <= 0) return;

    const wildCombatant = document.getElementById('wildCombatant');
    
    const fighterLvl = activeFighter ? (activeFighter.level || 1) : 1;
    const wildLvl = window.currentWildCreature ? (window.currentWildCreature.level || 1) : 1;

    let pStats = typeof window.calculateRotStats === 'function' ? window.calculateRotStats(activeFighter) : {atk: 15, def: 10};
    if (activeFighter && activeFighter.shiny) {
        pStats.atk *= 1.3;
        pStats.def *= 1.3;
    }

    let wStats = typeof window.calculateRotStats === 'function' ? window.calculateRotStats(window.currentWildCreature) : {atk: 10, def: 10};
    if (window.currentWildCreature && window.currentWildCreature.shiny) {
        wStats.atk *= 1.3;
        wStats.def *= 1.3;
    }

    const fighterName = (activeFighter && activeFighter.name) ? activeFighter.name.toLowerCase().trim().replace(/[\s-]/g, '') : "";
    
    const isPlayerGodCloud = fighterName === "godcloud";
    const isPlayerCloud = fighterName.includes("cloud") && !isPlayerGodCloud;
    const isPlayerHashtagHell = fighterName === "hashtaghell";
    const isPlayerHashtagBase = fighterName === "hashtag" && !isPlayerHashtagHell;
    const isPlayerFomoDoom = fighterName === "fomodoom";
    const isPlayerFomo = fighterName === "fomophantom" && !isPlayerFomoDoom;
    const isPlayerBlimpy = fighterName === "blimpy";
    const isPlayerPufflet = fighterName === "pufflet";
    const isPlayerWafflet = fighterName === "wafflet";
    const isPlayerWaffleWrecker = fighterName === "wafflewrecker";
    const isPlayerGigaByte = fighterName === "gigabyte";
    const isPlayerTitanMech = fighterName === "titanmech";
    const isPlayerMeowMeow = fighterName === "meowmeow";
    const isPlayerGlitchNyan = fighterName === "glitchnyan";
    const isPlayerVoidProwler = fighterName === "voidprowler";
    const isPlayerCelestialPurr = fighterName === "celestialpurr";
    const isPlayerBlazeMew = fighterName === "blazemew";
    const isPlayerVerdantStalker = fighterName === "verdantstalker";

    // ⚡ HANDLE PLAYER ATTACK ANIMATIONS
    if (isPlayerGodCloud) {
        window.playPlayerCloudAttack(executeDamageSequence, true);
    } else if (isPlayerCloud) {
        window.playPlayerCloudAttack(executeDamageSequence, false);
    } else if (isPlayerHashtagHell) {
        window.playPlayerHashtagHellAttack(executeDamageSequence);
    } else if (isPlayerHashtagBase) {
        window.playPlayerHashtagBaseAttack(executeDamageSequence);
    } else if (isPlayerFomoDoom) {
        window.playPlayerFomoDoomAttack(executeDamageSequence);
    } else if (isPlayerFomo) {
        window.playPlayerFomoAttack(executeDamageSequence);
    } else if (isPlayerBlimpy) {
        window.playPlayerBlimpyAttack(executeDamageSequence);
    } else if (isPlayerPufflet) {
        window.playPlayerPuffletAttack(executeDamageSequence);
    } else if (isPlayerWafflet) {
        window.playPlayerWaffletAttack(executeDamageSequence);
    } else if (isPlayerWaffleWrecker) {
        window.playPlayerWaffleWreckerAttack(executeDamageSequence);
    } else if (isPlayerGigaByte) {
        window.playPlayerGigaByteAttack(executeDamageSequence);
    } else if (isPlayerTitanMech) {
        window.playPlayerTitanMechAttack(executeDamageSequence);
    } else if (isPlayerMeowMeow) {
        window.playPlayerMeowMeowAttack(executeDamageSequence);
    } else if (isPlayerGlitchNyan) {
        window.playPlayerGlitchNyanAttack(executeDamageSequence);
    } else if (isPlayerVoidProwler) {
        window.playPlayerVoidProwlerAttack(executeDamageSequence);
    } else if (isPlayerCelestialPurr) {
        window.playPlayerCelestialPurrAttack(executeDamageSequence);
    } else if (isPlayerBlazeMew) {
        window.playPlayerBlazeMewAttack(executeDamageSequence);
    } else if (isPlayerVerdantStalker) {
        window.playPlayerVerdantStalkerAttack(executeDamageSequence);
    } else {
        const playerCombatant = document.getElementById('playerCombatant');
        if (playerCombatant) playerCombatant.classList.add('charge-attack');
        setTimeout(() => {
            if (playerCombatant) playerCombatant.classList.remove('charge-attack');
            executeDamageSequence();
        }, 300);
    }

    function executeDamageSequence() {
        if (window.gameAudio && typeof window.gameAudio.playHit === 'function') {
            window.gameAudio.playHit();
        }

        if (wildCombatant) wildCombatant.classList.add('hit-knockback');

        // Handle Blimpy Heal Ability (Snooze)
        if (isPlayerBlimpy && window.isPlayerBlimpyHeal) {
            const healAmount = Math.floor(window.maxPlayerHp * 0.25);
            window.playerHp = Math.min(window.maxPlayerHp, window.playerHp + healAmount);
            updateHpBars();
        }

        const pElem = getRotElement(activeFighter ? activeFighter.name : '');
        const wElem = getRotElement(window.currentWildCreature ? window.currentWildCreature.name : '');
        const typeMod = getTypeMultiplier(pElem, wElem);

        let attackRoll = pStats.atk * (0.8 + (Math.random() * 0.4));
        if (window.isPlayerLightningBoost || window.isPlayerHashtagBoost || window.isPlayerHashtagHellBoost || window.isPlayerGodCloudBoost || window.isPlayerFomoDoomBoost || window.isPlayerPuffletInflation || window.isPlayerWaffletBoost || window.isPlayerWaffleWreckerBoost || window.isPlayerGigaByteBoost || window.isPlayerTitanMechBoost || window.isPlayerMeowMeowBoost || window.isPlayerGlitchNyanBoost || window.isPlayerVoidProwlerBoost || window.isPlayerCelestialPurrBoost || window.isPlayerBlazeMewBoost || window.isPlayerVerdantStalkerBoost) {
            attackRoll *= 1.8;
        }

        let defenseRoll = wStats.def * (0.4 + (Math.random() * 0.2));
        let baseDamage = Math.floor((attackRoll - defenseRoll) * window.activeQteMultiplier * typeMod);

        const levelDiff = fighterLvl - wildLvl;
        if (levelDiff < 0) {
            baseDamage = Math.floor(baseDamage * Math.max(0.1, 1 + (levelDiff * 0.1)));
        }

        const damage = Math.max(1, baseDamage); 
        window.wildHp -= damage;
        
        // Reset QTE multiplier after strike
        const currentQte = window.activeQteMultiplier;
        window.activeQteMultiplier = 1.0;
        
        updateHpBars();
        
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            let qteSuffix = currentQte > 1.0 ? ` (QTE x${currentQte})` : "";
            let typeSuffix = typeMod > 1.0 ? " [Super Effective! 💥]" : "";
            
            if (isPlayerGigaByte && window.isPlayerGigaByteBoost) {
                battleLog.innerText = `⚡ Overclock Shield Surge dealt critical damage of ${damage}!${qteSuffix}${typeSuffix}`;
            } else if (isPlayerTitanMech && window.isPlayerTitanMechBoost) {
                battleLog.innerText = `🤖 Nuclear Cannon obliterated them for ${damage} damage!${qteSuffix}${typeSuffix}`;
            } else if (isPlayerMeowMeow && window.isPlayerMeowMeowBoost) {
                battleLog.innerText = `🐾 Neon Rainbow Purr Beam blasted them for ${damage} damage!${qteSuffix}${typeSuffix}`;
            } else if (isPlayerCelestialPurr && window.isPlayerCelestialPurrBoost) {
                battleLog.innerText = `✨ Holy Fiber-Optic Smite dealt ${damage} damage!${qteSuffix}${typeSuffix}`;
            } else if (isPlayerBlazeMew && window.isPlayerBlazeMewBoost) {
                battleLog.innerText = `🔥 Magma Firewall Destruction dealt ${damage} damage!${qteSuffix}${typeSuffix}`;
            } else {
                battleLog.innerText = `Attack hit for ${damage} damage!${qteSuffix}${typeSuffix}`;
            }
        }

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.remove('hit-knockback');
        }, 300);

        if (window.wildHp <= 0) {
            window.wildHp = 0;
            updateHpBars();
            
            if (battleLog) battleLog.innerText = `Victory! Click 'Catch / Vault' to claim it!`;
            
            if (typeof window.saveGameData === 'function') window.saveGameData();
            return;
        }

        setTimeout(() => {
            const wildNameRaw = window.currentWildCreature ? window.currentWildCreature.name.toLowerCase().trim().replace(/[\s-]/g, '') : "";
            
            const isWildGodCloud = wildNameRaw === "godcloud";
            const isWildCloud = wildNameRaw.includes("cloud") && !isWildGodCloud;
            const isWildHashtagHell = wildNameRaw === "hashtaghell";
            const isWildHashtagBase = wildNameRaw === "hashtag" && !isWildHashtagHell;
            const isWildFomoDoom = wildNameRaw === "fomodoom";
            const isWildFomo = wildNameRaw === "fomophantom" && !isWildFomoDoom;
            const isWildBlimpy = wildNameRaw === "blimpy";
            const isWildPufflet = wildNameRaw === "pufflet";
            const isWildWafflet = wildNameRaw === "wafflet";
            const isWildWaffleWrecker = wildNameRaw === "wafflewrecker";
            const isWildGigaByte = wildNameRaw === "gigabyte";
            const isWildTitanMech = wildNameRaw === "titanmech";
            const isWildMeowMeow = wildNameRaw === "meowmeow";
            const isWildGlitchNyan = wildNameRaw === "glitchnyan";
            const isWildVoidProwler = wildNameRaw === "voidprowler";
            const isWildCelestialPurr = wildNameRaw === "celestialpurr";
            const isWildBlazeMew = wildNameRaw === "blazemew";
            const isWildVerdantStalker = wildNameRaw === "verdantstalker";

            // ⚡ WILD ENEMY COUNTER-ATTACKS
            if (isWildGodCloud) {
                window.playWildCloudAttack(applyEnemyDamage, true);
            } else if (isWildCloud) {
                window.playWildCloudAttack(applyEnemyDamage, false);
            } else if (isWildHashtagHell) {
                window.playWildHashtagHellAttack(applyEnemyDamage);
            } else if (isWildHashtagBase) {
                window.playWildHashtagBaseAttack(applyEnemyDamage);
            } else if (isWildFomoDoom) {
                window.playWildFomoDoomAttack(applyEnemyDamage);
            } else if (isWildFomo) {
                window.playWildFomoAttack(applyEnemyDamage);
            } else if (isWildBlimpy) {
                window.playWildBlimpyAttack(applyEnemyDamage);
            } else if (isWildPufflet) {
                window.playWildPuffletAttack(applyEnemyDamage);
            } else if (isWildWafflet) {
                window.playWildWaffletAttack(applyEnemyDamage);
            } else if (isWildWaffleWrecker) {
                window.playWildWaffleWreckerAttack(applyEnemyDamage);
            } else if (isWildGigaByte) {
                window.playWildGigaByteAttack(applyEnemyDamage);
            } else if (isWildTitanMech) {
                window.playWildTitanMechAttack(applyEnemyDamage);
            } else if (isWildMeowMeow) {
                window.playWildMeowMeowAttack(applyEnemyDamage);
            } else if (isWildGlitchNyan) {
                window.playWildGlitchNyanAttack(applyEnemyDamage);
            } else if (isWildVoidProwler) {
                window.playWildVoidProwlerAttack(applyEnemyDamage);
            } else if (isWildCelestialPurr) {
                window.playWildCelestialPurrAttack(applyEnemyDamage);
            } else if (isWildBlazeMew) {
                window.playWildBlazeMewAttack(applyEnemyDamage);
            } else if (isWildVerdantStalker) {
                window.playWildVerdantStalkerAttack(applyEnemyDamage);
            } else {
                if (wildCombatant) wildCombatant.classList.add('charge-attack');
                setTimeout(applyEnemyDamage, 300);
            }

            function applyEnemyDamage() {
                if (wildCombatant) wildCombatant.classList.remove('charge-attack');
                const playerCombatant = document.getElementById('playerCombatant');
                if (playerCombatant) playerCombatant.classList.add('hit-knockback');

                if (isWildBlimpy && window.isWildBlimpyHeal) {
                    const wildHeal = Math.floor(window.maxWildHp * 0.25);
                    window.wildHp = Math.min(window.maxWildHp, window.wildHp + wildHeal);
                    updateHpBars();
                }

                let enemyAttackRoll = wStats.atk * (0.8 + (Math.random() * 0.4));
                if (window.isWildLightningBoost || window.isWildHashtagBoost || window.isWildHashtagHellBoost || window.isWildGodCloudBoost || window.isWildFomoDoomBoost || window.isWildPuffletInflation || window.isWildWaffletBoost || window.isWildWaffleWreckerBoost || window.isWildGigaByteBoost || window.isWildTitanMechBoost || window.isWildMeowMeowBoost || window.isWildGlitchNyanBoost || window.isWildVoidProwlerBoost || window.isWildCelestialPurrBoost || window.isWildBlazeMewBoost || window.isWildVerdantStalkerBoost) {
                    enemyAttackRoll *= 1.8;
                }

                let playerDefenseRoll = pStats.def * (0.4 + (Math.random() * 0.2));
                let counterDamage = Math.floor(enemyAttackRoll - playerDefenseRoll);

                const reverseDiff = wildLvl - fighterLvl;
                if (reverseDiff > 0) {
                    counterDamage = Math.floor(counterDamage * (1 + (reverseDiff * 0.1)));
                }

                counterDamage = Math.max(1, counterDamage);
                window.playerHp -= counterDamage;
                updateHpBars();
                
                const enemyDisplayName = window.currentWildCreature ? window.currentWildCreature.name : 'Target';
                if (battleLog) {
                    battleLog.innerText = `${enemyDisplayName} counter-attacked for ${counterDamage} damage!`;
                }

                setTimeout(() => {
                    if (playerCombatant) playerCombatant.classList.remove('hit-knockback');
                }, 300);

                if (window.playerHp <= 0) {
                    window.playerHp = 0;
                    updateHpBars();

                    if (activeFighter) activeFighter.fainted = true;
                    if (typeof window.saveGameData === 'function') window.saveGameData();
                    
                    if (battleLog) battleLog.innerText = `💀 Your squad was defeated! Fleeing battle...`;
                    
                    setTimeout(() => {
                        if (typeof window.closeBattle === 'function') {
                            window.closeBattle();
                        } else {
                            const modal = document.getElementById('battleModal');
                            if (modal) modal.style.display = 'none';
                        }
                        window.currentWildCreature = null;
                    }, 1500);
                }
            }
        }, 600);
    }
};

window.openBattleSwitch = function() {
    if (typeof playerData === 'undefined' || !playerData.inventory || playerData.inventory.length === 0) {
        alert("You don't have any other rots in your inventory!");
        return;
    }

    let switchModal = document.getElementById('battleSwitchModal');
    if (!switchModal) {
        switchModal = document.createElement('div');
        switchModal.id = 'battleSwitchModal';
        switchModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.9); z-index: 999999; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: monospace; color: #fff; padding: 20px;
        `;
        document.body.appendChild(switchModal);
    }

    let gridHtml = `
        <div style="background: #111; border: 3px solid #00ccff; border-radius: 15px; padding: 20px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 0 30px rgba(0,204,255,0.4);">
            <h3 style="color: #00ccff; margin-bottom: 10px;">CHOOSE YOUR FIGHTER</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 15px;">
    `;

    playerData.inventory.forEach((rot, index) => {
        const isCurrent = playerData.activeFighterIndex === index;
        const isFainted = rot.fainted === true;

        let rotImage = rot.image || '';
        const cleanName = rot.name ? rot.name.toLowerCase().replace(/[\s-]/g, '') : '';
        if (cleanName === 'hashtaghell') {
            rotImage = 'brainrots/hashtag_hell.png';
        }

        gridHtml += `
            <div onclick="selectNewFighter(${index})" style="background: ${isFainted ? '#2a1a1a' : (isCurrent ? '#1a3a1a' : '#222')}; border: 2px solid ${isFainted ? '#ff0055' : (isCurrent ? '#00ff00' : '#555')}; border-radius: 8px; padding: 8px; cursor: pointer; text-align: center; opacity: ${isFainted ? '0.6' : '1'};">
                <img src="${rotImage}" style="width: 50px; height: 50px; object-fit: contain; ${isFainted ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
                <div style="font-size: 0.75rem; font-weight: bold; margin-top: 4px; color: #fff;">${rot.shiny ? '💎 ' : ''}${rot.name}</div>
                <div style="font-size: 0.65rem; color: ${isFainted ? '#ff0055' : '#00ff00'};">${isFainted ? '💀 FAINTED' : 'Lvl ' + (rot.level || 1)}</div>
                ${isCurrent ? '<div style="font-size: 0.55rem; color: #00ff00; font-weight: bold; margin-top: 2px;">(ACTIVE)</div>' : ''}
            </div>
        `;
    });

    gridHtml += `
            </div>
            <button class="btn-action" style="background: #ff0055; color: #fff;" onclick="document.getElementById('battleSwitchModal').style.display='none'">CANCEL</button>
        </div>
    `;

    switchModal.innerHTML = gridHtml;
    switchModal.style.display = 'flex';
};

window.selectNewFighter = function(index) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[index]) return;

    const newRot = playerData.inventory[index];
    if (newRot.fainted) {
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `❌ ${newRot.name} has fainted! Revive them first.`;
        const switchModal = document.getElementById('battleSwitchModal');
        if (switchModal) switchModal.style.display = 'none';
        return;
    }

    playerData.activeFighterIndex = index;
    const fighterLvl = newRot.level || 1;
    let newStats = typeof window.calculateRotStats === 'function' ? window.calculateRotStats(newRot) : {maxHp: 50 + (fighterLvl * 15)};
    
    if (newRot.shiny) {
        newStats.maxHp = Math.floor(newStats.maxHp * 1.3);
    }

    window.maxPlayerHp = newStats.maxHp;
    window.playerHp = window.maxPlayerHp; 

    updatePlayerFighterDisplay(newRot, fighterLvl);
    updateHpBars();

    if (typeof window.saveGameData === 'function') window.saveGameData();

    const switchModal = document.getElementById('battleSwitchModal');
    if (switchModal) switchModal.style.display = 'none';

    const battleLog = document.getElementById('battleLog');
    if (battleLog) battleLog.innerText = `Switched to ${newRot.shiny ? '💎 SHINY ' : ''}${newRot.name}!`;
};

window.battleCatch = function() {
    const battleLog = document.getElementById('battleLog');
    if (window.wildHp > 0) {
        if (battleLog) battleLog.innerText = `You must defeat it first!`;
        return;
    }

    const maxSlots = 100;
    const currentSlots = (typeof playerData !== 'undefined' && playerData.inventory) ? playerData.inventory.length : 0;
    if (currentSlots >= maxSlots) {
        if (battleLog) battleLog.innerText = `🚨 Inventory is full (100 / 100)! Transfer some rots before catching.`;
        alert("🚨 Inventory is full (100 / 100)! Transfer some rots from your inventory before catching more.");
        return;
    }

    if (window.currentWildCreature) {
        if (window.gameAudio && typeof window.gameAudio.playCatch === 'function') {
            window.gameAudio.playCatch();
        }

        const caughtName = window.currentWildCreature.name;
        const caughtLevel = window.currentWildCreature.level;
        const candyKey = caughtName.toUpperCase().trim();

        if (typeof playerData !== 'undefined') {
            if (!playerData.candies) playerData.candies = {};
            playerData.candies[candyKey] = (playerData.candies[candyKey] || 0) + 3;

            let assignedQuality = window.currentWildCreature.quality;
            if (typeof assignedQuality !== 'number' || assignedQuality === 50) {
                assignedQuality = typeof rollRotQuality === 'function' ? rollRotQuality() : Math.floor(Math.random() * 100) + 1;
            }

            const qualityMultiplier = 0.7 + (assignedQuality / 100) * 0.8;
            const baseHp = window.currentWildCreature.baseHp || 50;
            const baseAtk = window.currentWildCreature.baseAtk || 15;
            const baseDef = window.currentWildCreature.baseDef || 10;

            const caughtRot = {
                id: window.currentWildCreature.id,
                name: caughtName,
                rarity: window.currentWildCreature.rarity,
                image: window.currentWildCreature.image,
                level: caughtLevel,
                quality: assignedQuality,
                maxHp: Math.floor((baseHp + (caughtLevel - 1) * 20) * qualityMultiplier),
                hp: Math.floor((baseHp + (caughtLevel - 1) * 20) * qualityMultiplier),
                atk: Math.floor((baseAtk + (caughtLevel - 1) * 5) * qualityMultiplier),
                def: Math.floor((baseDef + (caughtLevel - 1) * 4) * qualityMultiplier),
                shiny: window.currentWildCreature.shiny || false,
                fainted: false,
                inGym: false
            };

            if (!playerData.inventory) playerData.inventory = [];
            playerData.inventory.push(caughtRot);

            if (typeof window.saveGameData === 'function') window.saveGameData();
        }

        if (typeof window.addToDex === 'function') {
            window.addToDex(window.currentWildCreature);
        }

        const mapMarkers = document.querySelectorAll('.leaflet-marker-icon');
        for (let i = 0; i < mapMarkers.length; i++) {
            if (mapMarkers[i].classList.contains('enhanced-player-marker')) continue;
            if (window.currentWildCreature.image && mapMarkers[i].innerHTML.includes(window.currentWildCreature.image)) {
                mapMarkers[i].style.display = 'none'; 
                mapMarkers[i].remove(); 
                break; 
            }
        }

        if (typeof map !== 'undefined' && map && typeof map.closePopup === 'function') {
            map.closePopup();
        }
        const popups = document.querySelectorAll('.leaflet-popup');
        popups.forEach(popup => popup.remove());

        if (typeof window.activeCreatures !== 'undefined' && Array.isArray(window.activeCreatures)) {
            for (let i = window.activeCreatures.length - 1; i >= 0; i--) {
                let c = window.activeCreatures[i];
                if (c === window.currentWildCreature || c.data === window.currentWildCreature) {
                    window.activeCreatures.splice(i, 1); 
                }
            }
        }

        if (battleLog) battleLog.innerText = `Captured Lvl ${caughtLevel} ${window.currentWildCreature.shiny ? '💎 SHINY ' : ''}${caughtName}! (+3 Candy🍬)`;
        window.currentWildCreature = null;
        setTimeout(window.closeBattle, 1500);
    }
};

window.closeBattle = function() {
    const modal = document.getElementById('battleModal');
    if (modal) modal.style.display = 'none';
    const switchModal = document.getElementById('battleSwitchModal');
    if (switchModal) switchModal.style.display = 'none';
};