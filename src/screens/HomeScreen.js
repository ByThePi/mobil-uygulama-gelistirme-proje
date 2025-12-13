import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState } from 'react-native';
import { saveSession } from '../utils/storage'; // YENİ EKLENDİ

export default function HomeScreen() {
  const INITIAL_TIME = 25 * 60; // 25 dakika
  
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState(null);
  
  // YENİ: Dikkat dağınıklığı sayacı
  const [distractionCount, setDistractionCount] = useState(0);

  // AppState'i takip etmek için ref kullanıyoruz
  const appState = useRef(AppState.currentState);

  const categories = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

  // 1. SAYAÇ MANTIĞI
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
        setIsActive(false);
        clearInterval(interval);
        Alert.alert("Tebrikler!", "Odaklanma seansını başarıyla tamamladın.");
        saveCurrentSession(INITIAL_TIME); // <--- BU SATIRI EKLE (Süre bitti, tam zamanı kaydet)
     }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 2. APPSTATE (ODAKLANMA TAKİBİ) MANTIĞI - YENİ KISIM
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Eğer uygulama arka plana (background) veya inaktif duruma geçerse
      if (
        appState.current.match(/active/) && 
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        // Eğer sayaç çalışıyorsa durdur ve dikkati dağıldı say
        if (isActive) {
            setIsActive(false); // Sayacı duraklat
            setDistractionCount(prev => prev + 1); // Hatayı 1 arttır
            Alert.alert("Dikkat Dağınıklığı!", "Uygulamadan çıktığınız için sayaç duraklatıldı.");
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]); // isActive bağımlılığı önemli: sadece sayaç çalışırken takip etsin

  // Yardımcı Fonksiyonlar
  const startTimer = () => {
    if (!category) {
      Alert.alert("Uyarı", "Lütfen önce bir kategori seçin!");
      return;
    }
    setIsActive(true);
  };

  const pauseTimer = () => setIsActive(false);

  // Mevcut resetTimer fonksiyonunu SİL ve bunu YAPIŞTIR
  const resetTimer = async () => {
    // Eğer kayda değer bir süre (örn: 10 saniye) çalışıldıysa kaydetmeyi teklif et
    const timeSpent = INITIAL_TIME - timeLeft;
    
    if (timeSpent > 10 && isActive) { // Sadece çalışıyorken sor
        Alert.alert(
            "Seansı Bitir",
            "Bu oturumu kaydetmek ister misiniz?",
            [
                {
                    text: "Kaydetme",
                    style: "cancel",
                    onPress: () => {
                        stopAndReset();
                    }
                },
                {
                    text: "Kaydet",
                    onPress: async () => {
                        await saveCurrentSession(timeSpent);
                        stopAndReset();
                    }
                }
            ]
        );
    } else {
        stopAndReset();
    }
  };

  const stopAndReset = () => {
    setIsActive(false);
    setTimeLeft(INITIAL_TIME);
    setDistractionCount(0);
  };

  // Veriyi hazırlayıp kaydeden fonksiyon
  const saveCurrentSession = async (duration) => {
    const sessionData = {
        id: Date.now().toString(), // Benzersiz ID
        date: new Date().toISOString(), // Tarih
        duration: duration, // Saniye cinsinden odaklanma süresi
        category: category || "Genel",
        distractionCount: distractionCount
    };
    await saveSession(sessionData);
    Alert.alert("Başarılı", "Odaklanma seansınız kaydedildi!");
  };

  // Ayrıca: Süre kendiliğinden biterse (0 olursa) otomatik kaydetmesi için
  // useEffect içindeki 'timeLeft === 0' bloğuna şu satırı ekle:
  /*
     else if (timeLeft === 0) {
        setIsActive(false);
        clearInterval(interval);
        Alert.alert("Tebrikler!", "Odaklanma seansını başarıyla tamamladın.");
        saveCurrentSession(INITIAL_TIME); // <--- BU SATIRI EKLE (Süre bitti, tam zamanı kaydet)
     }
  */

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pomodoro Sayacı</Text>

      {/* Sayaç Dairesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        {/* YENİ: Dikkat Dağınıklığı Göstergesi */}
        <Text style={styles.distractionText}>Odak Kaybı: {distractionCount}</Text>
      </View>

      {/* Kategori Seçimi */}
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

      {/* Butonlar */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.buttonStart} onPress={startTimer}>
            <Text style={styles.buttonText}>Başlat</Text>
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