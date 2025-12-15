import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveSession } from '../utils/storage';


import CategorySelector from '../components/CategorySelector';
import TimerCircle from '../components/TimerCircle';

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
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      finishSession();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && (nextAppState === 'background' || nextAppState === 'inactive')) {
        if (isActive) {
            setIsActive(false);
            setDistractionCount(p => p + 1);
            Alert.alert("Dikkat Dağınıklığı!", "Uygulamadan çıktığınız için sayaç duraklatıldı.");
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
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
    Alert.alert("Tebrikler! 🎉", "Odaklanma seansını başarıyla tamamladın.", [{ text: "Tamam", onPress: () => softReset() }]);
  };

  const saveCurrentSession = async (duration) => {
    await saveSession({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration,
        category: category || "Genel",
        distractionCount
    });
  };

  const softReset = () => {
    setTimeLeft(initialTime);
    setDistractionCount(0);
    setIsActive(false);
  };

  const startTimer = () => {
    if (!category) { Alert.alert("Uyarı", "Lütfen önce bir kategori seçin!"); return; }
    if (timeLeft === 0) { setTimeLeft(initialTime); setDistractionCount(0); }
    setIsActive(true);
  };

  const resetTimer = () => {
    if (timeLeft === initialTime) { softReset(); return; }
    Alert.alert("Seansı Bitir", "Kaydetmek ister misiniz?", [
        { text: "Kaydetme", style: "cancel", onPress: softReset },
        { text: "Kaydet", onPress: async () => {
            const timeSpent = initialTime - timeLeft;
            if (timeSpent > 10) await saveCurrentSession(timeSpent);
            softReset();
        }}
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pomodoro Sayacı</Text>

      {/* SAYAÇ VE BUTONLAR */}
      <View style={styles.timerWrapper}>
        <TouchableOpacity style={styles.adjustButton} onPress={decreaseTime} disabled={isActive}>
            <Ionicons name="remove-circle-outline" size={45} color={isActive ? "#ccc" : "#e74c3c"} />
        </TouchableOpacity>

        {/* Bileşen Kullanımı */}
        <TimerCircle seconds={timeLeft} distractionCount={distractionCount} />

        <TouchableOpacity style={styles.adjustButton} onPress={increaseTime} disabled={isActive}>
             <Ionicons name="add-circle-outline" size={45} color={isActive ? "#ccc" : "#2ecc71"} />
        </TouchableOpacity>
      </View>

      {/* Kategori Bileşeni Kullanımı */}
      <CategorySelector 
        categories={categories} 
        selectedCategory={category} 
        onSelect={setCategory} 
        disabled={isActive} 
      />

      {/* Kontrol Butonları */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.buttonStart} onPress={startTimer}>
            <Text style={styles.buttonText}>{timeLeft < initialTime && timeLeft > 0 ? "Devam Et" : "Başlat"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.buttonPause} onPress={() => setIsActive(false)}>
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
  timerWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, width: '100%' },
  adjustButton: { padding: 5 },
  controls: { flexDirection: 'row', gap: 20 },
  buttonStart: { backgroundColor: '#2ecc71', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  buttonPause: { backgroundColor: '#f1c40f', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  buttonReset: { backgroundColor: '#e74c3c', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});