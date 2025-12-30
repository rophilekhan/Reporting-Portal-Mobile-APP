import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../config/theme';

const screenWidth = Dimensions.get("window").width;

const StatCard = ({ title, value, icon, color }) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="menu" size={28} color="white" onPress={() => navigation.openDrawer()} />
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Ionicons name="notifications" size={24} color="white" />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard title="Sales" value="$45,000" icon="cart" color={COLORS.secondary} />
          <StatCard title="Purchases" value="$12,000" icon="bag" color="#FF6B6B" />
          <StatCard title="Expenses" value="$5,000" icon="cash" color="#FFC107" />
          <StatCard title="Inventory" value="1,200" icon="cube" color="#4CAF50" />
        </View>

        <Text style={styles.sectionTitle}>Sales Overview</Text>
        <LineChart
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{ data: [20, 45, 28, 80, 99, 43] }]
          }}
          width={screenWidth - 30}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 155, 169, ${opacity})`, // Teal color
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 80, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  iconBox: { padding: 10, borderRadius: 8, marginRight: 10 },
  cardTitle: { color: '#888', fontSize: 12 },
  cardValue: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: COLORS.primary },
  chart: { marginVertical: 8, borderRadius: 16, paddingRight: 30 }
});

export default DashboardScreen;