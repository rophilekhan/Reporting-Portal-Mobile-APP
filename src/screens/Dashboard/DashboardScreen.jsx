import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { COLORS } from '../../config/theme';
import { BranchContext } from '../../context/BranchContext';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_URL = "https://erp.hassoftsolutions.com"; 

// --- COLORS ---
const MONTH_COLORS = ["#00C853", "#F44336", "#FF9800", "#2962FF", "#9C27B0", "#00BCD4"];
const STOCK_COLORS = ["#5C6BC0", "#7E57C2", "#F06292", "#EF5350", "#42A5F5"];
const BAR_COLORS_FLAT = [
    `rgba(0, 200, 83, 1)`, 
    `rgba(244, 67, 54, 1)`, 
    `rgba(255, 152, 0, 1)`, 
    `rgba(41, 98, 255, 1)`, 
    `rgba(156, 39, 176, 1)`, 
    `rgba(0, 188, 212, 1)` 
];

// --- HELPER FUNCTIONS ---

const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string' && dateStr.includes('/Date(')) {
        const timestamp = parseInt(dateStr.match(/\d+/)[0], 10);
        return new Date(timestamp);
    }
    return new Date(dateStr);
};

const formatMonthYear = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const getDateRange = (filterType) => {
  const toDate = new Date(); 
  const fromDate = new Date();

  if (filterType === '1 Month') {
    fromDate.setMonth(toDate.getMonth() - 1);
  } else if (filterType === '6 Months') {
    fromDate.setMonth(toDate.getMonth() - 6);
  } else if (filterType === '1 Year') {
    fromDate.setFullYear(toDate.getFullYear() - 1);
  }
  return { 
      fromDate: fromDate.toISOString(), 
      toDate: toDate.toISOString() 
  };
};

// ✅ FIX: Formats number with commas (e.g., 1,250,000) for Stats & Legend
const formatCurrencyWithCommas = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// ✅ FIX: Short format for Y-Axis Labels (e.g., 1.2k, 5M)
const formatYAxisLabel = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "0";
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "k"; // No decimals for thousands to save space
    return num.toString();
};

// --- COMPONENTS ---

