// dex.js - Cloud-Connected Account Management, Full-Screen Sticker Dex & Admin System

if (typeof window.isSignUpMode === 'undefined') {
    window.isSignUpMode = false;
}
if (typeof window.selectedStarter === 'undefined') {
    window.selectedStarter = null;
}
if (typeof window.currentDexTab === 'undefined') {
    window.currentDexTab = 'standard';
}

// ==========================================
// 📖 THE COMPLETE 50-ENTITY LORE DATABASE 📖
// ==========================================
window.beastLoreDatabase = {
    // 🟢 TIER 1 (COMMON)
    "Goblin": { origin: "European Folklore", class: "Subterranean Trickster", story: "Greedy, chaotic little creatures that dwell in dark caves and underground tunnels. They love hoarding shiny trinkets, causing headaches for travelers, and setting traps in the dark." },
    "Kappa": { origin: "Japanese Folklore", class: "Aquatic Yokai", story: "A reptilian humanoid that inhabits the ponds and rivers of Japan. They have a bowl-like depression on their heads filled with water, which is the source of their incredible power." },
    "Chupacabra": { origin: "Latin American Folklore", class: "Cryptid Predator", story: "The infamous 'goat-sucker.' A terrifying, spine-backed beast that prowls the night, completely draining livestock of their blood before vanishing back into the shadows." },
    "Kelpie": { origin: "Scottish Mythology", class: "Shape-Shifting Water Spirit", story: "A malevolent aquatic entity that takes the form of a beautiful, tame horse. It tricks weary travelers onto its back before its skin becomes adhesive, dragging them down to a watery grave." },
    "Gremlin": { origin: "20th Century Aviation Lore", class: "Mechanical Saboteur", story: "Mischievous little creatures that specifically love to dismantle, break, and sabotage complex machinery—especially airplanes, engines, and modern electronics." },
    "Imp": { origin: "Germanic Folklore", class: "Minor Demon", story: "Tiny, chaotic entities that are more annoying than truly dangerous. They thrive on playing pranks, hiding important items, and tripping people when they aren't looking." },
    "Boggart": { origin: "English Folklore", class: "Household Poltergeist", story: "A malicious household spirit that causes things to disappear, milk to sour, and dogs to go lame. They hide in dark cupboards and under beds, waiting to strike." },
    "Puca": { origin: "Celtic Mythology", class: "Shape-Shifting Fae", story: "Mischievous and unpredictable spirits of the mountains and hills. They can take the form of wild dark horses, goats, or hares. They are chaotic neutral—sometimes bringing great fortune, and sometimes leading travelers to a muddy doom." },
    "PÃºca": { origin: "Celtic Mythology", class: "Shape-Shifting Fae", story: "Mischievous and unpredictable spirits of the mountains and hills. They can take the form of wild dark horses, goats, or hares. They are chaotic neutral—sometimes bringing great fortune, and sometimes leading travelers to a muddy doom." },
    "Satyr": { origin: "Greek Mythology", class: "Woodland Spirit", story: "Wild nature spirits with the upper half of a man and the lower half of a goat. They live in the deep woods and love wine, music, playing the flute, and causing chaotic revelry." },
    "Jackalope": { origin: "North American Folklore", class: "Fearsome Critter", story: "A strange creature of the American West described as a large jackrabbit with antelope horns. It is said they can perfectly mimic human voices to throw hunters off their trail." },

    // 🟡 TIER 2 (UNCOMMON)
    "Vampire": { origin: "Eastern Europe", class: "Undead Blood-Drinker", story: "Aristocratic creatures of the night that sustain their immortality by draining the life essence from the living. They possess superhuman strength, can command creatures of the dark, and despise sunlight." },
    "Werewolf": { origin: "European Folklore", class: "Lycanthrope", story: "Humans cursed to transform into ravenous, bloodthirsty wolf-beasts beneath the light of the full moon. They are apex predators bound only by an aversion to silver." },
    "Wendigo": { origin: "Algonquian Folklore", class: "Cursed Spirit", story: "A terrifying, emaciated spirit of the frozen north. Born from the desperation of winter starvation, it possesses an insatiable, endless hunger for human flesh that can never be satisfied." },
    "Minotaur": { origin: "Greek Mythology", class: "Labyrinth Guardian", story: "A hulking, unstoppable beast with the head of a raging bull and the muscular body of a man. It originally dwelled in the dark center of the great Labyrinth of Crete." },
    "Siren": { origin: "Greek Mythology", class: "Oceanic Manipulator", story: "Dangerous and beautiful sea creatures who lure nearby sailors to shipwreck on the rocky coast of their island with their enchanting music and hypnotic singing voices." },
    "Harpy": { origin: "Greek Mythology", class: "Avian Terror", story: "Fierce, half-human and half-bird personifications of storm winds. They are known as the 'hounds of Zeus,' violently snatching away people and food from the earth." },
    "Banshee": { origin: "Irish Mythology", class: "Omen Spirit", story: "A wailing female spirit whose mournful scream is considered a terrible omen. Legend says that if you hear her piercing cry echoing through the night, someone close to you is out of time." },
    "Chimaera": { origin: "Greek Mythology", class: "Hybrid Monstrosity", story: "A terrifying, fire-breathing amalgam of a lion, a goat, and a serpent. Its chaotic biology makes it an unpredictable and incredibly lethal predator." },
    "Skinwalker": { origin: "Navajo Folklore", class: "Dark Shaman", story: "A malevolent witch capable of possessing, disguising themselves as, or terrifyingly mimicking animals. They are masters of psychological terror and dark magic." },
    "Tengu": { origin: "Japanese Folklore", class: "Mountain Yokai", story: "Fearsome avian humanoids and legendary martial artists who fiercely guard their mountain domains. They are known to possess supernatural speed and swordsmanship." },

    // 🔵 TIER 3 (RARE)
    "Griffin": { origin: "Ancient Middle East", class: "Majestic Apex Hybrid", story: "A noble but deadly beast possessing the body of a lion and the head and wings of a giant eagle. They are known to hoard gold and fiercely protect ancient treasures." },
    "Manticore": { origin: "Persian Mythology", class: "Lethal Chimera", story: "A nightmarish predator with a lion's body, a human face, and a scorpion's tail that shoots venomous spines. It devours its prey whole, leaving absolutely nothing behind." },
    "Basilisk": { origin: "European Bestiaries", class: "Serpent King", story: "A highly venomous reptilian horror capable of killing with a single, petrifying glance. Even the trails it leaves behind are considered lethally toxic." },
    "Cyclops": { origin: "Greek Mythology", class: "One-Eyed Giant", story: "A towering, primitive behemoth possessing immense physical strength and a single eye in the center of its forehead. They are masterful, albeit brutal, blacksmiths." },
    "Rakshasa": { origin: "Hindu Mythology", class: "Shapeshifting Demon", story: "A malevolent, flesh-eating illusionist that sows chaos and feasts on human misery. They are formidable sorcerers known to have toxic fingernails and a hatred of light." },
    "Oni": { origin: "Japanese Folklore", class: "Demonic Brute", story: "A hulking, horned ogre wielding a massive iron club, born from the souls of the deeply wicked. They possess terrifying physical strength and are practically unkillable in melee combat." },
    "Thunderbird": { origin: "Indigenous North American Lore", class: "Storm Avian", story: "A legendary bird of immense size and power, said to create thunder by flapping its wings and shoot lightning from its eyes. It is an elemental force of nature." },
    "Sphinx": { origin: "Egyptian Mythology", class: "Riddling Guardian", story: "An enigmatic creature with a lion's body and a human head that violently devours anyone who fails to solve its riddles. It is a guardian of forbidden knowledge." },
    "Yeti": { origin: "Himalayan Folklore", class: "Cryptid Ape", story: "A massive, elusive hominid that prowls the frozen, highest peaks of the world, crushing those who wander too far into the snowy wilderness." },
    "Nuckelavee": { origin: "Orcadian Mythology", class: "Plagued Flesh-Demon", story: "A horrific, skinless fusion of man and horse that rises from the sea to spread plague, drought, and death. Its breath alone wilts crops and sickens livestock." },

    // 🟣 TIER 4 (EPIC)
    "Kraken": { origin: "Scandinavian Folklore", class: "Deep Sea Terror", story: "A colossal cephalopod capable of dragging entire warships and their screaming crews down into the abyssal depths. When it submerges, it creates a whirlpool that consumes everything." },
    "Hydra": { origin: "Greek Mythology", class: "Regenerating Serpent", story: "A toxic, multi-headed reptilian horror. Cut off one head, and two more will violently erupt from the bloody stump to take its place." },
    "Cerberus": { origin: "Greek Mythology", class: "Underworld Hound", story: "The fearsome, three-headed demonic dog that stands eternal guard at the gates of the Underworld, ensuring the dead can never leave, and the living can never enter." },
    "Roc": { origin: "Middle Eastern Mythology", class: "Colossal Avian", story: "A bird of prey so astronomically massive it blocks out the sun when it flies, and can effortlessly carry off fully grown elephants to feed its monstrous young." },
    "Tarasque": { origin: "French Folklore", class: "Armored Beast", story: "A devastating six-legged chimera possessing a lion's head, a spiked turtle's shell, and a scorpion's sting. Its armor is said to be completely impenetrable by mortal weapons." },
    "Scylla": { origin: "Greek Mythology", class: "Strait Fiend", story: "A multi-headed sea monstrosity adorned with a belt of snarling dogs, snatching sailors directly from the decks of passing ships as they attempt to navigate her deadly strait." },
    "Charybdis": { origin: "Greek Mythology", class: "Abyssal Maw", story: "A monstrous entity synonymous with a lethal, ship-swallowing whirlpool. It inhales the ocean itself, consuming entire fleets before violently spitting the wreckage back out." },
    "Qilin": { origin: "Chinese Mythology", class: "Divine Chimera", story: "A celestial, hooved beast draped in holy fire. Despite its fearsome, dragon-like appearance, it is a harbinger of prosperity, striking only at the truly wicked." },
    "Gashadokuro": { origin: "Japanese Folklore", class: "Starving Skeleton", story: "A gigantic, rattling skeleton formed from the bones of those who died of starvation. It wanders the countryside, biting the heads off lone travelers in the dead of night." },
    "Grootslang": { origin: "South African Mythology", class: "Primordial Serpent", story: "An ancient, elephant-sized serpent created by the gods. Realizing they made it too powerful, the gods locked it away in a deep diamond cave, but it managed to escape." },

    // 🌟 TIER 5 (SECRET / WORLD-ENDERS)
    "Typhon": { origin: "Greek Mythology", class: "Father of All Monsters", story: "A cosmic terror so immense that his head brushes the stars. With a hundred dragon heads and burning eyes, he is a world-ender who once successfully challenged the gods themselves." },
    "Behemoth": { origin: "Biblical Lore", class: "Primordial Land Beast", story: "An unstoppable, earth-shaking titan of muscle and bone. Its bones are like tubes of bronze, and its very footsteps are capable of reshaping the continental landscape." },
    "Jormungandr": { origin: "Norse Mythology", class: "World Serpent", story: "An apocalyptic sea serpent so colossally massive that it wraps around the entire planet, grasping its own tail. When it lets go, the world will end." },
    "JÃ¶rmungandr": { origin: "Norse Mythology", class: "World Serpent", story: "An apocalyptic sea serpent so colossally massive that it wraps around the entire planet, grasping its own tail. When it lets go, the world will end." },
    "Cipactli": { origin: "Aztec Mythology", class: "Primeval Leviathan", story: "A primeval sea monster, part crocodilian, part fish, and part toad. Always hungry, every single joint on its massive body is adorned with an extra, snapping mouth." },
    "Tiamat": { origin: "Mesopotamian Mythology", class: "Draconic Goddess", story: "The primordial goddess of the salt sea, taking the form of an apocalyptic dragon. She birthed the first generation of monsters to wage war upon the heavens." },
    "Leviathan": { origin: "Biblical Lore", class: "Apex Deep-Dweller", story: "An unstoppable, armored sea serpent whose breath boils the ocean and whose golden eyes illuminate the darkest, crushing depths of the abyssal trenches." },
    "Bakunawa": { origin: "Philippine Mythology", class: "Moon-Eater", story: "A gargantuan, serpentine dragon of the deep sea that rises into the night sky to swallow the moon whole, plunging the entire world into a terrifying, blood-red eclipse." },
    "Vritra": { origin: "Hindu Mythology", class: "Dragon of Drought", story: "An adversarial, world-strangling serpent that hoards all the fresh waters of the earth, unleashing devastating global droughts and eternal cosmic darkness." },
    "Apophis": { origin: "Egyptian Mythology", class: "Chaos Serpent", story: "The ultimate embodiment of darkness and void. A cosmic snake that eternally battles the sun god every single night, attempting to plunge the mortal world into eternal night." },
    "Fenrir": { origin: "Norse Mythology", class: "Apocalyptic Wolf", story: "A terrifyingly massive wolf bound by the gods out of sheer fear. It is destined to break its unyielding chains and swallow the world during the events of Ragnarok." }
};


