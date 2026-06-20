// Renderizar lista de entrenadores
function renderTrainers() {
    var container = document.getElementById('trainersList');
    if (!container) return;
    getAllTrainers().then(function(trainers) {
        if (trainers.length === 0) {
            container.innerHTML = '<div class="empty-message">No hay entrenadores registrados.</div>';
            return;
        }
        var html = '';
        trainers.forEach(function(t) {
            var photo = t.photo || '';
            var imgSrc = photo ? photo : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%232a2a3a"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="%23ffcb05" font-size="40" font-family="Segoe UI" dy=".3em"%3E👤%3C/text%3E%3C/svg%3E';
            html += '<div class="trainer-card">';
            html += '  <img src="' + imgSrc + '" alt="' + t.name + '" onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'50\' y=\'55\' text-anchor=\'middle\' fill=\'%23ffcb05\' font-size=\'40\' font-family=\'Segoe UI\' dy=\'.3em\'%3E👤%3C/text%3E%3C/svg%3E\'">';
            html += '  <div class="trainer-name">' + t.name + '</div>';
            html += '  <div class="trainer-detail">' + t.gender + ' · ' + t.residence + '</div>';
            html += '</div>';
        });
        container.innerHTML = html;
    }).catch(function(err) {
        container.innerHTML = '<div class="empty-message">Error: ' + err.message + '</div>';
    });
}

// ===== FORMULARIO ENTRENADOR =====
document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('trainerForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('trainerName').value.trim();
            var gender = document.getElementById('trainerGender').value;
            var residence = document.getElementById('trainerResidence').value.trim();
            var photo = document.getElementById('trainerPhoto').value.trim();

            if (!name || !gender || !residence) {
                alert('Completa todos los campos obligatorios.');
                return;
            }

            addTrainer({ name, gender, residence, photo }).then(function(id) {
                alert('✅ Entrenador "' + name + '" guardado (ID: ' + id + ')');
                form.reset();
                window.location.href = 'trainers.html';
            }).catch(function(err) {
                alert('❌ Error: ' + err.message);
            });
        });
    }
});