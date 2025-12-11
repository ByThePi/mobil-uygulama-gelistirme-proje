import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

export default function HomeScreen() {
  // 25 dakika = 1500 saniye
  const INITIAL_TIME = 25 * 60; 
  
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState(null); // Seçilen kategori

  const categories = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

  // Sayaç Mantığı (useEffect)
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Süre bittiğinde
      setIsActive(false);
      clearInterval(interval);
      Alert.alert("Tebrikler!", "Odaklanma seansını başarıyla tamamladın.");
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Yardımcı Fonksiyonlar
  const startTimer = () => {
    if (!category) {
      Alert.alert("Uyarı", "Lütfen önce bir kategori seçin!");
      return;
    }
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(INITIAL_TIME);
    // İstersen kategoriyi de sıfırlayabilirsin: setCategory(null);
  };

  // Saniyeyi Dakika:Saniye formatına çevir (Örn: 25:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pomodoro Sayacı</Text>

      {/* Sayaç Göstergesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
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
                category === cat && styles.selectedCategory // Seçiliyse rengi değiştir
              ]}
              onPress={() => !isActive && setCategory(cat)} // Sayaç çalışırken değiştirmesin
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.selectedCategoryText
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kontrol Butonları */}
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
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  
  timerContainer: {
    width: 250, height: 250, borderRadius: 125, borderWidth: 4, borderColor: '#4a90e2',
    justifyContent: 'center', alignItems: 'center', marginBottom: 30
  },
  timerText: { fontSize: 60, fontWeight: 'bold', color: '#333' },
  
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