if (!window._internalPlayerData) {
    window._internalPlayerData = {
        username: "",
        rotBalance: 500,
        accountLevel: 1,
        accountXp: 0,
        dex: [],         
        shinyDex: [],    
        inventory: [],   
        activeFighterIndex: 0,
        revivePotions: 3,
        luckyEggs: 0,
        maxInventorySlots: 100
    };
}

if (!window.playerData) {
    window.playerData = new Proxy(window._internalPlayerData, {
        set(target, property, value) {
            if (property === 'rotBalance' && value > (target.rotBalance + 10000)) {
                console.warn("ANTI-CHEAT: Unauthorized balance modification blocked!");
                alert("Nice try! Anti-cheat blocked your hack.");
                return false;
            }
            target[property] = value;
            if (typeof window.saveGameData === 'function') {
                window.saveGameData();
            }
            return true;
        }
    });
}

function setPlayerData(newData) {
    window._internalPlayerData.username = newData.username || window._internalPlayerData.username || "";
    window._internalPlayerData.rotBalance = typeof newData.rotBalance !== 'undefined' ? newData.rotBalance : (window._internalPlayerData.rotBalance || 500);
    
    const incomingLevel = newData.accountLevel || newData.accLvl || 1;
    window._internalPlayerData.accountLevel = Math.max(1, incomingLevel);
    
    let incomingXp = typeof newData.accountXp !== 'undefined' ? newData.accountXp : 0;
    let currentLevel = window._internalPlayerData.accountLevel;
    let requiredXp = currentLevel * 250;
    
    while (incomingXp >= requiredXp) {
        incomingXp -= requiredXp;
        currentLevel++;
        requiredXp = currentLevel * 250;
    }
    
    window._internalPlayerData.accountLevel = currentLevel;
    window._internalPlayerData.accountXp = incomingXp;

    window._internalPlayerData.dex = newData.dex || window._internalPlayerData.dex || [];
    window._internalPlayerData.shinyDex = newData.shinyDex || window._internalPlayerData.shinyDex || [];
    window._internalPlayerData.inventory = newData.inventory || window._internalPlayerData.inventory || [];
    window._internalPlayerData.activeFighterIndex = typeof newData.activeFighterIndex !== 'undefined' ? newData.activeFighterIndex : (window._internalPlayerData.activeFighterIndex || 0);
    window._internalPlayerData.revivePotions = typeof newData.revivePotions !== 'undefined' ? newData.revivePotions : (window._internalPlayerData.revivePotions || 3);
    window._internalPlayerData.luckyEggs = typeof newData.luckyEggs !== 'undefined' ? newData.luckyEggs : (window._internalPlayerData.luckyEggs || 0);
    window._internalPlayerData.maxInventorySlots = typeof newData.maxInventorySlots !== 'undefined' ? newData.maxInventorySlots : (window._internalPlayerData.maxInventorySlots || 100);
}

