// Veri depolama için değişkenler
let players = [];
let currentTeamA = [];
let currentTeamB = [];
let currentTeamAPower = 0;
let currentTeamBPower = 0;

// Sayfa yüklendiğinde verileri yükle
const themeToggleBtn = document.getElementById('themeToggleBtn');

document.addEventListener('DOMContentLoaded', function() {
    loadPlayers();
    updateStats();
    updateAvailableCount();
    loadThemePreference(); // Load saved theme preference

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
});

// Theme toggle function
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    // Update button icon based on theme
    if (document.body.classList.contains('dark-mode')) {
        themeToggleBtn.textContent = '☀️'; // Sun icon for light mode
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggleBtn.textContent = '🌙'; // Moon icon for dark mode
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme preference from localStorage
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode'); // Default to light
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
    }
}

// Sekme değiştirme
function switchTab(tabName) {
    // Tüm sekmeleri gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Seçilen sekmeyi göster
    document.getElementById(tabName + '-tab').classList.add('active');
    // Event objesi, onclick ile çağrıldığında otomatik olarak gelir.
    // Ancak fonksiyon doğrudan çağrıldığında (örn: switchTab('players')) gelmez.
    // Bu yüzden event.target yerine, ilgili butonu bulmak için id veya benzeri bir yöntem kullanılabilir.
    // Şimdilik, switchTab fonksiyonu doğrudan da çağrılabileceği için event.target yerine
    // genel bir yaklaşım kullanmak daha sağlam olabilir.
    // Örneğin: document.querySelector(`.tab[onclick*="${tabName}"]`).classList.add('active');
    // Ancak mevcut onclick yapısı için event.target uygundur.
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Eğer event yoksa (fonksiyon doğrudan çağrıldıysa)
        // İlgili butonu bulup aktif et
        const tabButton = document.querySelector(`.tabs button[onclick*="switchTab('${tabName}')"]`);
        if (tabButton) {
            tabButton.classList.add('active');
        }
    }


    // Takım sekmesine geçerken sayıları güncelle
    if (tabName === 'teams') {
        updateAvailableCount();
    }
}

// Oyuncu ekleme
function addPlayer() {
    const nameInput = document.getElementById('playerName');
    const positionInput = document.getElementById('playerPosition');
    const powerInput = document.getElementById('playerPower');

    const playerName = nameInput.value.trim();
    const playerPosition = positionInput.value;
    const playerPower = parseInt(powerInput.value); // Sayı olarak al

    if (!playerName) {
        alert('Lütfen oyuncu adını girin!');
        return;
    }
    if (!playerPosition) {
        alert('Lütfen oyuncu mevkisini seçin!');
        return;
    }
    if (isNaN(playerPower) || playerPower < 0 || playerPower > 100) {
        alert('Lütfen oyuncu gücünü 0-100 arasında bir değer olarak girin!');
        return;
    }

    // Aynı isimde oyuncu var mı kontrol et
    if (players.some(player => player.name.toLowerCase() === playerName.toLowerCase())) {
        alert('Bu isimde bir oyuncu zaten mevcut!');
        return;
    }

    // Yeni oyuncu oluştur
    const newPlayer = {
        id: Date.now(),
        name: playerName,
        position: playerPosition, // Yeni eklendi
        power: playerPower,       // Yeni eklendi
        available: true
    };

    players.push(newPlayer);
    nameInput.value = '';
    positionInput.value = ''; // Seçimi sıfırla
    powerInput.value = '50'; // Gücü başlangıç değerine sıfırla
    
    savePlayers();
    renderPlayersTable();
    updateStats();
    updateAvailableCount();
}

// Oyuncu durumunu değiştirme
function togglePlayerAvailability(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.available = !player.available;
        savePlayers();
        renderPlayersTable();
        updateStats();
        updateAvailableCount();
    }
}

// Oyuncu silme
function removePlayer(playerId) {
    if (confirm('Bu oyuncuyu silmek istediğinizden emin misiniz?')) {
        players = players.filter(p => p.id !== playerId);
        savePlayers();
        renderPlayersTable();
        updateStats();
        updateAvailableCount();
    }
}

