// ============================================================
// EQUIPOS - Listado, formulario, modal y lógica de selección
// ============================================================

// Variables para el formulario de equipos (selección de Pokémon)
var selectedPokemonsForTeam = [];

// ===== LISTADO DE EQUIPOS =====
function renderTeams() {
    var container = document.getElementById('teamsList');
    if (!container) return;
    Promise.all([getAllTeams(), getAllTrainers()]).then(function(results) {
        var teams = results[0];
        var trainers = results[1];
        var trainerMap = {};
        trainers.forEach(function(t) { trainerMap[t.id] = t; });

        if (teams.length === 0) {
            container.innerHTML = '<div class="empty-message">No hay equipos registrados.</div>';
            return;
        }

        var html = '';
        teams.forEach(function(team) {
            var trainer = trainerMap[team.trainerId];
            var trainerName = trainer ? trainer.name : 'Desconocido';
            var imgSrc = team.teamImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="120"%3E%3Crect width="300" height="120" fill="%232a2a3a"/%3E%3Ctext x="150" y="65" text-anchor="middle" fill="%23ffcb05" font-size="24" font-family="Segoe UI" dy=".3em"%3E🏆 Equipo%3C/text%3E%3C/svg%3E';

            html += '<div class="team-card" data-id="' + team.id + '">';
            html += '  <img src="' + imgSrc + '" alt="' + team.teamName + '" onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'120\'%3E%3Crect width=\'300\' height=\'120\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'150\' y=\'65\' text-anchor=\'middle\' fill=\'%23ffcb05\' font-size=\'24\' font-family=\'Segoe UI\' dy=\'.3em\'%3E🏆 Equipo%3C/text%3E%3C/svg%3E\'">';
            html += '  <div class="team-name">' + team.teamName + '</div>';
            html += '  <div class="team-trainer"> ' + trainerName + '</div>';
            html += '  <div class="team-preview">';
            if (team.pokemons && team.pokemons.length > 0) {
                team.pokemons.forEach(function(p) {
                    var pid = allPokemonData[p] ? allPokemonData[p].id : 0;
                    var pImg = pid ? imgByNumber(pid) : '';
                    html += '    <img src="' + pImg + '" alt="' + p + '" onerror="this.style.display=\'none\'">';
                });
            }
            html += '  </div>';
            html += '</div>';
        });
        container.innerHTML = html;

        document.querySelectorAll('.team-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                showTeamDetail(id);
            });
        });
    }).catch(function(err) {
        container.innerHTML = '<div class="empty-message">Error: ' + err.message + '</div>';
    });
}