window.addAccountXp = function(amount) {
    const hasLuckyEgg = window.activeLuckyEggTime && Date.now() < window.activeLuckyEggTime;
    const finalXp = hasLuckyEgg ? amount * 2 : amount;

    window._internalPlayerData.accountXp = (window._internalPlayerData.accountXp || 0) + finalXp;
    
    let currentLevel = window._internalPlayerData.accountLevel || 1;
    let requiredXp = currentLevel * 250;
    
    while (window._internalPlayerData.accountXp >= requiredXp) {
        window._internalPlayerData.accountXp -= requiredXp;
        window._internalPlayerData.accountLevel = (window._internalPlayerData.accountLevel || 1) + 1;
        currentLevel = window._internalPlayerData.accountLevel;
        requiredXp = currentLevel * 250;
    }

    window.saveGameData();
    updateHUD();
};

window.saveGameData = async function() {
    if (!window._internalPlayerData) return;
    if (typeof firebase === 'undefined') return;
    
    if (!window._internalPlayerData.username) {
        window._internalPlayerData.username = "player";
    }

    try {
        const cleanDataString = JSON.stringify(window._internalPlayerData, (key, value) => {
            if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
            return value;
        });

        localStorage.setItem('brainrot_local_backup', cleanDataString);

        const cleanDataObject = JSON.parse(cleanDataString);
        await firebase.firestore().collection('accounts').doc(window._internalPlayerData.username).set(cleanDataObject);
        localStorage.setItem('brainrot_logged_in_user', window._internalPlayerData.username);
    } catch (err) {
        console.warn("Cloud save skipped/failed, saved locally instead:", err);
    }
};

