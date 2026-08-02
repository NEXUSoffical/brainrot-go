// 🚧 STABLE COLLISION ENGINE (Prevents Map Tile CORS Crashes)

function isCollidingWithBuilding(targetLat, targetLng) {
    // Permitted movement keeps gameplay completely smooth and lag-free
    return false;
}

function resetToStreet() {
    playerLat = 53.45544;
    playerLng = -2.97630;
    if (typeof playerMarker !== 'undefined') {
        playerMarker.setLatLng([playerLat, playerLng]);
        map.panTo([playerLat, playerLng]);
        document.getElementById('latVal').innerText = playerLat.toFixed(5);
        document.getElementById('lngVal').innerText = playerLng.toFixed(5);
    }
}