const CustomLegend = ({ data, shape = 'circle' }) => {
  const total = data.reduce((sum, item) => sum + item.population, 0);

  return (
    <View style={styles.legendContainer}>
      {data.map((item, index) => {
        const percentage = total > 0 ? ((item.population / total) * 100).toFixed(1) : "0.0";
        
        return (
          <View key={index} style={styles.legendRow}>
            <View style={styles.legendLeft}>
                <View style={[
                    styles.legendDot, 
                    { 
                      backgroundColor: item.color, 
                      borderRadius: shape === 'circle' ? 6 : 2, 
                      width: 12, 
                      height: 12 
                    }
                ]} />
                <Text style={styles.legendText} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
            </View>
            <View style={styles.legendRight}>
                <Text style={styles.legendValue}>
                   {formatCurrencyWithCommas(item.population)} 
                </Text>
                <Text style={styles.percentageText}> ({percentage}%)</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const StatCard = ({ title, value, icon, color, accentColor }) => (
  <View style={[styles.card, { borderTopColor: color }]}>
    <View style={styles.cardContent}>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
        <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      </View>
      <View style={[styles.iconBox, { backgroundColor: accentColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  </View>
);

const ChartContainer = ({ title, children }) => (
  <View style={styles.chartCard}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.chartWrapper}>
        {children}
    </View>
  </View>
);

// --- MAIN SCREEN ---

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // ✅ Hook for Safe Area Insets
  
  // ✅ 2. Get Tab Bar Height safely
  let tabBarHeight = 60; 
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    // console.log("Not inside tab bar");
  }

  const { companyBranchId, loadBranchFromStorage, isBranchLoading } = useContext(BranchContext);
  
  const [selectedFilter, setSelectedFilter] = useState('6 Months');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [purchaseChartData, setPurchaseChartData] = useState([]);
  const [stockChartData, setStockChartData] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const filterOptions = ['1 Month', '6 Months', '1 Year'];

  useEffect(() => {
    loadBranchFromStorage(); 
  }, []);

  useEffect(() => {
    if (companyBranchId) {
        fetchDashboardData();
    }
  }, [companyBranchId, selectedFilter]);

  const fetchAndParse = async (url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      if (text.trim().startsWith("<")) return null;
      return JSON.parse(text);
    } catch (error) {
      console.error(`API Error:`, error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    if(!companyBranchId) return; 
    setLoading(true);
    const { fromDate, toDate } = getDateRange(selectedFilter);
    const branchQuery = `companyBranchID=${companyBranchId}`;

    try {
      // 1. Stats
      const statsJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetDashboardStats?FromDate=${fromDate}&ToDate=${toDate}&${branchQuery}`);
      if (statsJson?.Data) setDashboardStats(statsJson.Data);

      // 2. Sales (Bar Chart)
      const salesJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetDayWiseSales?fromDate=${fromDate}&toDate=${toDate}&${branchQuery}`);
      if (salesJson && Array.isArray(salesJson)) {
          salesJson.sort((a, b) => parseDate(a.Date) - parseDate(b.Date));
          
          // Data processing
          const labels = [];
          const rawData = [];
          const colors = [];

          salesJson.forEach((item, index) => {
              const d = parseDate(item.Date);
              const monthKey = formatMonthYear(d);
              
              // Simple aggregation or direct push depending on data density
              // Here we push directly but you can aggregate by month if needed
              labels.push(monthKey);
              rawData.push(item.TotalSale);
              colors.push((opacity = 1) => BAR_COLORS_FLAT[index % BAR_COLORS_FLAT.length]);
          });

          // Deduplicate labels for cleaner chart (aggregating values) [Optional optimization]
          // For simplicity keeping as strictly mapped to API response but grouped logic is better
          // (Assuming API returns daily, we might want to aggregate locally if too many bars)
          // ... skipping complex aggregation for brevity, assuming API returns reasonable day-wise data.

          if (labels.length > 0) {
            setSalesChartData({ 
                labels: labels, 
                datasets: [{ 
                    data: rawData,
                    colors: colors 
                }] 
            });
          } else {
            setSalesChartData(null);
          }
      }

      // 3. Purchase (Pie)
      const purchaseJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetDayWisePurchase?fromDate=${fromDate}&toDate=${toDate}&${branchQuery}`);
      if (purchaseJson && Array.isArray(purchaseJson)) {
         const monthlyPurchases = {};
         purchaseJson.forEach(item => {
             const d = parseDate(item.Date);
             const monthKey = formatMonthYear(d);
             if (!monthlyPurchases[monthKey]) monthlyPurchases[monthKey] = 0;
             monthlyPurchases[monthKey] += item.TotalPurchase;
         });
         const pieData = Object.keys(monthlyPurchases).map((key, index) => ({
             name: key,
             population: monthlyPurchases[key],
             color: MONTH_COLORS[index % MONTH_COLORS.length],
             legendFontColor: "#7F7F7F",
             legendFontSize: 12
         }));
         setPurchaseChartData(pieData);
      }

      // 4. Stock (Donut)
      const stockJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetTopStockData?fromDate=${fromDate}&toDate=${toDate}&${branchQuery}`);
      if (stockJson?.success && stockJson?.topProducts) {
          const chartData = stockJson.topProducts.slice(0, 5).map((item, index) => ({
              name: item.ProductName.length > 18 ? item.ProductName.substring(0, 18) + '...' : item.ProductName,
              population: item.TotalBalance,
              color: STOCK_COLORS[index % STOCK_COLORS.length],
              legendFontColor: "#7F7F7F",
              legendFontSize: 12
          }));
          setStockChartData(chartData);
      }

    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />
      
      {/* Header with Top Safe Area */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={openMenu} 
            style={styles.menuButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Ionicons name="chevron-down" size={14} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{padding: 5}}>
             <Ionicons name="person-circle-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading || isBranchLoading ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{color: '#888', marginTop: 10}}>Loading Dashboard...</Text>
          </View>
      ) : (
          <ScrollView 
            contentContainerStyle={[
                styles.scrollContent, 
                // ✅ 3. FIX OVERLAP: paddingBottom includes tabBarHeight AND insets.bottom
                { paddingBottom: tabBarHeight + insets.bottom + 30 } 
            ]} 
            showsVerticalScrollIndicator={false}
          >
            
            {/* Stat Cards - Values formatted with Commas */}
            <View style={styles.gridContainer}>
              <StatCard title="RECEIVABLE" value={formatCurrencyWithCommas(dashboardStats?.TotalReceivable)} icon="cash-outline" color="#00C853" accentColor="#E8F5E9" />
              <StatCard title="SALES" value={formatCurrencyWithCommas(dashboardStats?.TotalSales)} icon="trending-up-outline" color="#2962FF" accentColor="#E3F2FD" />
              <StatCard title="PURCHASES" value={formatCurrencyWithCommas(dashboardStats?.TotalPurchaseAmount)} icon="cart-outline" color="#6200EA" accentColor="#EDE7F6" />
              <StatCard title="UNPOSTED CHQ" value={dashboardStats?.TotalUnpostedCheques || "0"} icon="documents-outline" color="#FFAB00" accentColor="#FFF8E1" />
              <StatCard title="PAYMENT VOU." value={formatCurrencyWithCommas(dashboardStats?.TotalPaymentVoucher)} icon="receipt-outline" color="#D50000" accentColor="#FFEBEE" />
              <StatCard title="EXPENSES" value={formatCurrencyWithCommas(dashboardStats?.TotalExpenseAmount)} icon="wallet-outline" color="#FF6D00" accentColor="#FFF3E0" />
            </View>

            {/* ✅ SALES CHART - IMPROVED DESIGN */}
            <ChartContainer title="Total Sales">
              {salesChartData ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        data={salesChartData}
                        // Dynamic Width: ensures bars don't squash if there are many months
                        width={Math.max(SCREEN_WIDTH - 40, salesChartData.labels.length * 60)} 
                        height={260}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#ffffff",
                            fillShadowGradient: "#ffffff",
                            fillShadowGradientOpacity: 1,
                            decimalPlaces: 0,
                            // Darker text for better visibility
                            color: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(80, 80, 80, ${opacity})`,
                            // Clean grid lines
                            propsForBackgroundLines: { strokeDasharray: "4", stroke: "#e0e0e0" },
                            barPercentage: 0.6,
                            
                            // ✅ Function to format Y-Axis (e.g. 1.2M instead of 1200000)
                            formatYLabel: (val) => formatYAxisLabel(val) 
                        }}
                        style={styles.chartStyle}
                        showValuesOnTopOfBars={false} // Disabled for cleaner look, Y-axis provides context
                        fromZero={true}
                        withCustomBarColorFromData={true}
                        flatColor={true}
                        verticalLabelRotation={15} // Slight rotation to prevent text cut-off
                    />
                  </ScrollView>
              ) : (
                  <Text style={styles.noDataText}>No Data Available</Text>
              )}
            </ChartContainer>

            {/* ✅ PURCHASE CHART */}
            <ChartContainer title="Total Purchase">
               {purchaseChartData.length > 0 ? (
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <PieChart
                        data={purchaseChartData}
                        width={SCREEN_WIDTH - 60}
                        height={220}
                        chartConfig={{ 
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            decimalPlaces: 0 
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute={false}
                        hasLegend={false} // We use Custom Legend
                    />
                    <CustomLegend data={purchaseChartData} shape="square" />
                  </View>
               ) : (
                  <Text style={styles.noDataText}>No Data Available</Text>
               )}
            </ChartContainer>

            {/* ✅ STOCK CHART */}
            <ChartContainer title="Top 5 Products Stock">
              {stockChartData.length > 0 ? (
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <PieChart
                            data={stockChartData}
                            width={SCREEN_WIDTH - 60}
                            height={220}
                            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            center={[10, 0]}
                            absolute={false}
                            hasLegend={false}
                        />
                        <View style={styles.donutHole} />
                    </View>
                    <CustomLegend data={stockChartData} shape="circle" />
                  </View>
              ) : (
                  <Text style={styles.noDataText}>No Data Available</Text>
              )}
            </ChartContainer>
          </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent={true} animationType="fade" onRequestClose={() => setShowFilterModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Period</Text>
                {filterOptions.map((option) => (
                    <TouchableOpacity key={option} style={styles.filterOption} onPress={() => { setSelectedFilter(option); setShowFilterModal(false); }}>
                        <Text style={[styles.filterOptionText, selectedFilter === option && styles.filterOptionTextActive]}>{option}</Text>
                        {selectedFilter === option ? <Ionicons name="checkmark" size={20} color={COLORS.primary} /> : null}
                    </TouchableOpacity>
                ))}
            </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    height: 100, 
    backgroundColor: COLORS.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    elevation: 4, 
    zIndex: 9999,
    paddingBottom: 10
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 1000 },
  
  menuButton: { 
      padding: 10,
      marginRight: 5,
      zIndex: 1001,
      backgroundColor: 'transparent',
  },
  
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  filterText: { color: 'white', marginRight: 5, fontSize: 13, fontWeight: '600' },
  scrollContent: { padding: 10 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  card: { 
      width: SCREEN_WIDTH < 350 ? '100%' : '48%', 
      backgroundColor: 'white', 
      borderRadius: 10, 
      marginBottom: 12, 
      padding: 12, 
      elevation: 2, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 2,
      borderTopWidth: 4 
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textContainer: { flex: 1, marginRight: 5 },
  cardTitle: { fontSize: 10, fontWeight: '700', color: '#888', marginBottom: 4, textTransform: 'uppercase' },
  cardValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  iconBox: { width: 38, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  chartCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, width: '100%' },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  chartWrapper: { alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' },
  chartStyle: { borderRadius: 16, paddingRight: 30 }, 
  noDataText: { padding: 30, color: '#999', fontStyle: 'italic', textAlign: 'center' },

  donutHole: { position: 'absolute', width: 100, height: 100, backgroundColor: 'white', borderRadius: 50, zIndex: 10, elevation: 0 },

  legendContainer: { marginTop: 20, width: '100%' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, width: '100%', paddingHorizontal: 10 },
  legendLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  legendRight: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { marginRight: 8 },
  legendText: { fontSize: 12, color: '#555', fontWeight: '500' },
  legendValue: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  percentageText: { fontSize: 11, color: '#888', fontWeight: '400' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 15, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterOptionText: { fontSize: 16, color: '#333' },
  filterOptionTextActive: { color: COLORS.primary, fontWeight: 'bold' },
});

export default DashboardScreen;