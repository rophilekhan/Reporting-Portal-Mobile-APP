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

const API_URL = "https://erp.hassoftsolutions.com"; 

// --- MISSING COLORS ---
const MONTH_COLORS = ["#00C853", "#F44336", "#FF9800", "#2962FF", "#9C27B0", "#00BCD4"];
const STOCK_COLORS = ["#5C6BC0", "#5E72E4", "#F06292", "#EF5350", "#42A5F5"];
const BAR_COLORS = ["#00C853", "#F44336", "#FF9800", "#2962FF", "#9C27B0", "#00BCD4"];

// --- SHIMMER COMPONENT ---
const ShimmerPlaceholder = ({ style }) => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return <Animated.View style={[style, { backgroundColor: '#E1E9EE', opacity }]} />;
};

const SkeletonLoader = ({ cardWidth, padding }) => (
  <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
    <View style={[styles.gridContainer, { padding: padding }]}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={[styles.card, { width: cardWidth, height: 80, borderLeftWidth: 0 }]}>
           <View style={{ flex: 1, padding: 12 }}>
              <ShimmerPlaceholder style={{ width: '60%', height: 10, borderRadius: 5, marginBottom: 10 }} />
              <ShimmerPlaceholder style={{ width: '80%', height: 20, borderRadius: 5 }} />
           </View>
        </View>
      ))}
    </View>
    <View style={{ paddingHorizontal: padding, marginBottom: 16 }}>
       <View style={[styles.chartCard, { height: 240, justifyContent: 'center' }]}>
          <ShimmerPlaceholder style={{ width: '40%', height: 15, borderRadius: 5, marginBottom: 20 }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 150 }}>
            {[1, 2, 3, 4, 5, 6].map(b => <ShimmerPlaceholder key={b} style={{ width: 30, height: 20 * b + 20, borderRadius: 4 }} />)}
          </View>
       </View>
    </View>
  </ScrollView>
);

// --- HELPERS ---
const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string' && dateStr.includes('/Date(')) {
        const timestamp = parseInt(dateStr.match(/\d+/)[0], 10);
        return new Date(timestamp);
    }
    return new Date(dateStr);
};

const formatCardValue = (val) => {
    const num = Number(val);
    if (isNaN(num) || num === 0) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "k";
    return num.toString();
};

const formatMonthYear = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatShortMonth = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[date.getMonth()];
};

