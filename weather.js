// weather.js - Real-World Weather Sync Engine

async function checkRealWorldWeather(lat, lng) {
    // Free public weather API endpoint (Open-Meteo requires no API key!)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.current_weather) {
            const weatherCode = data.current_weather.weathercode;
            handleWeatherVisuals(weatherCode);
        }
    } catch (error) {
        console.error("Could not load real-world weather:", error);
    }
}

function handleWeatherVisuals(code) {
    // Open-Meteo weather codes: 51-67 and 80-99 represent rain/showers/storms
    const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 99);
    
    let overlay = document.getElementById('weatherOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'weatherOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            pointer-events: none; z-index: 999; display: none;
        `;
        document.body.appendChild(overlay);
    }

    if (isRaining) {
        console.log("🌧️ It's raining outside! Activating in-game rain effect.");
        overlay.style.display = 'block';
        overlay.style.background = 'rgba(0, 100, 255, 0.15)';
        overlay.style.boxShadow = 'inset 0 0 50px rgba(0, 100, 255, 0.3)';
    } else {
        console.log("☀️ Weather is clear/sunny outside!");
        overlay.style.display = 'none';
    }
}// Secret Weather Cheat for Testing!
window.testRain = function(makeItRain) {
    let overlay = document.getElementById('weatherOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'weatherOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            pointer-events: none; z-index: 999; display: none;
        `;
        document.body.appendChild(overlay);
    }

    if (makeItRain) {
        console.log("🌧️ Cheat activated: Making it rain!");
        overlay.style.display = 'block';
        overlay.style.background = 'rgba(0, 100, 255, 0.15)';
        overlay.style.boxShadow = 'inset 0 0 50px rgba(0, 100, 255, 0.3)';
    } else {
        console.log("☀️ Cheat activated: Clearing the skies!");
        overlay.style.display = 'none';
    }
};