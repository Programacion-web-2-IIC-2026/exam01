// ============================================================
// UTILIDADES Y CONSTANTES GLOBALES
// ============================================================

// Colores de tipos 
var TYPE_COLORS = {
    normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
    grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
    ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
    rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
    steel: '#b8b8d0', fairy: '#ee99ac'
};

// Lista global de todos los nombres de Pokémon y sus datos (id, nombre)
var allPokemonNames = [];
var allPokemonData = {};

// ===== FUNCIONES AUXILIARES =====

// Devuelve la clase CSS para el tipo
function getTypeClass(type) {
    var map = {
        grass: 'grass', fire: 'fire', water: 'water', bug: 'bug', normal: 'normal',
        poison: 'poison', electric: 'electric', ground: 'ground', fairy: 'fairy',
        fighting: 'fighting', psychic: 'psychic', rock: 'rock', ghost: 'ghost',
        ice: 'ice', dragon: 'dragon', dark: 'dark', steel: 'steel', flying: 'flying'
    };
    return map[type] || '';
}

// URL de la imagen oficial por número
function imgByNumber(id) {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
}

// Petición  con XMLHttpRequest
function xhrGet(url, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            try { onSuccess(JSON.parse(xhr.responseText)); }
            catch (e) { onError && onError(e); }
        } else {
            onError && onError(new Error('HTTP ' + xhr.status));
        }
    };
    xhr.send();
}

// Etiqueta de generación según el ID
function getGenLabel(id) {
    if (id <= 151) return '01';
    if (id <= 251) return '02';
    if (id <= 386) return '03';
    if (id <= 493) return '04';
    return '05';
}