// Oyuncular tablosunu oluşturma
function renderPlayersTable() {
    const tableBody = document.getElementById('playersTableBody');
    
    if (players.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Henüz oyuncu eklenmemiş. İlk oyuncuyu eklemek için yukarıdaki formu kullanın.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = players.map(player => `
        <tr>
            <td><strong>${player.name}</strong></td>
            <td>${player.position}</td>
            <td>${player.power}</td>
            <td>
                <input type="checkbox" class="checkbox" 
                       ${player.available ? 'checked' : ''} 
                       onchange="togglePlayerAvailability(${player.id})">
            </td>
            <td>
                <span class="status-badge ${player.available ? 'status-available' : 'status-unavailable'}">
                    ${player.available ? 'Gelecek' : 'Gelmeyecek'}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-edit" onclick="editPlayer(${player.id})">
                    ✏️ Düzenle
                </button>
                <button class="btn btn-small btn-danger" onclick="removePlayer(${player.id})">
                    🗑️ Sil
                </button>
            </td>
        </tr>
    `).join('');
}


// İstatistikleri güncelleme
function updateStats() {
    const total = players.length;
    const available = players.filter(p => p.available).length;
    const unavailable = total - available;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('availableCount').textContent = available;
    document.getElementById('unavailableCount').textContent = unavailable;
}

// Maça gelecek oyuncu sayısını güncelleme
function updateAvailableCount() {
    const availablePlayers = players.filter(p => p.available);
    const count = availablePlayers.length;
    
    document.getElementById('availablePlayersCount').textContent = count;
    
    const createBtn = document.getElementById('createTeamsBtn');
    if (count < 2) {
        createBtn.disabled = true;
        createBtn.textContent = '⚠️ EN AZ 2 OYUNCU GEREKLİ';
    } else {
        createBtn.disabled = false;
        createBtn.textContent = '🎲 TAKIMLARI OLUŞTUR';
    }
}

// Takımları oluşturma
function createTeams() {
    const availablePlayers = players.filter(p => p.available);
    
    if (availablePlayers.length < 2) {
        alert('Takım oluşturmak için en az 2 oyuncu gereklidir!');
        return;
    }

    // Takımları mevki ve güç dengesine göre oluşturma
    // Bu algoritma basittir, daha karmaşık dengeleme için optimizasyon yapılabilir.
    const teamA = [];
    const teamB = [];
    let teamAPower = 0;
    let teamBPower = 0;

    // Oyuncuları güçlerine göre azalan sırada sırala
    const sortedPlayers = [...availablePlayers].sort((a, b) => b.power - a.power);

    // Mevkilere göre oyuncu havuzları oluştur
    const positionPools = {
        'Kaleci': [],
        'Defans': [],
        'Orta Saha': [],
        'Forvet': [],
        'Libero': [] // Eğer libero mevkisi varsa
    };

    sortedPlayers.forEach(player => {
        if (positionPools[player.position]) {
            positionPools[player.position].push(player);
        }
    });

    // Her mevkiden sırayla takımlara oyuncu dağıt
    for (const position in positionPools) {
        const playersInPosition = positionPools[position];
        for (let i = 0; i < playersInPosition.length; i++) {
            const player = playersInPosition[i];
            if (teamAPower <= teamBPower) {
                teamA.push(player);
                teamAPower += player.power;
            } else {
                teamB.push(player);
                teamBPower += player.power;
            }
        }
    }

    // Eğer takımlar arasında hala fark varsa, en zayıf takımdan en güçlü takıma oyuncu transferi yap
    // Bu kısım, dengeleme algoritmasını daha da iyileştirmek için eklenebilir.
    // Ancak basit bir dengeleme için yukarıdaki zaten iş görecektir.
    // Örnek: Eğer teamA çok güçlüyse, teamA'dan bir oyuncuyu teamB'ye taşıyıp teamB'den başka bir oyuncuyu teamA'ya taşıyabiliriz.

    // Store current teams and powers globally
    currentTeamA = [...teamA];
    currentTeamB = [...teamB];
    currentTeamAPower = teamAPower;
    currentTeamBPower = teamBPower;

    displayTeams(currentTeamA,currentTeamB,currentTeamAPower,currentTeamBPower);
}

// Takımları görüntüleme
// function displayTeams(teamA, teamB, teamAPower, teamBPower) { // Parameters removed, using global vars now
function displayTeams() {
    const teamAList = document.getElementById('teamA');
    const teamBList = document.getElementById('teamB');
    const countA = document.getElementById('countA');
    const countB = document.getElementById('countB');
    const avgPowerA = document.getElementById('avgPowerA'); // Yeni eklendi
    const avgPowerB = document.getElementById('avgPowerB'); // Yeni eklendi
    const teamsContainer = document.getElementById('teamsContainer');

    // Önceki listeyi temizle
    teamAList.innerHTML = '';
    teamBList.innerHTML = '';

    // A takımını ekle
    currentTeamA.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${player.name} (${player.position} - ${player.power})
            <button class="move-btn" onclick="manualMovePlayer(${player.id}, 'B')">➡️ B</button>
        `;
        li.style.animationDelay = `${index * 0.1}s`;
        teamAList.appendChild(li);
    });

    // B takımını ekle
    currentTeamB.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${player.name} (${player.position} - ${player.power})
            <button class="move-btn" onclick="manualMovePlayer(${player.id}, 'A')">⬅️ A</button>
        `;
        li.style.animationDelay = `${index * 0.1}s`;
        teamBList.appendChild(li);
    });

    // Oyuncu sayılarını göster
    countA.textContent = `Toplam: ${currentTeamA.length} oyuncu`;
    countB.textContent = `Toplam: ${currentTeamB.length} oyuncu`;

    // Ortalama güçleri göster
    // Recalculate powers directly in displayTeams for simplicity and accuracy after moves
    currentTeamAPower = calculateTeamPower(currentTeamA);
    currentTeamBPower = calculateTeamPower(currentTeamB);
    avgPowerA.textContent = `Ortalama Güç: ${currentTeamA.length > 0 ? (currentTeamAPower / currentTeamA.length).toFixed(1) : 0}`;
    avgPowerB.textContent = `Ortalama Güç: ${currentTeamB.length > 0 ? (currentTeamBPower / currentTeamB.length).toFixed(1) : 0}`;

    // Takım containerını göster
    teamsContainer.style.display = 'grid';
    
    // Smooth scroll to teams
    setTimeout(() => {
        teamsContainer.scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Veri kaydetme (localStorage kullanarak)
function savePlayers() {
    try {
        localStorage.setItem('teamBuilderPlayers', JSON.stringify(players));
    } catch (e) {
        console.error("Error saving players to localStorage:", e);
        // Optionally, inform the user if saving fails, though console error might be sufficient for now.
        // showCustomAlert("Kaydetme Hatası", "Oyuncu listesi tarayıcıda otomatik olarak kaydedilemedi. Yedekleme özelliğini kullanmayı düşünebilirsiniz.", "error");
    }
}

// Veri yükleme (localStorage kullanarak)
function loadPlayers() {
    try {
        const storedPlayers = localStorage.getItem('teamBuilderPlayers');
        if (storedPlayers) {
            const parsedPlayers = JSON.parse(storedPlayers);
            if (Array.isArray(parsedPlayers)) {
                // Perform a basic validation of player structure if necessary
                // For example, check if each player has 'id', 'name', 'power', 'position', 'available'
                players = parsedPlayers.filter(p =>
                    typeof p === 'object' && p !== null &&
                    'id' in p && 'name' in p &&
                    'power' in p && 'position' in p && 'available' in p
                );
                if (players.length !== parsedPlayers.length) {
                    console.warn("Some invalid player objects were filtered out during loading.");
                }
            } else {
                console.warn("Stored player data is not an array. Initializing with empty list.");
                players = [];
            }
        } else {
            // No data in localStorage, initialize with empty list
            players = [];
        }
    } catch (e) {
        console.error("Error loading players from localStorage:", e);
        players = []; // Default to empty list on error
        // Optionally, inform the user if loading fails
        // showCustomAlert("Yükleme Hatası", "Oyuncu listesi tarayıcıdan yüklenemedi. Veriler bozulmuş olabilir.", "error");
    }
    // Note: renderPlayersTable() and updateStats() are called in DOMContentLoaded after this.
}

// Enter tuşu ile oyuncu ekleme
document.getElementById('playerName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

// Veri dışa aktarma (JSON dosyası olarak indirme)
function exportData() {
    if (players.length === 0) {
        showStatus('Dışa aktarılacak oyuncu bulunamadı!', 'error');
        return;
    }

    const dataToExport = {
        players: players,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `oyuncu-listesi-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showStatus('Oyuncu listesi başarıyla indirildi!', 'success');
}

// Veri içe aktarma (JSON dosyası yükleme)
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.players && Array.isArray(importedData.players)) {
                if (players.length > 0) {
                    if (!confirm('Mevcut oyuncu listesi silinecek. Devam etmek istiyor musunuz?')) {
                        return;
                    }
                }
                
                players = importedData.players;
                renderPlayersTable();
                updateStats();
                updateAvailableCount();
                showStatus(`${players.length} oyuncu başarıyla yüklendi!`, 'success');
                
                // Oyuncu yönetimi sekmesine geç
                switchTab('players');
            } else {
                showStatus('Geçersiz dosya formatı!', 'error');
            }
        } catch (error) {
            showStatus('Dosya okunurken hata oluştu!', 'error');
        }
    };
    reader.readAsText(file);
    
    // Input'u temizle
    event.target.value = '';
}

// Manuel yedek kodu oluşturma
function generateBackupText() {
    if (players.length === 0) {
        showStatus('Yedeklenecek oyuncu bulunamadı!', 'error');
        return;
    }

    const backupData = {
        players: players,
        date: new Date().toLocaleString('tr-TR'),
        version: '1.0'
    };

    const backupText = btoa(JSON.stringify(backupData)); // Base64 encode
    document.getElementById('backupText').value = backupText;
    document.getElementById('copyBtn').style.display = 'inline-block';
    
    showStatus('Yedek kodu oluşturuldu! Kopyalamayı unutmayın.', 'info');
}

// Yedek kodunu kopyalama
function copyBackupText() {
    const backupText = document.getElementById('backupText');
    backupText.select();
    backupText.setSelectionRange(0, 99999); // Mobil için
    
    try {
        document.execCommand('copy');
        showStatus('Yedek kodu panoya kopyalandı!', 'success');
    } catch (err) {
        showStatus('Kopyalama başarısız. Manuel olarak seçip kopyalayın.', 'error');
    }
}

// Metinden geri yükleme
function restoreFromText() {
    const backupText = document.getElementById('backupText').value.trim();
    
    if (!backupText) {
        showStatus('Lütfen yedek kodunu girin!', 'error');
        return;
    }

    try {
        const decodedData = JSON.parse(atob(backupText)); // Base64 decode
        
        if (decodedData.players && Array.isArray(decodedData.players)) {
            if (players.length > 0) {
                if (!confirm('Mevcut oyuncu listesi silinecek. Devam etmek istiyor musunuz?')) {
                    return;
                }
            }
            
            players = decodedData.players;
            renderPlayersTable();
            updateStats();
            updateAvailableCount();
            showStatus(`${players.length} oyuncu başarıyla geri yüklendi!`, 'success');
            
            // Oyuncu yönetimi sekmesine geç
            switchTab('players');
            
            // Textarea'yı temizle
            document.getElementById('backupText').value = '';
            document.getElementById('copyBtn').style.display = 'none';
        } else {
            showStatus('Geçersiz yedek kodu!', 'error');
        }
    } catch (error) {
        showStatus('Yedek kodu çözümlenirken hata oluştu!', 'error');
    }
}
// *** Yeni Eklenen Fonksiyonlar: Oyuncu Düzenleme ve Modal Yönetimi ***

// Oyuncu düzenleme modalını açar ve verileri doldurur
function editPlayer(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) {
        showCustomAlert('Hata', 'Oyuncu bulunamadı!', 'error');
        return;
    }

    document.getElementById('editPlayerId').value = player.id;
    document.getElementById('editPlayerName').value = player.name;
    document.getElementById('editPlayerPosition').value = player.position;
    document.getElementById('editPlayerPower').value = player.power;

    document.getElementById('editPlayerModal').style.display = 'flex'; // Modalı görünür yap
}

// Oyuncuyu düzenleme modalındaki verilerle kaydeder
function saveEditedPlayer() {
    const playerId = parseInt(document.getElementById('editPlayerId').value);
    const newName = document.getElementById('editPlayerName').value.trim();
    const newPosition = document.getElementById('editPlayerPosition').value;
    const newPower = parseInt(document.getElementById('editPlayerPower').value);

    // Güncelleme validasyonu
    if (!newName) {
        showStatus('Lütfen oyuncu adını girin!', 'error', 'editStatus');
        return;
    }
    if (!newPosition) {
        showStatus('Lütfen oyuncu mevkisini seçin!', 'error', 'editStatus');
        return;
    }
    if (isNaN(newPower) || newPower < 0 || newPower > 100) {
        showStatus('Lütfen oyuncu gücünü 0-100 arasında bir değer olarak girin!', 'error', 'editStatus');
        return;
    }

    // Aynı isimde başka bir oyuncu var mı kontrol et (kendisi hariç)
    if (players.some(p => p.name.toLowerCase() === newName.toLowerCase() && p.id !== playerId)) {
        showStatus('Bu isimde başka bir oyuncu zaten mevcut!', 'error', 'editStatus');
        return;
    }

    const playerIndex = players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
        players[playerIndex].name = newName;
        players[playerIndex].position = newPosition;
        players[playerIndex].power = newPower;
        
        savePlayers();
        renderPlayersTable();
        updateStats();
        showStatus('Oyuncu başarıyla güncellendi!', 'success', 'editStatus');
        setTimeout(() => {
            closeEditModal();
        }, 1000); // Kısa bir gecikme sonrası modalı kapat
    } else {
        showStatus('Oyuncu bulunamadı!', 'error', 'editStatus');
    }
}

// Oyuncu düzenleme modalını kapatır
function closeEditModal() {
    document.getElementById('editPlayerModal').style.display = 'none';
    document.getElementById('editStatus').style.display = 'none'; // Durum mesajını gizle
}

// Durum mesajı gösterme
function showStatus(message, type) {
    const statusDiv = document.getElementById('backupStatus');
    if (!statusDiv) { // Add a guard clause in case the element is not found
        console.error("Element with ID 'backupStatus' not found.");
        return;
    }
    statusDiv.style.display = 'block';
    statusDiv.textContent = message;
    
    // Renk ayarları
    if (type === 'success') {
        statusDiv.style.background = 'rgba(72, 187, 120, 0.2)';
        statusDiv.style.color = '#2f855a';
        statusDiv.style.border = '2px solid #48bb78';
    } else if (type === 'error') {
        statusDiv.style.background = 'rgba(229, 62, 62, 0.2)';
        statusDiv.style.color = '#c53030';
        statusDiv.style.border = '2px solid #e53e3e';
    } else if (type === 'info') {
        statusDiv.style.background = 'rgba(49, 130, 206, 0.2)';
        statusDiv.style.color = '#2b6cb0';
        statusDiv.style.border = '2px solid #3182ce';
    }
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Helper function to calculate team power
function calculateTeamPower(teamArray) {
    return teamArray.reduce((sum, player) => sum + player.power, 0);
}

// manualMovePlayer function
function manualMovePlayer(playerId, targetTeam) {
    let playerToMove;
    let sourceTeam;
    let destinationTeam;
    let sourceTeamArray;
    let destinationTeamArray;

    // Find player in Team A
    playerToMove = currentTeamA.find(p => p.id === playerId);
    if (playerToMove) {
        sourceTeam = 'A';
        sourceTeamArray = currentTeamA;
    } else {
        // Find player in Team B
        playerToMove = currentTeamB.find(p => p.id === playerId);
        if (playerToMove) {
            sourceTeam = 'B';
            sourceTeamArray = currentTeamB;
        }
    }

    if (!playerToMove) {
        console.error("Player not found in current teams for manual move:", playerId);
        return;
    }

    // Determine destination team
    if (targetTeam === 'A') {
        destinationTeamArray = currentTeamA;
    } else if (targetTeam === 'B') {
        destinationTeamArray = currentTeamB;
    } else {
        console.error("Invalid target team:", targetTeam);
        return;
    }

    // Prevent moving to the same team
    if (sourceTeam === targetTeam) {
        console.warn("Player is already in the target team.");
        return;
    }

    // Remove player from source team
    if (sourceTeam === 'A') {
        currentTeamA = currentTeamA.filter(p => p.id !== playerId);
    } else {
        currentTeamB = currentTeamB.filter(p => p.id !== playerId);
    }

    // Add player to destination team
    destinationTeamArray.push(playerToMove);

    // Recalculate team powers (displayTeams will also do this, but good to have it here too)
    currentTeamAPower = calculateTeamPower(currentTeamA);
    currentTeamBPower = calculateTeamPower(currentTeamB);

    // Refresh the display
    displayTeams();
}
function showCustomAlert(title, message, type = 'info') {
    const alertModal = document.getElementById('customAlertModal');
    const alertTitle = document.getElementById('customAlertTitle');
    const alertMessage = document.getElementById('customAlertMessage');
    const okButton = document.getElementById('customAlertOk');

    alertTitle.textContent = title;
    alertMessage.textContent = message;

    // Başlık ve mesaj rengini ayarla
    if (type === 'success') {
        alertTitle.style.color = '#2f855a';
        alertMessage.style.color = '#2f855a';
    } else if (type === 'error') {
        alertTitle.style.color = '#c53030';
        alertMessage.style.color = '#c53030';
    } else if (type === 'info') {
        alertTitle.style.color = '#2b6cb0';
        alertMessage.style.color = '#2b6cb0';
    } else {
        alertTitle.style.color = '#4a5568';
        alertMessage.style.color = '#4a5568';
    }

    alertModal.style.display = 'flex';
}

// Özel onay modalını gösterir (confirm() yerine)
function showConfirmation(title, message) {
    return new Promise((resolve) => {
        resolveConfirmation = resolve; // Promise'i dışarıya taşı
        const confirmModal = document.getElementById('confirmationModal');
        const confirmTitle = document.getElementById('confirmationModalTitle');
        const confirmMessage = document.getElementById('confirmationModalMessage');

        confirmTitle.textContent = title;
        confirmMessage.textContent = message;

        confirmModal.style.display = 'flex';
    });
}

// showStatus fonksiyonunu modalın içindeki status div'i için de kullanabilmek adına güncellendi.
// Eğer targetId verilirse o div'i kullanır, yoksa backupStatus'u kullanır.
function showStatus(message, type, targetId = 'backupStatus') {
    const statusDiv = document.getElementById(targetId);
    if (!statusDiv) return; // Hedef div yoksa işlem yapma

    statusDiv.style.display = 'block';
    statusDiv.textContent = message;
    
    if (type === 'success') {
        statusDiv.className = 'status-message success';
    } else if (type === 'error') {
        statusDiv.className = 'status-message error';
    } else if (type === 'info') {
        statusDiv.className = 'status-message info';
    }
    
    // Sadece backupStatus için otomatik gizleme yapalım, editStatus için manuel kontrol daha iyi
    if (targetId === 'backupStatus') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}