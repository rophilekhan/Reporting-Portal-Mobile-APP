import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Modal,
  useWindowDimensions,
  Platform,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useIsFocused } from '@react-navigation/native';
import BusinessDatePicker from '../../components/atoms/BusinessDatePicker';

import { COLORS } from '../../config/theme';
import { BranchContext } from '../../context/BranchContext';

const MONTH_COLORS = ["#00C853", "#F44336", "#FF9800", "#2962FF", "#9C27B0", "#00BCD4"];
const STOCK_COLORS = ["#5C6BC0", "#5E72E4", "#F06292", "#EF5350", "#42A5F5"];
const BAR_COLORS = ["#00C853", "#F44336", "#FF9800", "#2962FF", "#9C27B0", "#00BCD4"];

// --- HELPERS ---
const formatCardValue = (val) => {
    const num = Number(val);
    if (isNaN(num) || num === 0) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "k";
    return num.toString();
};

const formatCurrencyWithCommas = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatYAxisLabel = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "k";
    return num.toString();
};

// --- COMPONENTS ---
const StatCard = ({ title, value, icon, color, accentColor, isSmallScreen, cardWidth }) => (
  <View style={[styles.card, { width: cardWidth }]}>
    <View style={[styles.cardLeftStrip, { backgroundColor: color }]} />
    <View style={styles.cardMainContent}>
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, { fontSize: isSmallScreen ? 8 : 9 }]}>{title}</Text>
        <Text style={[styles.cardValue, { fontSize: isSmallScreen ? 16 : 18 }]} numberOfLines={2} adjustsFontSizeToFit>{value}</Text>
      </View>
      <View style={[styles.iconBox, { backgroundColor: accentColor, width: isSmallScreen ? 32 : 38, height: isSmallScreen ? 32 : 38 }]}>
        <Ionicons name={icon} size={isSmallScreen ? 18 : 22} color={color} />
      </View>
    </View>
  </View>
);