// ===== MODAL DE EQUIPO (detalle) =====
function showTeamDetail(teamId) {
    Promise.all([getTeamById(teamId), getAllTrainers()]).then(function(results) {
        var team = results[0];
        var trainers = results[1];
        var trainerMap = {};
        trainers.forEach(function(t) { trainerMap[t.id] = t; });

        if (!team) { alert('Equipo no encontrado'); return; }

        var trainer = trainerMap[team.trainerId];
        var trainerName = trainer ? trainer.name : 'Desconocido';

        document.getElementById('teamModalTitle').textContent = team.teamName;
        document.getElementById('tmTrainer').textContent = trainerName;

        var img = document.getElementById('teamModalImg');
        var imgSrc = team.teamImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="180"%3E%3Crect width="400" height="180" fill="%232a2a3a"/%3E%3Ctext x="200" y="95" text-anchor="middle" fill="%23ffcb05" font-size="28" font-family="Segoe UI" dy=".3em"%3E🏆 Equipo%3C/text%3E%3C/svg%3E';
        img.src = imgSrc;
        img.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="180"%3E%3Crect width="400" height="180" fill="%232a2a3a"/%3E%3Ctext x="200" y="95" text-anchor="middle" fill="%23ffcb05" font-size="28" font-family="Segoe UI" dy=".3em"%3E🏆 Equipo%3C/text%3E%3C/svg%3E';
        };

        var pokemonContainer = document.getElementById('tmPokemons');
        pokemonContainer.innerHTML = '';
        if (team.pokemons && team.pokemons.length > 0) {
            team.pokemons.forEach(function(pname) {
                var data = allPokemonData[pname];
                var pid = data ? data.id : 0;
                var pImg = pid ? imgByNumber(pid) : '';
                var div = document.createElement('div');
                div.className = 'poke-mini';
                div.innerHTML = '<img src="' + pImg + '" alt="' + pname + '" onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\'%3E%3Crect width=\'48\' height=\'48\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'24\' y=\'32\' text-anchor=\'middle\' fill=\'%23ffcb05\' font-size=\'20\' dy=\'.3em\'%3E?%3C/text%3E%3C/svg%3E\'" loading="lazy"><span>' + pname + '</span>';
                pokemonContainer.appendChild(div);
            });
        } else {
            pokemonContainer.innerHTML = '<span style="color:#999;">Sin Pokémon asignados</span>';
        }

        document.getElementById('teamModalOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    });
}

function closeTeamModal() {
    var overlay = document.getElementById('teamModalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Eventos del modal de equipo
document.addEventListener('DOMContentLoaded', function() {
    var closeBtn = document.getElementById('teamModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeTeamModal);
    var overlay = document.getElementById('teamModalOverlay');
    if (overlay) overlay.addEventListener('click', function(e) {
        if (e.target === this) closeTeamModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeTeamModal();
    });
});

// ===== FORMULARIO EQUIPO =====

// Cargar entrenadores en el select
function loadTrainerSelect() {
    var select = document.getElementById('teamTrainer');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar entrenador…</option>';
    getAllTrainers().then(function(trainers) {
        trainers.forEach(function(t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            select.appendChild(opt);
        });
    }).catch(function(e) {
        console.warn('No se pudieron cargar entrenadores:', e);
    });
}

// Funciones para manejar la selección de Pokémon
function addPokemonToTeam(name) {
    if (selectedPokemonsForTeam.length >= 6) {
        alert('* Máximo 6 Pokémon por equipo.');
        return;
    }
    if (selectedPokemonsForTeam.indexOf(name) !== -1) {
        alert('* "' + name + '" ya está en el equipo.');
        return;
    }
    selectedPokemonsForTeam.push(name);
    renderSelectedPokemons();
}

function removePokemonFromTeam(name) {
    var idx = selectedPokemonsForTeam.indexOf(name);
    if (idx !== -1) {
        selectedPokemonsForTeam.splice(idx, 1);
        renderSelectedPokemons();
    }
}

function renderSelectedPokemons() {
    var container = document.getElementById('selectedPokemons');
    if (!container) return;
    container.innerHTML = '';
    if (selectedPokemonsForTeam.length === 0) {
        container.innerHTML = '<span style="color:#666;font-size:0.85rem;">Selecciona hasta 6 Pokémon</span>';
        return;
    }
    selectedPokemonsForTeam.forEach(function(name) {
        var data = allPokemonData[name];
        var id = data ? data.id : 0;
        var imgSrc = id ? imgByNumber(id) : '';
        var div = document.createElement('div');
        div.className = 'selected-pokemon';
        div.innerHTML = '<img src="' + imgSrc + '" alt="' + name + '" onerror="this.style.display=\'none\'"> ' + name + ' <button type="button" class="btn-danger-sm" onclick="removePokemonFromTeam(\'' + name + '\')">✕</button>';
        container.appendChild(div);
    });
}

// Inicialización del formulario de equipo
document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('pokemonSearch');
    var suggestionsContainer = document.getElementById('pokemonSuggestions');
    if (searchInput && suggestionsContainer) {
        searchInput.addEventListener('input', function() {
            var query = this.value.toLowerCase().trim();
            if (query.length < 2) {
                suggestionsContainer.classList.remove('active');
                return;
            }
            var matches = allPokemonNames.filter(function(name) {
                return name.toLowerCase().includes(query);
            }).slice(0, 12);

            if (matches.length === 0) {
                suggestionsContainer.classList.remove('active');
                return;
            }

            suggestionsContainer.innerHTML = '';
            matches.forEach(function(name) {
                var div = document.createElement('div');
                div.className = 'suggestion-item';
                var id = allPokemonData[name] ? allPokemonData[name].id : 0;
                var imgSrc = id ? imgByNumber(id) : '';
                div.innerHTML = '<img src="' + imgSrc + '" alt="' + name + '" onerror="this.style.display=\'none\'"> ' + name;
                div.addEventListener('click', function() {
                    addPokemonToTeam(name);
                    searchInput.value = '';
                    suggestionsContainer.classList.remove('active');
                });
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.classList.add('active');
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.pokemon-selector')) {
                suggestionsContainer.classList.remove('active');
            }
        });

        document.getElementById('addPokemonBtn').addEventListener('click', function() {
            var query = searchInput.value.trim().toLowerCase();
            if (!query) return;
            var match = allPokemonNames.find(function(name) {
                return name.toLowerCase() === query;
            });
            if (match) {
                addPokemonToTeam(match);
                searchInput.value = '';
                suggestionsContainer.classList.remove('active');
            } else {
                alert('* Pokémon no encontrado. Escribe el nombre exacto.');
            }
        });
    }

    var teamForm = document.getElementById('teamForm');
    if (teamForm) {
        teamForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var teamName = document.getElementById('teamName').value.trim();
            var teamImage = document.getElementById('teamImage').value.trim();
            var trainerId = parseInt(document.getElementById('teamTrainer').value);

            if (!teamName) { alert('Ingresa el nombre del equipo.'); return; }
            if (!trainerId) { alert('Selecciona un entrenador.'); return; }
            if (selectedPokemonsForTeam.length === 0) { alert('El equipo debe tener al menos 1 Pokémon.'); return; }

            addTeam({
                teamName: teamName,
                teamImage: teamImage || '',
                trainerId: trainerId,
                pokemons: selectedPokemonsForTeam.slice()
            }).then(function(id) {
                alert(' Equipo "' + teamName + '" guardado (ID: ' + id + ')');
                teamForm.reset();
                selectedPokemonsForTeam = [];
                renderSelectedPokemons();
                window.location.href = 'teams.html';
            }).catch(function(err) {
                alert(' Error: ' + err.message);
            });
        });
    }
});