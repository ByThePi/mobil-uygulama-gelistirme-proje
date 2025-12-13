import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState } from 'react-native';
import { saveSession } from '../utils/storage'; 

export default function HomeScreen() {
  const INITIAL_TIME = 2 * 60; // 25 dakika
  
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState(null);
  const [distractionCount, setDistractionCount] = useState(0);

  // AppState takibi için ref
  const appState = useRef(AppState.currentState);

  const categories = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

  // 1. SAYAÇ VE BİTİŞ MANTIĞI
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // SÜRE BİTTİĞİ AN (Sadece isActive true ise girer, bu sayede loop engellenir)
      finishSession();
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 2. ODAKLANMA TAKİBİ (APP STATE)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) && 
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        if (isActive) {
            setIsActive(false);
            setDistractionCount(prev => prev + 1);
            Alert.alert("Dikkat Dağınıklığı!", "Uygulamadan çıktığınız için sayaç duraklatıldı.");
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  // --- YENİ FONKSİYONLAR ---

  // Süre bittiğinde çalışacak tek fonksiyon
  const finishSession = async () => {
    setIsActive(false); // Önce sayacı durdur
    
    // Veriyi kaydet
    await saveCurrentSession(INITIAL_TIME);

    // Tek bir tebrik mesajı göster ve süreyi sıfırla
    Alert.alert(
        "Tebrikler! 🎉", 
        "Odaklanma seansını başarıyla tamamladın ve verilerin kaydedildi.",
        [
            { text: "Tamam", onPress: () => softReset() }
        ]
    );
  };

  // Veriyi veritabanına işleyen fonksiyon
  const saveCurrentSession = async (duration) => {
    const sessionData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: duration,
        category: category || "Genel",
        distractionCount: distractionCount
    };
    await saveSession(sessionData);
  };

  // Sayaç bittiğinde süreyi başa saran fonksiyon (Kategori kalır)
  const softReset = () => {
    setTimeLeft(INITIAL_TIME);
    setDistractionCount(0);
    setIsActive(false);
  };

  // Buton Fonksiyonları
  const startTimer = () => {
    if (!category) {
      Alert.alert("Uyarı", "Lütfen önce bir kategori seçin!");
      return;
    }
    // Eğer süre 0 ise (bittiği halde tekrar basıldıysa) başa al
    if (timeLeft === 0) {
        setTimeLeft(INITIAL_TIME);
        setDistractionCount(0);
    }
    setIsActive(true);
  };

  const pauseTimer = () => setIsActive(false);

  const resetTimer = () => {
    // Eğer süre hiç başlamadıysa veya tamamsa direkt sıfırla
    if (timeLeft === INITIAL_TIME) {
        softReset();
        return;
    }

    // Kullanıcı manuel sıfırlıyorsa soralım
    Alert.alert(
        "Seansı Bitir",
        "Bu oturumu kaydetmek ister misiniz?",
        [
            {
                text: "Kaydetme",
                style: "cancel",
                onPress: () => softReset()
            },
            {
                text: "Kaydet",
                onPress: async () => {
                    const timeSpent = INITIAL_TIME - timeLeft;
                    // Çok kısa süreleri (örn 10 sn altı) kaydetmesin
                    if (timeSpent > 10) {
                        await saveCurrentSession(timeSpent);
                    }
                    softReset();
                }
            }
        ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pomodoro Sayacı</Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.distractionText}>Odak Kaybı: {distractionCount}</Text>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.subHeader}>Kategori Seç:</Text>
        <View style={styles.categoryList}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory
              ]}
              onPress={() => !isActive && setCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.selectedCategoryText
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.buttonStart} onPress={startTimer}>
            {/* DÜZELTME: Süre başlamışsa ve durmuşsa 'Devam Et' yazar */}
            <Text style={styles.buttonText}>
                {timeLeft < INITIAL_TIME && timeLeft > 0 ? "Devam Et" : "Başlat"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.buttonPause} onPress={pauseTimer}>
            <Text style={styles.buttonText}>Duraklat</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.buttonReset} onPress={resetTimer}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  timerContainer: {
    width: 250, height: 250, borderRadius: 125, borderWidth: 4, borderColor: '#4a90e2',
    justifyContent: 'center', alignItems: 'center', marginBottom: 30
  },
  timerText: { fontSize: 60, fontWeight: 'bold', color: '#333' },
  distractionText: { fontSize: 16, color: 'red', marginTop: 10, fontWeight: 'bold' },
  
  categoryContainer: { width: '90%', marginBottom: 30 },
  subHeader: { fontSize: 16, marginBottom: 10, color: '#666', textAlign: 'center' },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  
  categoryButton: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#f0f0f0', margin: 5, borderWidth: 1, borderColor: '#ddd'
  },
  selectedCategory: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
  categoryText: { color: '#333' },
  selectedCategoryText: { color: '#fff', fontWeight: 'bold' },
  
  controls: { flexDirection: 'row', gap: 20 },
  buttonStart: { backgroundColor: '#2ecc71', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  buttonPause: { backgroundColor: '#f1c40f', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  buttonReset: { backgroundColor: '#e74c3c', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});