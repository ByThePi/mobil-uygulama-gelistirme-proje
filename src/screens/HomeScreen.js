import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { saveSession } from '../utils/storage'; 

export default function HomeScreen() {
  const [initialTime, setInitialTime] = useState(25 * 60); 
  
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState(null);
  const [distractionCount, setDistractionCount] = useState(0);

  const appState = useRef(AppState.currentState);

  const categories = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma", "Diğer"];

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      finishSession();
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

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

  const increaseTime = () => {
    if (isActive) return;
    const newTime = initialTime + 60;
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  const decreaseTime = () => {
    if (isActive) return;
    if (initialTime > 60) {
        const newTime = initialTime - 60;
        setInitialTime(newTime);
        setTimeLeft(newTime);
    }
  };

  const finishSession = async () => {
    setIsActive(false);
    await saveCurrentSession(initialTime);
    Alert.alert(
        "Tebrikler! 🎉", 
        "Odaklanma seansını başarıyla tamamladın ve verilerin kaydedildi.",
        [
            { text: "Tamam", onPress: () => softReset() }
        ]
    );
  };

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

  const softReset = () => {
    setTimeLeft(initialTime);
    setDistractionCount(0);
    setIsActive(false);
  };

  const startTimer = () => {
    if (!category) {
      Alert.alert("Uyarı", "Lütfen önce bir kategori seçin!");
      return;
    }
    if (timeLeft === 0) {
        setTimeLeft(initialTime);
        setDistractionCount(0);
    }
    setIsActive(true);
  };

  const pauseTimer = () => setIsActive(false);

  const resetTimer = () => {
    if (timeLeft === initialTime) {
        softReset();
        return;
    }

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
                    const timeSpent = initialTime - timeLeft;
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

      <View style={styles.timerWrapper}>
        
        <TouchableOpacity 
            style={[styles.adjustButton, isActive && styles.disabledButton]} 
            onPress={decreaseTime}
            disabled={isActive}
        >
            <Ionicons name="remove-circle-outline" size={45} color={isActive ? "#ccc" : "#e74c3c"} />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.distractionText}>Odak Kaybı: {distractionCount}</Text>
        </View>

        <TouchableOpacity 
            style={[styles.adjustButton, isActive && styles.disabledButton]} 
            onPress={increaseTime}
            disabled={isActive}
        >
             <Ionicons name="add-circle-outline" size={45} color={isActive ? "#ccc" : "#2ecc71"} />
        </TouchableOpacity>

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
            <Text style={styles.buttonText}>
                {timeLeft < initialTime && timeLeft > 0 ? "Devam Et" : "Başlat"}
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
  
  // DÜZELTME: Genişlik ve hizalama ayarları
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Tam ortala
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 10, // Kenarlardan hafif boşluk bırak
  },
  adjustButton: {
    padding: 5, // Butonun kendi boşluğunu azalttık
  },
  disabledButton: {
    opacity: 0.5
  },
  
  // DÜZELTME: Boyut küçültüldü (240 -> 200)
  timerContainer: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 4, borderColor: '#4a90e2',
    justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 10, // Yanlardan biraz daha az boşluk
  },
  // DÜZELTME: Font boyutu küçültüldü
  timerText: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  distractionText: { fontSize: 13, color: 'red', marginTop: 8, fontWeight: 'bold' },
  
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