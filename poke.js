/*jshint sub:true*/

// ── Type color map ──────────────────────────────────────
const TYPE_COLORS = {
  normal:'#a8a878', fire:'#f08030', water:'#6890f0', electric:'#f8d030',
  grass:'#78c850', ice:'#98d8d8', fighting:'#c03028', poison:'#a040a0',
  ground:'#e0c068', flying:'#a890f0', psychic:'#f85888', bug:'#a8b820',
  rock:'#b8a038', ghost:'#705898', dragon:'#7038f8', dark:'#705848',
  steel:'#b8b8d0', fairy:'#ee99ac'
};

// ── Helper: clase CSS para tipos ────────────────────────
function getTypeClass(type) {
  var map = {
    grass: 'grass', fire: 'fire', water: 'water', bug: 'bug', normal: 'normal',
    poison: 'poison', electric: 'electric', ground: 'ground', fairy: 'fairy',
    fighting: 'fighting', psychic: 'psychic', rock: 'rock', ghost: 'ghost',
    ice: 'ice', dragon: 'dragon', dark: 'dark', steel: 'steel', flying: 'flying'
  };
  return map[type] || '';
}

// ── Generation labels ────────────────────────────────────
function getGenLabel(id) {
  if (id <= 151) return '01';
  if (id <= 251) return '02';
  if (id <= 386) return '03';
  if (id <= 493) return '04';
  return '05';
}

// ── XMLHttpRequest helper ────────────────────────────────
function xhrGet(url, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200) {
      try { onSuccess(JSON.parse(xhr.responseText)); }
      catch(e) { onError && onError(e); }
    } else {
      onError && onError(new Error('HTTP ' + xhr.status));
    }
  };
  xhr.send();
}

// ── Image URL builder ────────────────────────────────────
function imgByNumber(id) {
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
}

// ── Current generation index ─────────────────────────────
var currentGenIndex = 1;

// ── Load pokémon list ────────────────────────────────────
function loadGeneration(offsetLimit) {
  var parts  = offsetLimit.split('|');
  var offset = parts[0];
  var limit  = parts[1];
  var genNum = parseInt(currentGenIndex);

  var grid = document.getElementById('pokedexGrid');
  grid.innerHTML = '<div id="statusMsg"><div class="spinner"></div><br>Cargando Pokémons…</div>';

  var url = 'https://pokeapi.co/api/v2/pokemon?offset=' + offset + '&limit=' + limit;

  xhrGet(url, function(data) {
    grid.innerHTML = '';
    var results = data.results;

    for (var i = 0; i < results.length; i++) {
      (function(poke, idx) {
        var urlParts = poke.url.replace(/\/$/, '').split('/');
        var pokeId   = parseInt(urlParts[urlParts.length - 1]);

        var card = document.createElement('div');
        card.className = 'poke-card';
        card.setAttribute('data-id', pokeId);
        card.setAttribute('data-name', poke.name);
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', poke.name);

        var numSpan = document.createElement('span');
        numSpan.className = 'poke-num';
        numSpan.textContent = '#' + String(pokeId).padStart(3,'0');

        var img = document.createElement('img');
        img.src = imgByNumber(pokeId);
        img.alt = poke.name;
        img.loading = 'lazy';
        img.onerror = function() {
          this.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokeId + '.png';
        };

        var nameSpan = document.createElement('span');
        nameSpan.className = 'poke-name';
        nameSpan.textContent = poke.name;

        card.appendChild(numSpan);
        card.appendChild(img);
        card.appendChild(nameSpan);

        card.addEventListener('click', function() { openModal(pokeId, poke.name, genNum); });
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') openModal(pokeId, poke.name, genNum);
        });

        grid.appendChild(card);
      })(results[i], i);
    }
  }, function(err) {
    grid.innerHTML = '<div id="statusMsg" style="color:#c00">Error cargando datos. Intente de nuevo.<br><small>' + err.message + '</small></div>';
  });
}

// ── ABRIR MODAL (con estilos oscuros y hover) ─────────────
function openModal(pokeId, pokeName, genNum) {
  // reset
  document.getElementById('modalTitle').textContent = pokeName;
  document.getElementById('mGen').textContent      = '0' + genNum;
  document.getElementById('mId').textContent       = '#' + String(pokeId).padStart(3,'0');
  document.getElementById('mWeight').textContent   = '…';
  document.getElementById('mHeight').textContent   = '…';
  document.getElementById('mTypes').innerHTML      = '';
  document.getElementById('mAbilities').innerHTML  = '…';
  document.getElementById('movesList').innerHTML   = '<span style="color:#999;font-size:.8rem">Cargando…</span>';

  var img = document.getElementById('modalImg');
  img.src = imgByNumber(pokeId);
  img.alt = pokeName;
  img.onerror = function() {
    this.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokeId + '.png';
  };

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  // fetch details
  xhrGet('https://pokeapi.co/api/v2/pokemon/' + pokeName, function(d) {
    // weight / height
    document.getElementById('mWeight').textContent = (d.weight / 10).toFixed(1) + ' kgs';
    document.getElementById('mHeight').textContent = (d.height / 10).toFixed(1) + ' mts';

    // types (usando clases CSS en lugar de style.background)
    var typesEl = document.getElementById('mTypes');
    typesEl.innerHTML = '';
    d.types.forEach(function(t) {
      var badge = document.createElement('span');
      badge.className = 'type-badge ' + getTypeClass(t.type.name);
      badge.textContent = t.type.name;
      typesEl.appendChild(badge);
    });

    // abilities
    var abEl = document.getElementById('mAbilities');
    abEl.textContent = d.abilities.map(function(a) {
      return a.ability.name;
    }).join(' – ');

    // moves (first 20)
    var movesEl = document.getElementById('movesList');
    movesEl.innerHTML = '';
    var moves = d.moves.slice(0, 20);
    moves.forEach(function(m) {
      var chip = document.createElement('span');
      chip.className = 'move-chip';
      chip.textContent = m.move.name;
      movesEl.appendChild(chip);
    });
  }, function() {
    document.getElementById('mWeight').textContent = 'N/D';
    document.getElementById('mHeight').textContent = 'N/D';
  });
}

// ── Cerrar modal ──────────────────────────────────────────
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ── Generation selector ───────────────────────────────────
document.getElementById('genSelect').addEventListener('change', function() {
  currentGenIndex = this.selectedIndex + 1;
  loadGeneration(this.value);
});

// ── Init ──────────────────────────────────────────────────
loadGeneration('0|151');