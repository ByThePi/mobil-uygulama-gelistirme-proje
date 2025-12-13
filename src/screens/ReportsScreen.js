import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getSessions, clearSessions } from '../utils/storage'; // clearSessions eklendi

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistractions: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  // Sayfaya her gelindiğinde verileri çek
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getSessions();
    setSessions(data);
    calculateStats(data);
  };

  const calculateStats = (data) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayTotal = 0;
    let grandTotal = 0;
    let distractions = 0;

    data.forEach(item => {
      const itemDate = item.date.split('T')[0];
      grandTotal += item.duration;
      distractions += item.distractionCount;

      if (itemDate === todayStr) {
        todayTotal += item.duration;
      }
    });

    setStats({
      todayFocus: Math.floor(todayTotal / 60),
      totalFocus: Math.floor(grandTotal / 60),
      totalDistractions: distractions
    });
  };

  // --- YENİ: VERİ SIFIRLAMA FONKSİYONU ---
  const handleResetData = () => {
    Alert.alert(
      "Verileri Sıfırla",
      "Tüm odaklanma geçmişiniz ve istatistikleriniz silinecek. Emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Sil", 
          style: 'destructive', // iOS'ta kırmızı gösterir
          onPress: async () => {
            await clearSessions(); // Veritabanını temizle
            await loadData(); // Ekranı yenile (Grafikleri boşalt)
            Alert.alert("Başarılı", "Tüm veriler temizlendi.");
          }
        }
      ]
    );
  };

  // Grafik Verileri Hazırlama
  const getPieData = () => {
    const categoryMap = {};
    sessions.forEach(s => {
      if (!categoryMap[s.category]) categoryMap[s.category] = 0;
      categoryMap[s.category] += Math.floor(s.duration / 60);
    });

    // Veri yoksa boş dönmesin diye kontrol
    if (Object.keys(categoryMap).length === 0) {
       return [{ name: "Veri Yok", population: 100, color: "#e0e0e0", legendFontColor: "#7F7F7F", legendFontSize: 12 }];
    }

    const colors = ['#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#95a5a6']; // Gri renk eklendi (Diğer için)
    return Object.keys(categoryMap).map((key, index) => ({
      name: key,
      population: categoryMap[key],
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }));
  };

  const getBarData = () => {
    const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    const last7Days = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      last7Days.push(dayName);
      
      const totalSeconds = sessions
        .filter(s => s.date.startsWith(dateStr))
        .reduce((sum, item) => sum + item.duration, 0);
      
      values.push(Math.floor(totalSeconds / 60));
    }

    return {
      labels: last7Days,
      datasets: [{ data: values }]
    };
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.header}>İstatistikler</Text>

      <View style={styles.statsContainer}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Bugün</Text>
            <Text style={styles.cardValue}>{stats.todayFocus} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Toplam</Text>
            <Text style={styles.cardValue}>{stats.totalFocus} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Odak Kaybı</Text>
            <Text style={styles.cardValue}>{stats.totalDistractions}</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
      <BarChart
        data={getBarData()}
        width={screenWidth - 30}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero
      />

      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      <PieChart
        data={getPieData()}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />

      {/* YENİ: SIFIRLAMA BUTONU */}
      <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
        <Text style={styles.resetButtonText}>Tüm Verileri Sıfırla</Text>
      </TouchableOpacity>
      
      <View style={{height: 50}} /> 
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50, paddingHorizontal: 15 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  card: { 
    backgroundColor: '#fff', width: '30%', padding: 10, borderRadius: 10, 
    elevation: 3, alignItems: 'center' 
  },
  cardTitle: { fontSize: 12, color: '#666', marginBottom: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },

  chartTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#444' },
  chart: { marginVertical: 8, borderRadius: 16 },

  // Yeni Buton Stilleri
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  resetButtonText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 16
  }
});