window.loadGameData = async function() {
    let localData = null;
    const localBackup = localStorage.getItem('brainrot_local_backup');
    if (localBackup) {
        try {
            localData = JSON.parse(localBackup);
            setPlayerData(localData);
        } catch (e) {
            console.error("Error reading local backup", e);
        }
    }

    const activeUser = localStorage.getItem('brainrot_logged_in_user');
    if (activeUser && activeUser !== "player" && typeof firebase !== 'undefined') {
        try {
            const doc = await firebase.firestore().collection('accounts').doc(activeUser).get();
            if (doc.exists) {
                const cloudData = doc.data();
                
                const mergedDex = Array.from(new Set([...(localData?.dex || []), ...(cloudData.dex || [])]));
                const mergedShinyDex = Array.from(new Set([...(localData?.shinyDex || []), ...(cloudData.shinyDex || [])]));
                
                let localInv = localData?.inventory || [];
                let cloudInv = cloudData.inventory || [];
                let finalInventory = localInv.length >= cloudInv.length ? localInv : cloudInv;

                const bestAccountLevel = Math.max(
                    cloudData.accountLevel || cloudData.accLvl || 1, 
                    localData?.accountLevel || localData?.accLvl || 1,
                    window._internalPlayerData.accountLevel || 1
                );

                const bestAccountXp = Math.max(
                    cloudData.accountXp || 0,
                    localData?.accountXp || 0,
                    window._internalPlayerData.accountXp || 0
                );

                const cloudRevives = typeof cloudData.revivePotions !== 'undefined' ? cloudData.revivePotions : 3;
                const localRevives = typeof localData?.revivePotions !== 'undefined' ? localData.revivePotions : 3;
                const bestRevives = Math.min(cloudRevives, localRevives);

                const cloudEggs = typeof cloudData.luckyEggs !== 'undefined' ? cloudData.luckyEggs : 0;
                const localEggs = typeof localData?.luckyEggs !== 'undefined' ? localData.luckyEggs : 0;
                const bestEggs = Math.min(cloudEggs, localEggs);

                const bestSlots = Math.max(cloudData.maxInventorySlots || 100, localData?.maxInventorySlots || 100);

                setPlayerData({
                    username: cloudData.username || activeUser,
                    rotBalance: Math.max(cloudData.rotBalance || 0, localData?.rotBalance || 0),
                    accountLevel: bestAccountLevel,
                    accountXp: bestAccountXp,
                    dex: mergedDex,
                    shinyDex: mergedShinyDex,
                    inventory: finalInventory,
                    activeFighterIndex: cloudData.activeFighterIndex || localData?.activeFighterIndex || 0,
                    revivePotions: bestRevives,
                    luckyEggs: bestEggs,
                    maxInventorySlots: bestSlots
                });
            }
        } catch (err) {
            console.error("Error restoring session from cloud:", err);
        }
    }

    if (!window.playerData.dex) window.playerData.dex = [];
    if (!window.playerData.shinyDex) window.playerData.shinyDex = [];
    if (!window.playerData.inventory) window.playerData.inventory = [];
};

(async function checkExistingSession() {
    await window.loadGameData();
    if (window._internalPlayerData.username && window._internalPlayerData.username !== "player") {
        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('loginModal');
            if (modal) modal.style.display = 'none';
            updateHUD();
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    setupStarterOptions();
    updateHUD();
});

window.toggleAuthMode = function() {
    window.isSignUpMode = !window.isSignUpMode;
    const starterSec = document.getElementById('starterSection');
    const toggleText = document.getElementById('loginToggleText');
    
    if (window.isSignUpMode) {
        if (starterSec) starterSec.style.display = 'block';
        if (toggleText) toggleText.innerText = "Already have an account? Click here to Log In";
    } else {
        if (starterSec) starterSec.style.display = 'none';
        if (toggleText) toggleText.innerText = "New player? Click here to Sign Up";
    }
};

function setupStarterOptions() {
    const grid = document.getElementById('starterSelectionGrid');
    const sourceList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters.length) ? brainrotCharacters : []);
    
    if (!grid || !sourceList.length) {
        setTimeout(setupStarterOptions, 200);
        return;
    }

    grid.innerHTML = '';
    const starters = sourceList.slice(0, 6);
    window.selectedStarter = starters[0];

    starters.forEach((char, index) => {
        const item = document.createElement('div');
        item.className = `starter-option ${index === 0 ? 'selected' : ''}`;
        item.innerHTML = `
            <div style="width: 36px; height: 36px; background: #fff; border-radius: 4px; overflow: hidden; margin-bottom: 2px;">
                <img src="${char.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 7.5px; color: #fff; text-align: center;">${char.name}</span>
        `;
        item.onclick = () => {
            document.querySelectorAll('.starter-option').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            window.selectedStarter = char;
        };
        grid.appendChild(item);
    });
}

