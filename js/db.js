/* ============================================================
   INDEXEDDB - Entrenadores y Equipos
   ============================================================ */
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var db = null;
var DB_NAME = 'PokedexDB';
var DB_VERSION = 2;

function initDB() {
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(e) {
            var db = request.result;
            if (db.objectStoreNames.contains('trainers')) db.deleteObjectStore('trainers');
            if (db.objectStoreNames.contains('teams')) db.deleteObjectStore('teams');

            var trainerStore = db.createObjectStore('trainers', { keyPath: 'id', autoIncrement: true });
            trainerStore.createIndex('idx_name', 'name', { unique: false });

            var teamStore = db.createObjectStore('teams', { keyPath: 'id', autoIncrement: true });
            teamStore.createIndex('idx_name', 'teamName', { unique: false });
            teamStore.createIndex('idx_trainer', 'trainerId', { unique: false });
        };
        request.onsuccess = function(e) {
            db = request.result;
            console.log('✅ IndexedDB cargada');
            resolve(db);
        };
        request.onerror = function(e) {
            console.error('❌ Error DB:', e);
            reject(e);
        };
    });
}

// ===== ENTRENADORES =====
function addTrainer(data) {
    return new Promise(function(resolve, reject) {
        if (!db) { reject(new Error('DB no iniciada')); return; }
        var tx = db.transaction(['trainers'], 'readwrite');
        var store = tx.objectStore('trainers');
        var req = store.add(data);
        req.onsuccess = function(e) { resolve(e.target.result); };
        req.onerror = function(e) { reject(e.target.error); };
    });
}

function getAllTrainers() {
    return new Promise(function(resolve, reject) {
        if (!db) { reject(new Error('DB no iniciada')); return; }
        var tx = db.transaction(['trainers'], 'readonly');
        var store = tx.objectStore('trainers');
        var trainers = [];
        var cursor = store.openCursor();
        cursor.onsuccess = function(e) {
            var reg = e.target.result;
            if (reg) { trainers.push(reg.value); reg.continue(); }
        };
        tx.oncomplete = function() { resolve(trainers); };
        tx.onerror = function(e) { reject(e.target.error); };
    });
}

function getTrainerById(id) {
    return new Promise(function(resolve, reject) {
        if (!db) { reject(new Error('DB no iniciada')); return; }
        var tx = db.transaction(['trainers'], 'readonly');
        var store = tx.objectStore('trainers');
        var req = store.get(id);
        req.onsuccess = function(e) { resolve(e.target.result); };
        req.onerror = function(e) { reject(e.target.error); };
    });
}

// ===== EQUIPOS =====
function addTeam(data) {
    return new Promise(function(resolve, reject) {
        if (!db) { reject(new Error('DB no iniciada')); return; }
        var tx = db.transaction(['teams'], 'readwrite');
        var store = tx.objectStore('teams');
        var req = store.add(data);
        req.onsuccess = function(e) { resolve(e.target.result); };
        req.onerror = function(e) { reject(e.target.error); };
    });
}

function getAllTeams() {
    return new Promise(function(resolve, reject) {
        if (!db) { reject(new Error('DB no iniciada')); return; }
        var tx = db.transaction(['teams'], 'readonly');
        var store = tx.objectStore('teams');
        var teams = [];
        var cursor = store.openCursor();
        cursor.onsuccess = function(e) {
            var reg = e.target.result;
            if (reg) { teams.push(reg.value); reg.continue(); }
        };
        tx.oncomplete = function() { resolve(teams); };
        tx.onerror = function(e) { reject(e.target.error); };
    });
}

function getTeamById(id) {
    return new Promise(function(resolve, reject) {
        if (!db) { reject(new Error('DB no iniciada')); return; }
        var tx = db.transaction(['teams'], 'readonly');
        var store = tx.objectStore('teams');
        var req = store.get(id);
        req.onsuccess = function(e) { resolve(e.target.result); };
        req.onerror = function(e) { reject(e.target.error); };
    });
}