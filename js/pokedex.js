// ============================================================
// POKÉDEX - Carga y visualización de Pokémon
// ============================================================

// Carga una generación (offset|limit)
function loadGeneration(offsetLimit) {
    var parts = offsetLimit.split('|');
    var offset = parseInt(parts[0]);
    var limit = parseInt(parts[1]);

    var grid = document.getElementById('pokedexGrid');
    if (!grid) return;
    grid.innerHTML = '<div id="statusMsg"><div class="spinner"></div><br>Cargando Pokémons…</div>';

    var url = 'https://pokeapi.co/api/v2/pokemon?offset=' + offset + '&limit=' + limit;

    xhrGet(url, function(data) {
        grid.innerHTML = '';
        var results = data.results;

        for (var i = 0; i < results.length; i++) {
            (function(poke, idx) {
                var urlParts = poke.url.replace(/\/$/, '').split('/');
                var pokeId = parseInt(urlParts[urlParts.length - 1]);

                // Guardar en lista global para el selector de equipos
                if (!allPokemonData[poke.name]) {
                    allPokemonNames.push(poke.name);
                    allPokemonData[poke.name] = { id: pokeId, name: poke.name };
                }

                var card = document.createElement('div');
                card.className = 'poke-card';
                card.setAttribute('data-id', pokeId);
                card.setAttribute('data-name', poke.name);

                var numSpan = document.createElement('span');
                numSpan.className = 'poke-num';
                numSpan.textContent = '#' + String(pokeId).padStart(3, '0');

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

                card.addEventListener('click', function() {
                    openModal(pokeId, poke.name);
                });

                grid.appendChild(card);
            })(results[i], i);
        }
    }, function(err) {
        grid.innerHTML = '<div id="statusMsg" style="color:#c00">Error cargando datos.<br><small>' + err.message + '</small></div>';
    });
}

// ===== MODAL DE POKÉMON =====
function openModal(pokeId, pokeName) {
    var titleEl = document.getElementById('modalTitle');
    if (!titleEl) return;
    document.getElementById('modalTitle').textContent = pokeName;
    document.getElementById('mGen').textContent = getGenLabel(pokeId);
    document.getElementById('mId').textContent = '#' + String(pokeId).padStart(3, '0');
    document.getElementById('mWeight').textContent = '…';
    document.getElementById('mHeight').textContent = '…';
    document.getElementById('mTypes').innerHTML = '…';
    document.getElementById('mAbilities').innerHTML = '…';
    document.getElementById('movesList').innerHTML = '<span style="color:#999;font-size:.8rem">Cargando…</span>';

    var img = document.getElementById('modalImg');
    img.src = imgByNumber(pokeId);
    img.alt = pokeName;
    img.onerror = function() {
        this.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokeId + '.png';
    };

    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    xhrGet('https://pokeapi.co/api/v2/pokemon/' + pokeName, function(d) {
        document.getElementById('mWeight').textContent = (d.weight / 10).toFixed(1) + ' kgs';
        document.getElementById('mHeight').textContent = (d.height / 10).toFixed(1) + ' mts';

        var typesEl = document.getElementById('mTypes');
        typesEl.innerHTML = '';
        d.types.forEach(function(t) {
            var badge = document.createElement('span');
            badge.className = 'type-badge ' + getTypeClass(t.type.name);
            badge.textContent = t.type.name;
            typesEl.appendChild(badge);
        });

        var abEl = document.getElementById('mAbilities');
        abEl.textContent = d.abilities.map(function(a) {
            return a.ability.name;
        }).join(' – ');

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

// Cerrar modal de Pokémon
function closeModal() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Eventos del modal de Pokémon
document.addEventListener('DOMContentLoaded', function() {
    var closeBtn = document.getElementById('modalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });

    // Selector de generación
    var genSelect = document.getElementById('genSelect');
    if (genSelect) {
        genSelect.addEventListener('change', function() {
            loadGeneration(this.value);
        });
    }
});