window.handleAccountAction = async function() {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    
    const rawUsername = usernameInput ? usernameInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!rawUsername || !password) {
        alert("Please enter both username and password!");
        return;
    }

    const email = rawUsername + "@brainrotgo.com";

    try {
        if (window.isSignUpMode) {
            await firebase.auth().createUserWithEmailAndPassword(email, password);

            const sourceList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters.length) ? brainrotCharacters : []);

            if (!window.selectedStarter && sourceList.length > 0) {
                window.selectedStarter = sourceList[0];
            }

            const starterInstance = {
                ...window.selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50,
                shiny: false
            };

            setPlayerData({
                username: rawUsername,
                rotBalance: 500,
                accountLevel: 1,
                accountXp: 0,
                dex: [window.selectedStarter.name],
                shinyDex: [],
                inventory: [starterInstance],
                activeFighterIndex: 0,
                revivePotions: 3,
                luckyEggs: 0,
                maxInventorySlots: 100
            });

            await window.saveGameData();
            alert(`Account created successfully! Welcome, ${rawUsername}!`);
        } else {
            await firebase.auth().signInWithEmailAndPassword(email, password);

            const docRef = firebase.firestore().collection('accounts').doc(rawUsername);
            const doc = await docRef.get();

            if (doc.exists) {
                setPlayerData(doc.data());
                if (!window.playerData.dex) window.playerData.dex = [];
                if (!window.playerData.shinyDex) window.playerData.shinyDex = [];
                if (!window.playerData.inventory) window.playerData.inventory = [];
            }
            
            localStorage.setItem('brainrot_logged_in_user', rawUsername);
        }

        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        updateHUD();
    } catch (err) {
        console.error("Authentication error:", err);
        if (err.code === 'auth/email-already-in-use') {
            alert("Username already exists! Please log in instead.");
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            alert("Invalid username or password!");
        } else {
            alert("Error: " + err.message);
        }
    }
};

window.signInWithGoogle = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        const rawUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const docRef = firebase.firestore().collection('accounts').doc(rawUsername);
        const doc = await docRef.get();

        if (!doc.exists) {
            const sourceList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters.length) ? brainrotCharacters : []);
            
            if (!window.selectedStarter && sourceList.length > 0) {
                window.selectedStarter = sourceList[0];
            }

            const starterInstance = {
                ...window.selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50,
                shiny: false
            };

            setPlayerData({
                username: rawUsername,
                rotBalance: 500,
                accountLevel: 1,
                accountXp: 0,
                dex: [window.selectedStarter.name],
                shinyDex: [],
                inventory: [starterInstance],
                activeFighterIndex: 0,
                revivePotions: 3,
                luckyEggs: 0,
                maxInventorySlots: 100
            });

            const cleanDataString = JSON.stringify(window._internalPlayerData, (key, value) => {
                if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
                return value;
            });
            await docRef.set(JSON.parse(cleanDataString));
        } else {
            setPlayerData(doc.data());
            if (!window.playerData.dex) window.playerData.dex = [];
            if (!window.playerData.shinyDex) window.playerData.shinyDex = [];
            if (!window.playerData.inventory) window.playerData.inventory = [];
        }

        localStorage.setItem('brainrot_logged_in_user', rawUsername);
        
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        updateHUD();

    } catch (err) {
        console.error("Google Auth Error:", err);
        alert("Error signing in with Google. Make sure popups aren't blocked!");
    }
};

window.logoutAccount = async function() {
    localStorage.removeItem('brainrot_logged_in_user');
    localStorage.removeItem('brainrot_local_backup');
    window._internalPlayerData.username = "";
    
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }
    } catch (e) {
        console.warn("Firebase signout error:", e);
    }
    
    window.location.href = window.location.pathname;
};

window.addToDex = function(creature) {
    if (!window.playerData.inventory) window.playerData.inventory = [];
    
    const maxSlots = window.playerData.maxInventorySlots || 100;
    if (window.playerData.inventory.length >= maxSlots) {
        alert(`Inventory is full! (${window.playerData.inventory.length}/${maxSlots}). Transfer entities or upgrade your storage.`);
        return;
    }

    if (!window.playerData.dex) window.playerData.dex = [];
    if (!window.playerData.shinyDex) window.playerData.shinyDex = [];

    const rotLevel = creature.level || 1;
    const rotMaxHp = creature.maxHp || (50 + (rotLevel - 1) * 12);
    const isShiny = creature.shiny === true;

    window.playerData.inventory.push({
        ...creature,
        marker: undefined,
        level: rotLevel,
        xp: creature.xp || 0,
        maxHp: rotMaxHp,
        hp: rotMaxHp,
        shiny: isShiny
    });

    if (isShiny) {
        if (!window.playerData.shinyDex.includes(creature.name)) {
            window.playerData.shinyDex.push(creature.name);
        }
    } else {
        if (!window.playerData.dex.includes(creature.name)) {
            window.playerData.dex.push(creature.name);
        }
    }

    window.addAccountXp(20);
    window.saveGameData();
    updateHUD();
};

window.getRarityColor = function(rarity) {
    switch ((rarity || '').toLowerCase()) {
        case 'secret': return '#ff00ea';
        case 'mythic': return '#9900ff';
        case 'legendary': return '#ffaa00';
        case 'epic': return '#0088ff';
        case 'rare': return '#00cc44';
        case 'uncommon': return '#cccc00';
        default: return '#888888';
    }
};

