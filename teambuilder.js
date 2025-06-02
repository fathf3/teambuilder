// Veri depolama için değişkenler
let players = [];

// Sayfa yüklendiğinde verileri yükle
document.addEventListener('DOMContentLoaded', function() {
    loadPlayers();
    updateStats();
    updateAvailableCount();
});

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
            <td>${player.position}</td> <td>${player.power}</td>    <td>
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

    displayTeams(teamA, teamB, teamAPower, teamBPower);
}

// Takımları görüntüleme
function displayTeams(teamA, teamB, teamAPower, teamBPower) {
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
    teamA.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${player.name} (${player.position} - ${player.power})`; // Mevki ve gücü göster
        li.style.animationDelay = `${index * 0.1}s`;
        teamAList.appendChild(li);
    });

    // B takımını ekle
    teamB.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${player.name} (${player.position} - ${player.power})`; // Mevki ve gücü göster
        li.style.animationDelay = `${index * 0.1}s`;
        teamBList.appendChild(li);
    });

    // Oyuncu sayılarını göster
    countA.textContent = `Toplam: ${teamA.length} oyuncu`;
    countB.textContent = `Toplam: ${teamB.length} oyuncu`;

    // Ortalama güçleri göster
    avgPowerA.textContent = `Ortalama Güç: ${teamA.length > 0 ? (teamAPower / teamA.length).toFixed(1) : 0}`;
    avgPowerB.textContent = `Ortalama Güç: ${teamB.length > 0 ? (teamBPower / teamB.length).toFixed(1) : 0}`;


    // Takım containerını göster
    teamsContainer.style.display = 'grid';
    
    // Smooth scroll to teams
    setTimeout(() => {
        teamsContainer.scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Veri kaydetme (artık sadece geçici bellek)
function savePlayers() {
    // Sadece session süresince bellekte tut
    window.playersStorage = {
        players: JSON.stringify(players),
        timestamp: Date.now()
    };
}

// Veri yükleme (sadece session süresince)
function loadPlayers() {
    // Session boyunca bellekte tutulan veriyi yükle
    if (window.playersStorage && window.playersStorage.players) {
        try {
            players = JSON.parse(window.playersStorage.players);
            renderPlayersTable();
        } catch(e) {
            console.log('Veri yüklenirken hata oluştu');
            players = [];
        }
    }
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

// Durum mesajı gösterme
function showStatus(message, type) {
    const statusDiv = document.getElementById('backupStatus');
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