const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDateRange = (filterType, customFrom, customTo) => {
  const toDate = new Date(); 
  const fromDate = new Date();
  if (filterType === 'Last Month') fromDate.setMonth(toDate.getMonth() - 1);
  else if (filterType === '6 Months') fromDate.setMonth(toDate.getMonth() - 6);
  else if (filterType === '1 Year') fromDate.setFullYear(toDate.getFullYear() - 1);
  else if (filterType === 'Custom' && customFrom && customTo) {
      return { fromDate: formatDateForAPI(customFrom), toDate: formatDateForAPI(customTo) };
  }
  return { fromDate: formatDateForAPI(fromDate), toDate: formatDateForAPI(toDate) };
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

const aggregateSalesData = (salesData) => {
    if (!salesData || salesData.length === 0) return null;
    const aggregated = {};
    salesData.forEach(item => {
        const date = parseDate(item.Date);
        const key = `${formatShortMonth(date)} ${String(date.getFullYear()).slice(-2)}`;
        aggregated[key] = (aggregated[key] || 0) + (item.TotalSale || 0);
    });
    const labels = Object.keys(aggregated);
    const data = Object.values(aggregated);
    return {
        labels,
        datasets: [{
            data,
            colors: labels.map((_, idx) => () => BAR_COLORS[idx % BAR_COLORS.length])
        }]
    };
};

// --- COMPONENTS ---
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

const ChartContainer = ({ title, children, isTablet }) => (
  <View style={styles.chartCard}>
    <Text style={[styles.chartTitle, { fontSize: isTablet ? 18 : 16 }]}>{title}</Text>
    <View style={styles.chartWrapper}>{children}</View>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenWidth < 360;
  
  // NEW LOGIC: If landscape, show 3 cards per row. If portrait, show 2.
  const isLandscape = screenWidth > screenHeight;
  const PADDING = 16;
  const GAP = 12;
  const columnCount = isLandscape ? 4 : 2;
  const CARD_WIDTH = (screenWidth - (PADDING * 2) - (GAP * (columnCount - 1))) / columnCount;

  const { companyBranchId, loadBranchFromStorage, isBranchLoading } = useContext(BranchContext);
  
  const [selectedFilter, setSelectedFilter] = useState('6 Months');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [purchaseChartData, setPurchaseChartData] = useState([]);
  const [stockChartData, setStockChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBranchFromStorage(); }, []);
  useEffect(() => { if (companyBranchId) fetchDashboardData(); }, [companyBranchId, selectedFilter, fromDate, toDate]);

  const fetchDashboardData = async () => {
    if(!companyBranchId) return; 
    setLoading(true);
    const range = getDateRange(selectedFilter, fromDate, toDate);
    const branchQuery = `companyBranchID=${companyBranchId}`;

    try {
      const queryParams = `fromDate=${range.fromDate}&toDate=${range.toDate}&${branchQuery}`;
      const [statsRes, salesRes, purchaseRes, stockRes] = await Promise.all([
        fetch(`${API_URL}/MobileReportsAPI/GetDashboardStats?${queryParams}`),
        fetch(`${API_URL}/MobileReportsAPI/GetDayWiseSales?${queryParams}`),
        fetch(`${API_URL}/MobileReportsAPI/GetDayWisePurchase?${queryParams}`),
        fetch(`${API_URL}/MobileReportsAPI/GetTopStockData?${queryParams}`)
      ]);

      const statsJson = await statsRes.json();
      if (statsJson?.Data) setDashboardStats(statsJson.Data);

      const salesJson = await salesRes.json();
      if (Array.isArray(salesJson)) {
          salesJson.sort((a, b) => parseDate(a.Date) - parseDate(b.Date));
          setSalesChartData(aggregateSalesData(salesJson));
      }

      const purchaseJson = await purchaseRes.json();
      if (Array.isArray(purchaseJson)) {
         const monthlyPurchases = {};
         purchaseJson.forEach(item => {
             const monthKey = formatMonthYear(parseDate(item.Date));
             monthlyPurchases[monthKey] = (monthlyPurchases[monthKey] || 0) + item.TotalPurchase;
         });
         setPurchaseChartData(Object.keys(monthlyPurchases).map((key, index) => ({
             name: key, population: monthlyPurchases[key] > 0 ? monthlyPurchases[key] : 0,
             color: MONTH_COLORS[index % MONTH_COLORS.length]
         })));
      }

      const stockJson = await stockRes.json();
      if (stockJson?.success && stockJson?.topProducts) {
          setStockChartData(stockJson.topProducts.slice(0, 5).map((item, index) => ({
              name: item.ProductName,
              population: item.TotalBalance > 0 ? item.TotalBalance : 0,
              color: STOCK_COLORS[index % STOCK_COLORS.length]
          })));
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {isFocused && (
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={false} />
      )}
      
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ERP Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterText}>{selectedFilter}</Text>
          <Ionicons name="chevron-down" size={14} color="white" />
        </TouchableOpacity>
      </View>

      {loading || isBranchLoading ? (
        <SkeletonLoader cardWidth={CARD_WIDTH} padding={PADDING} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          
          {selectedFilter === 'Custom' && (
            <View style={styles.customDateSection}>
              <BusinessDatePicker label="From" date={fromDate} onDateChange={(d) => setFromDate(d)} />
              <View style={{ width: 10 }} />
              <BusinessDatePicker label="To" date={toDate} onDateChange={(d) => setToDate(d)} />
            </View>
          )}

          <View style={[styles.gridContainer, { padding: PADDING }]}>
            <StatCard title="TOTAL RECEIVABLE" value={formatCardValue(dashboardStats?.TotalReceivable)} icon="cash-outline" color="#2E7D32" accentColor="#E8F5E9" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="TOTAL SALES" value={formatCardValue(dashboardStats?.TotalSales)} icon="trending-up-outline" color="#1976D2" accentColor="#E3F2FD" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="TOTAL PURCHASES" value={formatCardValue(dashboardStats?.TotalPurchaseAmount)} icon="cart-outline" color="#6A1B9A" accentColor="#F3E5F5" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="UNPOSTED CHEQUES" value={dashboardStats?.TotalUnpostedCheques || "0"} icon="documents-outline" color="#FF8F00" accentColor="#FFF8E1" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="PAYMENT VOUCHER" value={formatCardValue(dashboardStats?.TotalPaymentVoucher)} icon="receipt-outline" color="#D32F2F" accentColor="#FFEBEE" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
            <StatCard title="TOTAL EXPENSES" value={formatCardValue(dashboardStats?.TotalExpenseAmount)} icon="wallet-outline" color="#E65100" accentColor="#FFF3E0" cardWidth={CARD_WIDTH} isSmallScreen={isSmallScreen} />
          </View>

          {/* Rest of the UI remains exactly the same */}
          <View style={{ paddingHorizontal: PADDING, marginBottom: 16 }}>
            <ChartContainer title="Sales Performance" isTablet={isTablet}>
              {salesChartData ? (
                <View style={styles.barChartContainer}>
                  <View style={styles.yAxisContainer}>
                    {[4, 3, 2, 1, 0].map((_, idx) => {
                      const maxValue = Math.max(...salesChartData.datasets[0].data, 1);
                      return <Text key={idx} style={styles.yAxisLabel}>{formatYAxisLabel((maxValue / 4) * (4 - idx))}</Text>;
                    })}
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart data={salesChartData} width={Math.max(screenWidth - 100, salesChartData.labels.length * 70)} height={200}
                      chartConfig={{ backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff", color: (opacity = 1) => `rgba(0,0,0, ${opacity})`, labelColor: () => `#666`, barPercentage: 0.6, propsForBackgroundLines: { stroke: '#f0f0f0' } }}
                      fromZero withCustomBarColorFromData flatColor withHorizontalLabels={false} style={{ borderRadius: 16 }} />
                  </ScrollView>
                </View>
              ) : <Text style={styles.noDataText}>No Sales Data</Text>}
            </ChartContainer>
          </View>

          <View style={{ paddingHorizontal: PADDING, marginBottom: 16 }}>
            <ChartContainer title="Monthly Performance" isTablet={isTablet}>
               {purchaseChartData.length > 0 ? (
                  <View style={styles.centeredChart}>
                    <PieChart data={purchaseChartData} width={screenWidth - 40} height={200} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} center={[screenWidth / 4.5, 0]} hasLegend={false} chartConfig={{ color: (op = 1) => `rgba(0,0,0,${op})` }} />
                    <CustomLegend data={purchaseChartData} shape="square" isSmallScreen={isSmallScreen} />
                  </View>
               ) : <Text style={styles.noDataText}>No Purchase Data</Text>}
            </ChartContainer>
          </View>

          <View style={{ paddingHorizontal: PADDING, marginBottom: 16 }}>
            <ChartContainer title="Top 5 Products Stock" isTablet={isTablet}>
              {stockChartData.length > 0 ? (
                  <View style={styles.centeredChart}>
                    <View style={styles.donutStack}>
                      <PieChart data={stockChartData} width={screenWidth - 40} height={200} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} center={[screenWidth / 4.5, 0]} hasLegend={false} chartConfig={{ color: (op = 1) => `rgba(0,0,0,${op})` }} />
                      <View style={[styles.donutHole, { width: 80, height: 80, borderRadius: 40, left: (screenWidth-40)/2.11 - 15 }]} />
                    </View>
                    <CustomLegend data={stockChartData} shape="circle" isSmallScreen={isSmallScreen} />
                  </View>
              ) : <Text style={styles.noDataText}>No Stock Data</Text>}
            </ChartContainer>
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
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 8 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  filterText: { color: 'white', marginRight: 4, fontWeight: '600' },
  customDateSection: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, justifyContent: 'space-between' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardLeftStrip: { width: 5, height: '100%' },
  cardMainContent: { flex: 1, flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between' },
  textContainer: { flex: 1 },
  cardTitle: { fontWeight: '700', color: '#A3AED0', marginBottom: 4, textTransform: 'uppercase' },
  cardValue: { fontWeight: '800', color: '#1B2559' },
  iconBox: { borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  chartCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, elevation: 2 },
  chartTitle: { fontWeight: 'bold', color: '#1B2559', marginBottom: 16 },
  barChartContainer: { flexDirection: 'row' },
  yAxisContainer: { justifyContent: 'space-between', height: 170, paddingVertical: 10, marginRight: 8 },
  yAxisLabel: { fontSize: 10, color: '#666', textAlign: 'right' },
  centeredChart: { alignItems: 'center' },
  donutStack: { position: 'relative', justifyContent: 'center' },
  donutHole: { position: 'absolute', backgroundColor: 'white', zIndex: 10, top: 60 },
  legendWrapper: { width: '100%', marginTop: 10 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'flex-start' },
  legendLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1.8, paddingRight: 10 },
  legendDot: { marginTop: 4 },
  legendText: { color: '#666', fontWeight: '500', flex: 1, lineHeight: 18 },
  legendRight: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 },
  legendValue: { fontWeight: 'bold', color: '#333' },
  percentageText: { color: '#999', marginLeft: 4 },
  noDataText: { textAlign: 'center', color: '#999', padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterOptionText: { fontSize: 16 }
});

export default DashboardScreen;