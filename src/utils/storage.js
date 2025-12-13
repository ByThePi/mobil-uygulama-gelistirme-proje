import AsyncStorage from '@react-native-async-storage/async-storage';

// Verileri kaydetme anahtarı
const STORAGE_KEY = '@focus_sessions';

// Yeni bir seans kaydet
export const saveSession = async (sessionData) => {
  try {
    // 1. Mevcut verileri çek
    const existingData = await getSessions();
    // 2. Yeni veriyi ekle
    const newData = [...existingData, sessionData];
    // 3. Hepsini tekrar kaydet
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    console.log("Seans kaydedildi:", sessionData);
  } catch (e) {
    console.error("Kaydetme hatası:", e);
  }
};

// Tüm seansları getir
export const getSessions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Okuma hatası:", e);
    return [];
  }
};

// (Opsiyonel) Tüm verileri temizle - Test ederken işine yarar
export const clearSessions = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch(e) {
    console.error(e);
  }
};