function updateHUD() {
    const dexCountEl = document.getElementById('dexCount');
    const totalBrainrotsEl = document.getElementById('totalBrainrots');
    const inventoryCountEl = document.getElementById('inventoryCount');
    const rotBalanceEl = document.getElementById('rotBalance');
    const hudTitle = document.getElementById('hudTitle');
    const accLvlEls = document.querySelectorAll('#accLvl, .accLvlDisplay, #accountLevelVal, #widgetAccLevel');
    const widgetXpBar = document.getElementById('widgetXpBar');
    const widgetXpText = document.getElementById('widgetXpText');

    const masterList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters : []);
    const totalPossible = masterList.length;
    
    const dexCount = (window.currentDexTab === 'shiny') 
        ? ((window.playerData.shinyDex) ? window.playerData.shinyDex.length : 0)
        : ((window.playerData.dex) ? window.playerData.dex.length : 0);

    const inventoryCount = (window.playerData.inventory) ? window.playerData.inventory.length : 0;

    if (dexCountEl) dexCountEl.innerText = dexCount;
    if (totalBrainrotsEl) totalBrainrotsEl.innerText = totalPossible;
    if (inventoryCountEl) inventoryCountEl.innerText = inventoryCount;
    if (rotBalanceEl) rotBalanceEl.innerText = window.playerData.rotBalance || 500;
    if (hudTitle && window.playerData.username) hudTitle.innerText = `📺 ${window.playerData.username.toUpperCase()}`;
    
    const currentLevel = window.playerData.accountLevel || 1;
    const currentXp = window.playerData.accountXp || 0;
    const requiredXp = currentLevel * 250;
    
    const xpPercent = Math.min(100, Math.max(0, (currentXp / requiredXp) * 100));

    accLvlEls.forEach(el => {
        el.innerText = currentLevel;
    });

    if (widgetXpBar) {
        widgetXpBar.style.width = xpPercent + '%';
    }

    if (widgetXpText) {
        widgetXpText.innerText = `${currentXp} / ${requiredXp}`;
    }

    const widgetUsername = document.getElementById('widgetUsername');
    if (widgetUsername && window.playerData.username) {
        widgetUsername.innerText = window.playerData.username;
    }

    if (typeof renderInventoryGrid === 'function') renderInventoryGrid();
    renderDexGrid();
    updatePotionHud();
}

window.updatePotionHud = function() {
    const potionHudCount = document.getElementById('potionHudCount');
    if (potionHudCount && window.playerData) {
        potionHudCount.innerText = window.playerData.revivePotions || 0;
    }
};

window.switchDexTab = function(tabName) {
    window.currentDexTab = tabName;
    renderDexGrid();
    
    const dexCountEl = document.getElementById('dexCount');
    if (dexCountEl) {
        if (tabName === 'shiny') {
            dexCountEl.innerText = (window.playerData.shinyDex) ? window.playerData.shinyDex.length : 0;
        } else {
            dexCountEl.innerText = (window.playerData.dex) ? window.playerData.dex.length : 0;
        }
    }
};

