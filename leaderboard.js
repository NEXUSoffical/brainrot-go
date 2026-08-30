// leaderboard.js - Creator Fee Bounty Tracker & GPS Distance Engine (LIVE FIREBASE DATA)

let lastKnownPos = null;

function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos) => {
        const currentLat = pos.coords.latitude;
        const currentLng = pos.coords.longitude;
        
        if (lastKnownPos) {
            const distanceKm = getHaversineDistance(lastKnownPos.lat, lastKnownPos.lng, currentLat, currentLng);
            if (distanceKm > 0.01 && distanceKm < 1.0) { 
                if (typeof window.playerData !== 'undefined') {
                    window.playerData.distanceWalked = (window.playerData.distanceWalked || 0) + distanceKm;
                    if (typeof window.saveGameData === 'function') window.saveGameData();
                }
            }
        }
        lastKnownPos = { lat: currentLat, lng: currentLng };
    }, (err) => console.warn("GPS Tracking Error:", err), { enableHighAccuracy: true, maximumAge: 5000 });
}

window.currentLeaderboardTab = 'distance';

window.openLeaderboard = function() {
    let existing = document.getElementById('leaderboardModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'leaderboardModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100%; max-height: -webkit-fill-available;
        background: rgba(10, 10, 15, 0.98); backdrop-filter: blur(12px);
        z-index: 999999; display: flex; flex-direction: column; align-items: center;
        color: #fff; font-family: monospace; padding: 20px; box-sizing: border-box; overflow: hidden;
    `;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 600px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #00ccff; padding-bottom: 15px;">
            <div>
                <h2 style="color: #00ccff; font-size: 1.8rem; text-shadow: 0 0 15px rgba(0,204,255,0.6); margin: 0 0 5px 0;">🏆 BOUNTY RANKINGS</h2>
                <p style="font-size: 0.75rem; color: #aaa; margin: 0;">Top 5 in each category earn Creator Fees!</p>
            </div>
            <button onclick="document.getElementById('leaderboardModal').remove()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 40px; height: 40px; font-weight: bold; font-size: 1.2rem; cursor: pointer; box-shadow: 0 0 10px rgba(255,0,85,0.5);">X</button>
        </div>

        <div style="width: 100%; max-width: 600px; display: flex; gap: 10px; margin-top: 15px;">
            <button onclick="switchLeaderboardTab('distance')" style="flex: 1; background: ${window.currentLeaderboardTab === 'distance' ? '#00ccff' : '#222'}; color: ${window.currentLeaderboardTab === 'distance' ? '#000' : '#fff'}; border: 2px solid #00ccff; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer;">👟 DISTANCE</button>
            <button onclick="switchLeaderboardTab('catches')" style="flex: 1; background: ${window.currentLeaderboardTab === 'catches' ? '#ffcc00' : '#222'}; color: ${window.currentLeaderboardTab === 'catches' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer;">👻 CATCHES</button>
        </div>

        <div id="leaderboardList" style="width: 100%; max-width: 600px; flex: 1; overflow-y: auto; margin-top: 20px; display: flex; flex-direction: column; gap: 10px; padding-bottom: 20px;"></div>
    `;
    
    document.body.appendChild(modal);
    renderLeaderboardList();
};

window.switchLeaderboardTab = function(tab) {
    window.currentLeaderboardTab = tab;
    renderLeaderboardList(); 
};

async function renderLeaderboardList() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;

    list.innerHTML = '<div style="text-align: center; color: #aaa; padding: 40px;">Fetching live server data...</div>';

    let competitors = [];
    let sortKey = window.currentLeaderboardTab;

    try {
        // Query the actual Firebase database for all registered accounts
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const snapshot = await firebase.firestore().collection('accounts').get();
            
            snapshot.forEach(doc => {
                let data = doc.data();
                if (data.username) {
                    competitors.push({
                        name: data.username,
                        distance: data.distanceWalked || 0,
                        catches: data.totalCatches || 0,
                        isPlayer: (window.playerData && data.username === window.playerData.username)
                    });
                }
            });
        }
    } catch (err) {
        console.error("Leaderboard fetch error:", err);
    }

    // Fallback: If Firebase fails but local data exists, show the local player so it isn't blank
    if (competitors.length === 0 && window.playerData && window.playerData.username) {
        competitors.push({
            name: window.playerData.username,
            distance: window.playerData.distanceWalked || 0,
            catches: window.playerData.totalCatches || 0,
            isPlayer: true
        });
    }

    let color = sortKey === 'distance' ? '#00ccff' : '#ffcc00';
    let suffix = sortKey === 'distance' ? ' km' : '';

    // Sort by the currently selected tab
    competitors.sort((a, b) => b[sortKey] - a[sortKey]);

    list.innerHTML = '';
    
    if (competitors.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #777; padding: 40px;">No hunters found on the network.</div>';
        return;
    }

    competitors.forEach((user, index) => {
        let rank = index + 1;
        let isTop5 = rank <= 5;
        
        let tierTag = isTop5 ? '<div style="font-size: 0.7rem; color: #00ff80; text-transform: uppercase; margin-top: 2px; font-weight: bold;">💰 CREATOR FEE TIER</div>' : '';
        
        let card = document.createElement('div');
        card.style.cssText = `
            background: ${user.isPlayer ? 'rgba(255,255,255,0.1)' : '#16161a'};
            border: 2px solid ${isTop5 ? color : '#333'};
            border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between;
            box-shadow: ${isTop5 ? '0 0 15px ' + color + '44' : 'none'};
        `;

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 1.5rem; font-weight: bold; color: ${isTop5 ? color : '#777'}; width: 30px;">#${rank}</div>
                <div>
                    <div style="font-weight: bold; font-size: 1.1rem; color: ${user.isPlayer ? '#fff' : '#ddd'};">${user.name}</div>
                    ${tierTag}
                </div>
            </div>
            <div style="font-size: 1.5rem; font-weight: bold; color: ${color};">
                ${sortKey === 'distance' ? user[sortKey].toFixed(2) : user[sortKey]}${suffix}
            </div>
        `;
        list.appendChild(card);
    });
}