const CustomLegend = ({ data, shape = 'circle', isSmallScreen }) => {
  const total = data.reduce((sum, item) => sum + (item.population > 0 ? item.population : 0), 0);
  return (
    <View style={styles.legendWrapper}>
      {data.map((item, index) => {
        const percentage = (total > 0 && item.population > 0) ? ((item.population / total) * 100).toFixed(1) : "0.0";
        return (
          <View key={index} style={styles.legendRow}>
            <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: item.color, borderRadius: shape === 'circle' ? 6 : 2, width: isSmallScreen ? 10 : 12, height: isSmallScreen ? 10 : 12, marginTop: 4, marginRight: 15 }]} />
                <Text style={[styles.legendText, { fontSize: isSmallScreen ? 11 : 13 }]} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
            </View>
            <View style={styles.legendRight}>
                <Text style={[styles.legendValue, { fontSize: isSmallScreen ? 11 : 13 }]}>{formatCurrencyWithCommas(item.population)}</Text>
                <Text style={[styles.percentageText, { fontSize: isSmallScreen ? 9 : 11 }]}>({percentage}%)</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenWidth < 360;
  
  const isLandscape = screenWidth > screenHeight;
  const PADDING = 16;
  const GAP = 12;
  const columnCount = isLandscape ? 4 : 2;
  const CARD_WIDTH = (screenWidth - (PADDING * 2) - (GAP * (columnCount - 1))) / columnCount;

  const { companyBranchId, loadBranchFromStorage } = useContext(BranchContext);
  
  const [selectedFilter, setSelectedFilter] = useState('6 Months');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [triggerFetch, setTriggerFetch] = useState(0);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [purchaseChartData, setPurchaseChartData] = useState([]);
  const [stockChartData, setStockChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load branch and data on mount
  useEffect(() => {
    const init = async () => {
        await loadBranchFromStorage();
        fetchDashboardData(); 
    };
    init();
  }, []);

  // Dashboard refresh jab branch ya filter change ho
  useEffect(() => { 
    fetchDashboardData(); 
  }, [companyBranchId, selectedFilter === 'Custom' ? triggerFetch : selectedFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fake delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // LOGIC: Branch ID (1, 2, 3...) ke mutabiq data multiply karein taake farq nazar aaye
      const multiplier = companyBranchId ? parseInt(companyBranchId) : 1;

      // 1. Dynamic Stats based on branch
      setDashboardStats({
        TotalReceivable: 5840000 * multiplier,
        TotalSales: 12450000 * multiplier,
        TotalPurchaseAmount: 8200000 * multiplier,
        TotalUnpostedCheques: multiplier > 1 ? `0${multiplier * 4}` : "08",
        TotalPaymentVoucher: 245000 * multiplier,
        TotalExpenseAmount: 980000 * multiplier
      });

      // 2. Dynamic Sales Chart
      const baseSales = [450000, 620000, 890000, 710000, 950000, 1100000];
      setSalesChartData({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          data: baseSales.map(val => val * multiplier),
          colors: [0, 1, 2, 3, 4, 5].map((idx) => () => BAR_COLORS[idx % BAR_COLORS.length])
        }]
      });

      // 3. Dynamic Stock
      setStockChartData([
        { name: "Cement Bags", population: 5000 * multiplier, color: STOCK_COLORS[0] },
        { name: "Steel Bars", population: 3200 * multiplier, color: STOCK_COLORS[1] },
        { name: "Bricks", population: 15000 * multiplier, color: STOCK_COLORS[2] },
        { name: "Paint", population: 1200 * multiplier, color: STOCK_COLORS[3] },
        { name: "Tiles", population: 4500 * multiplier, color: STOCK_COLORS[4] }
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => setTriggerFetch(prev => prev + 1);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={false} />
      
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 22 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterText}>{selectedFilter}</Text>
          <Ionicons name="chevron-down" size={14} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: '#666' }}>Refreshing Data for Branch...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.gridContainer, { padding: PADDING }]}>
            <StatCard title="TOTAL RECEIVABLE" value={formatCardValue(dashboardStats?.TotalReceivable)} icon="cash-outline" color="#2E7D32" accentColor="#E8F5E9" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="TOTAL SALES" value={formatCardValue(dashboardStats?.TotalSales)} icon="trending-up-outline" color="#1976D2" accentColor="#E3F2FD" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="TOTAL PURCHASES" value={formatCardValue(dashboardStats?.TotalPurchaseAmount)} icon="cart-outline" color="#6A1B9A" accentColor="#F3E5F5" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="UNPOSTED CHEQUES" value={dashboardStats?.TotalUnpostedCheques || "0"} icon="documents-outline" color="#FF8F00" accentColor="#FFF8E1" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="PAYMENT VOUCHER" value={formatCardValue(dashboardStats?.TotalPaymentVoucher)} icon="receipt-outline" color="#D32F2F" accentColor="#FFEBEE" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="TOTAL EXPENSES" value={formatCardValue(dashboardStats?.TotalExpenseAmount)} icon="wallet-outline" color="#E65100" accentColor="#FFF3E0" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartHeader}>Sales Performance</Text>
            {salesChartData && (
               <View style={styles.barChartContainer}>
                <View style={styles.yAxisContainer}>
                    {[4, 3, 2, 1, 0].map((_, idx) => {
                      const maxVal = Math.max(...salesChartData.datasets[0].data, 1);
                      return <Text key={idx} style={styles.yAxisLabel}>{formatYAxisLabel((maxVal / 4) * (4 - idx))}</Text>;
                    })}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        data={salesChartData}
                        width={Math.max(screenWidth - 100, 450)}
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: () => `#666`,
                            barPercentage: 0.6,
                        }}
                        fromZero
                        withCustomBarColorFromData
                        flatColor
                        withHorizontalLabels={false}
                    />
                </ScrollView>
               </View>
            )}
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartHeader}>Top 5 Products Stock</Text>
            <View style={styles.centeredChart}>
               <PieChart
                  data={stockChartData}
                  width={screenWidth - 40}
                  height={200}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[screenWidth / 4.5, 0]}
                  hasLegend={false}
                  chartConfig={{ color: (op = 1) => `rgba(0,0,0,${op})` }}
               />
               <CustomLegend data={stockChartData} isSmallScreen={isSmallScreen} />
            </View>
          </View>
        </ScrollView>
      )}

      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Period</Text>
                {['Last Month', '6 Months', '1 Year', 'Custom'].map((opt) => (
                    <TouchableOpacity key={opt} style={styles.filterOption} onPress={() => { 
                        setSelectedFilter(opt);
                        setShowFilterModal(false);
                    }}>
                        <Text style={[styles.filterOptionText, selectedFilter === opt && {color: COLORS.primary, fontWeight:'bold'}]}>{opt}</Text>
                        {selectedFilter === opt && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                    </TouchableOpacity>
                ))}
            </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 8 , marginTop:10},
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 8 , marginTop:10 },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', marginTop:10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  filterText: { color: 'white', marginRight: 6, fontWeight: '600', fontSize: 13 },
  customDateSection: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, alignItems: 'center' },
  applyFilterBtn: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 12, marginLeft: 10 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: 'white', borderRadius: 18, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  cardLeftStrip: { width: 6, height: '100%' },
  cardMainContent: { flex: 1, flexDirection: 'row', padding: 14, alignItems: 'center', justifyContent: 'space-between' },
  textContainer: { flex: 1 },
  cardTitle: { fontWeight: '700', color: '#A3AED0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontWeight: '800', color: '#1B2559' },
  iconBox: { borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  chartSection: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginHorizontal: 16, marginBottom: 16, elevation: 3 },
  chartHeader: { fontWeight: 'bold', color: '#1B2559', marginBottom: 20, fontSize: 16 },
  barChartContainer: { flexDirection: 'row' },
  yAxisContainer: { justifyContent: 'space-between', height: 180, paddingVertical: 10, marginRight: 10 },
  yAxisLabel: { fontSize: 10, color: '#999', textAlign: 'right' },
  centeredChart: { alignItems: 'center' },
  legendWrapper: { width: '100%', marginTop: 15 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  legendLeft: { flexDirection: 'row', flex: 1 },
  legendDot: { marginTop: 4 },
  legendText: { color: '#666', fontSize: 13, flex: 1 },
  legendRight: { flexDirection: 'row', alignItems: 'center' },
  legendValue: { fontWeight: 'bold', color: '#333', fontSize: 13 },
  percentageText: { color: '#AAA', marginLeft: 4, fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 18, textAlign: 'center', color: '#333' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  filterOptionText: { fontSize: 15, color: '#444' }
});

export default DashboardScreen;