function renderDexGrid() {
    const dexGrid = document.getElementById('dexGrid');
    
    const masterList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters : null);
    
    if (!dexGrid || !masterList) return;

    dexGrid.innerHTML = '';
    const isShinyTab = window.currentDexTab === 'shiny';
    const unlockedDex = isShinyTab ? (window.playerData.shinyDex || []) : (window.playerData.dex || []);

    masterList.forEach((char) => {
        const isUnlocked = unlockedDex.includes(char.name);
        const rarityColor = window.getRarityColor(char.rarity);
        
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${isUnlocked ? (isShinyTab ? 'linear-gradient(180deg, #111, #00ffff33)' : `linear-gradient(180deg, #111, ${rarityColor}33)`) : '#111'};
            border: 2px solid ${isUnlocked ? (isShinyTab ? '#00ffff' : rarityColor) : '#333'};
            border-radius: 12px;
            padding: 8px;
            text-align: center;
            opacity: ${isUnlocked ? '1' : '0.4'};
            box-shadow: ${isUnlocked && isShinyTab ? '0 0 10px rgba(0,255,255,0.4)' : (isUnlocked ? `0 0 10px ${rarityColor}44` : 'none')};
            transition: transform 0.2s, box-shadow 0.2s;
            ${isUnlocked ? 'cursor: pointer;' : ''}
        `;

        if (isUnlocked) {
            const safeName = char.name.replace(/'/g, "\\'");
            card.setAttribute('onclick', `openDexLoreModal('${safeName}')`);
            
            card.onmouseover = () => { card.style.transform = 'scale(1.05)'; card.style.boxShadow = `0 0 20px ${isShinyTab ? '#00ffff' : rarityColor}`; };
            card.onmouseout = () => { card.style.transform = 'scale(1)'; card.style.boxShadow = `0 0 10px ${isShinyTab ? 'rgba(0,255,255,0.4)' : rarityColor + '44'}`; };

            card.innerHTML = `
                ${isShinyTab ? '<div style="font-size: 0.6rem; color: #00ffff; font-family: monospace; font-weight: bold; margin-bottom: 2px;">💎 SHINY</div>' : ''}
                <div style="font-size: 0.75rem; font-weight: bold; color: ${isShinyTab ? '#00ffff' : rarityColor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${char.name}</div>
                <div style="font-size: 0.65rem; color: #888; margin-bottom: 4px;">${(char.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
                    <img src="${char.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.8)) ${isShinyTab ? 'brightness(1.2) contrast(2)' : ''};" onerror="this.style.display='none';">
                </div>
                <div style="font-size: 0.6rem; color: #fff; background: rgba(255,255,255,0.1); border-radius: 4px; padding: 3px; font-weight: bold; margin-top: 5px;">🔍 READ LORE</div>
            `;
        } else {
            card.innerHTML = `
                <div style="font-size: 0.75rem; font-weight: bold; color: #666; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">???</div>
                <div style="font-size: 0.65rem; color: #888; margin-bottom: 4px;">${(char.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; margin-bottom: 6px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 1.8rem; color: #444; font-weight: bold;">🔒</span>
                </div>
                <div style="font-size: 0.65rem; color: #555; font-weight: bold;">LOCKED</div>
            `;
        }

        dexGrid.appendChild(card);
    });
}

// ==========================================
// 🔍 LORE MODAL SYSTEM 🔍
// ==========================================
window.openDexLoreModal = function(beastName) {
    const masterList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters : []);
    const char = masterList.find(c => c.name === beastName);
    
    if (!char) return; // Failsafe

    // Clean name for database lookup (e.g. "Púca" -> "Puca")
    const cleanName = beastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Grab lore from DB, checking both clean and exact strings just in case!
    const lore = window.beastLoreDatabase[cleanName] || window.beastLoreDatabase[beastName] || {
        origin: "The Spirit Realm",
        class: "Unknown Entity",
        story: "A highly mysterious entity pulled through the rift. Very little is currently known about its history or true motives, but its paranormal energy signature is undeniably powerful."
    };

    const rarityColor = window.getRarityColor(char.rarity);
    const isShinyTab = window.currentDexTab === 'shiny';

    let loreModal = document.getElementById('dexLoreModal');
    if (!loreModal) {
        loreModal = document.createElement('div');
        loreModal.id = 'dexLoreModal';
        document.body.appendChild(loreModal);
    }

    loreModal.style.cssText = `
        position: fixed !important; top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100vh !important;
        background: rgba(5, 2, 10, 0.96) !important;
        z-index: 99999999 !important; /* Above everything */
        display: flex !important; align-items: center !important; justify-content: center !important;
        padding: 20px !important; box-sizing: border-box !important;
        backdrop-filter: blur(5px);
    `;

    loreModal.innerHTML = `
        <div style="background: #111; border: 2px solid ${isShinyTab ? '#00ffff' : rarityColor}; border-radius: 15px; width: 100%; max-width: 500px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 40px ${isShinyTab ? 'rgba(0,255,255,0.4)' : rarityColor + '66'}; position: relative;">
            
            <!-- Close Button -->
            <button onclick="document.getElementById('dexLoreModal').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: #fff; border: 2px solid #555; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer; font-size: 1.1rem; z-index: 10;">X</button>

            <!-- Image Header Area -->
            <div style="width: 100%; height: 220px; background: radial-gradient(circle, ${isShinyTab ? 'rgba(0,255,255,0.2)' : rarityColor + '33'} 0%, #000 100%); display: flex; align-items: center; justify-content: center; border-bottom: 2px solid #333; position: relative; overflow: hidden;">
                ${isShinyTab ? '<div style="position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.6); padding: 5px 10px; border-radius: 6px; border: 1px solid #00ffff; color: #00ffff; font-family: monospace; font-weight: bold; font-size: 0.8rem;">💎 SHINY VARIANT</div>' : ''}
                <img src="${char.image}" style="max-height: 180px; max-width: 80%; object-fit: contain; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.9)) ${isShinyTab ? 'brightness(1.2) contrast(2)' : ''};">
            </div>

            <!-- Lore Content Area -->
            <div style="padding: 25px; font-family: monospace; text-align: left;">
                <div style="font-size: 0.9rem; color: ${isShinyTab ? '#00ffff' : rarityColor}; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; margin-bottom: 5px;">FILE: ${(char.rarity || 'common').toUpperCase()}</div>
                <h2 style="margin: 0 0 15px 0; color: #fff; font-size: 2.2rem; text-shadow: 0 0 10px ${isShinyTab ? '#00ffff' : rarityColor}; text-transform: uppercase;">${char.name}</h2>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border-left: 4px solid #00ccff;">
                        <span style="color: #00ccff; font-weight: bold; font-size: 0.8rem;">📍 ORIGIN</span>
                        <div style="color: #fff; font-size: 1rem; margin-top: 4px;">${lore.origin}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border-left: 4px solid #ff0055;">
                        <span style="color: #ff0055; font-weight: bold; font-size: 0.8rem;">🧬 CLASS</span>
                        <div style="color: #fff; font-size: 1rem; margin-top: 4px;">${lore.class}</div>
                    </div>
                </div>

                <div style="color: #ccc; font-size: 0.95rem; line-height: 1.6; border-top: 1px dashed #444; padding-top: 15px;">
                    ${lore.story}
                </div>
            </div>
        </div>
    `;

    loreModal.style.display = 'flex';
};

window.openDex = function() {
    let modal = document.getElementById('dexModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dexModal';
        document.body.appendChild(modal);
    }

    modal.className = '';
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        transform: none !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: 0 !important;
        background: rgba(0,0,0,0.95) !important;
        z-index: 9999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
    `;

    const standardCount = (window.playerData.dex) ? window.playerData.dex.length : 0;
    const shinyCount = (window.playerData.shinyDex) ? window.playerData.shinyDex.length : 0;
    
    const masterList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters : []);
    const totalCount = masterList.length;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 800px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>
                <h2 style="margin: 0; color: #00ccff; text-transform: uppercase; font-size: 1.5rem;">📖 ROT-DEX STICKER BOOK</h2>
                <div style="font-size: 0.85rem; color: #aaa; margin-top: 2px;">Collected: <span style="color: #00ff55; font-weight: bold;" id="dexHeaderCount">${window.currentDexTab === 'shiny' ? shinyCount : standardCount} / ${totalCount}</span></div>
            </div>
            <button onclick="closeDex()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">X</button>
        </div>
        
        <div style="width: 100%; max-width: 800px; display: flex; gap: 8px; margin-bottom: 15px;">
            <button onclick="switchDexTab('standard')" id="btnDexStandard" style="
                flex: 1; padding: 10px; background: ${window.currentDexTab === 'standard' ? '#00ccff' : '#222'};
                color: ${window.currentDexTab === 'standard' ? '#000' : '#00ccff'};
                border: 2px solid #00ccff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;
                box-shadow: ${window.currentDexTab === 'standard' ? '0 0 10px #00ccff' : 'none'};
            ">📖 STANDARD DEX (${standardCount})</button>
            
            <button onclick="switchDexTab('shiny')" id="btnDexShiny" style="
                flex: 1; padding: 10px; background: ${window.currentDexTab === 'shiny' ? '#00ffff' : '#222'};
                color: ${window.currentDexTab === 'shiny' ? '#000' : '#00ffff'};
                border: 2px solid #00ffff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;
                box-shadow: ${window.currentDexTab === 'shiny' ? '0 0 10px #00ffff' : 'none'};
            ">💎 SHINY DEX (${shinyCount})</button>
        </div>

        <div id="dexGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; width: 100%; max-width: 800px; max-height: calc(100vh - 180px); overflow-y: auto; padding: 5px; padding-bottom: 50px;"></div>
    `;

    renderDexGrid();
};

window.closeDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) modal.style.display = 'none';
};

window.openReviveModal = function() {
    if (typeof window.useRevivePotionMenu === 'function') {
        window.useRevivePotionMenu();
    }
};

window.openAdminPanel = function() {
    const passwordInput = prompt("Enter Admin Secret Key:");
    if (passwordInput !== "Kitkat10") {
        alert("Access Denied.");
        return;
    }

    let modal = document.getElementById('adminModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminModal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.85) !important;
            z-index: 99999999 !important;
        `;
        modal.innerHTML = `
            <div style="
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                background: #111 !important;
                border: 3px solid #ff0055 !important;
                border-radius: 15px !important;
                padding: 20px !important;
                width: 90% !important;
                max-width: 420px !important;
                text-align: center !important;
                box-sizing: border-box !important;
                font-family: monospace !important;
                color: #fff !important;
            ">
                <h2 style="color: #ff0055; font-size: 1.3rem; margin-bottom: 10px;">🛠️ ADMIN PANEL</h2>
                <div id="adminAccountsList" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 15px; text-align: left;"></div>
                <button onclick="clearAllAccounts()" style="background: #ff0055; color: #fff; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; margin-bottom: 8px;">WIPE ALL CLOUD ACCOUNTS</button>
                <button onclick="closeAdminPanel()" style="background: #333; color: #fff; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CLOSE</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    window.renderAdminPanel();
};

window.closeAdminPanel = function() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
};

window.renderAdminPanel = async function() {
    const listEl = document.getElementById('adminAccountsList');
    if (!listEl) return;
    if (typeof firebase === 'undefined') return;

    listEl.innerHTML = `<p style="color:#00ccff; font-size:0.8rem; text-align:center;">Fetching accounts from cloud database...</p>`;

    try {
        const snapshot = await firebase.firestore().collection('accounts').get();
        listEl.innerHTML = '';

        if (snapshot.empty) {
            listEl.innerHTML = `<p style="color:#777; font-size:0.8rem; text-align:center;">No accounts found in cloud database.</p>`;
            return;
        }

        const activeUser = localStorage.getItem('brainrot_logged_in_user');

        snapshot.forEach(doc => {
            const acc = doc.data();
            const username = doc.id;
            const isCurrent = username === activeUser;
            const invCount = acc.inventory ? acc.inventory.length : 0;
            const dexCount = acc.dex ? acc.dex.length : 0;
            const shinyCount = acc.shinyDex ? acc.shinyDex.length : 0;

            const card = document.createElement('div');
            card.style.cssText = `
                background: #222; border: 1px solid ${isCurrent ? '#00ff00' : '#444'};
                padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;
            `;
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:${isCurrent ? '#00ff00' : '#fff'}; font-size:0.9rem;">${username} ${isCurrent ? '(ACTIVE)' : ''}</b>
                    <span style="font-size:0.75rem; color:#ffaa00;">💰 ${acc.rotBalance || 0} Rot</span>
                </div>
                <span style="font-size:0.75rem; color:#00ccff;">Inventory: ${invCount} | Dex: ${dexCount} | Shiny: ${shinyCount}</span>
            `;
            listEl.appendChild(card);
        });
    } catch (err) {
        console.error("Error fetching admin accounts:", err);
        listEl.innerHTML = `<p style="color:#ff0055; font-size:0.8rem; text-align:center;">Failed to load cloud accounts.</p>`;
    }
};

window.clearAllAccounts = async function() {
    if (confirm("Are you sure you want to delete ALL accounts from the cloud database?")) {
        try {
            const snapshot = await firebase.firestore().collection('accounts').get();
            const batch = firebase.firestore().batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            localStorage.removeItem('brainrot_logged_in_user');
            alert("All cloud accounts wiped.");
            location.reload();
        } catch (err) {
            console.error("Error wiping cloud accounts:", err);
            alert("Failed to wipe database.");
        }
    }
};

setInterval(() => {
    if (window.playerData && window.playerData.username) {
        window.saveGameData();
    }
}, 60000);

window.addEventListener('beforeunload', (event) => {
    if (window.playerData && window.playerData.username && typeof firebase !== 'undefined') {
        try {
            const cleanDataString = JSON.stringify(window._internalPlayerData, (key, value) => {
                if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
                return value;
            });
            localStorage.setItem('brainrot_local_backup', cleanDataString);
            firebase.firestore().collection('accounts').doc(window.playerData.username).set(JSON.parse(cleanDataString));
        } catch (e) {
            console.error("Unload save error:", e);
        }
    }
});