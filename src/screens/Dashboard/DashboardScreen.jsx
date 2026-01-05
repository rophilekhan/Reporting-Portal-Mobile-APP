import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
  Platform
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';

import { COLORS } from '../../config/theme';
import { BranchContext } from '../../context/BranchContext';

const API_URL = "https://erp.hassoftsolutions.com"; 

// --- COLORS ---
const MONTH_COLORS = ["#00C853", "#F44336", "#FF9800", "#2962FF", "#9C27B0", "#00BCD4"];
const STOCK_COLORS = ["#5C6BC0", "#5E72E4", "#F06292", "#EF5350", "#42A5F5"];
const BAR_COLORS = ["#00C853", "#F44336", "#FF9800", "#2962FF", "#9C27B0", "#00BCD4"];

// --- HELPER FUNCTIONS ---
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

const getDateRange = (filterType) => {
  const toDate = new Date(); 
  const fromDate = new Date();
  if (filterType === 'Last Month') fromDate.setMonth(toDate.getMonth() - 1);
  else if (filterType === '6 Months') fromDate.setMonth(toDate.getMonth() - 6);
  else if (filterType === '1 Year') fromDate.setFullYear(toDate.getFullYear() - 1);
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
                <View style={[
                  styles.legendDot, 
                  { 
                    backgroundColor: item.color, 
                    borderRadius: shape === 'circle' ? 6 : 2,
                    width: isSmallScreen ? 10 : 12,
                    height: isSmallScreen ? 10 : 12
                  }
                ]} />
                <Text style={[styles.legendText, { fontSize: isSmallScreen ? 11 : 13 }]} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
            </View>
            <View style={styles.legendRight}>
                <Text style={[styles.legendValue, { fontSize: isSmallScreen ? 11 : 13 }]}>
                  {formatCurrencyWithCommas(item.population)}
                </Text>
                <Text style={[styles.percentageText, { fontSize: isSmallScreen ? 9 : 11 }]}>
                  ({percentage}%)
                </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const StatCard = ({ title, value, icon, color, accentColor, isSmallScreen, isTablet, cardWidth }) => (
  <View style={[styles.card, { width: cardWidth }, isSmallScreen && { minHeight: 85 }]}>
    <View style={[styles.cardLeftStrip, { backgroundColor: color }]} />
    <View style={styles.cardMainContent}>
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, { fontSize: isSmallScreen ? 9 : (isTablet ? 11 : 10) }]}>
          {title}
        </Text>
        <Text 
          style={[styles.cardValue, { fontSize: isSmallScreen ? 18 : (isTablet ? 24 : 22) }]} 
          numberOfLines={1} 
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {value}
        </Text>
      </View>
      <View style={[
        styles.iconBox, 
        { 
          backgroundColor: accentColor,
          width: isSmallScreen ? 36 : (isTablet ? 46 : 42),
          height: isSmallScreen ? 36 : (isTablet ? 46 : 42)
        }
      ]}>
        <Ionicons name={icon} size={isSmallScreen ? 20 : (isTablet ? 26 : 24)} color={color} />
      </View>
    </View>
  </View>
);

const ChartContainer = ({ title, children, isTablet }) => (
  <View style={styles.chartCard}>
    <View style={styles.chartHeader}>
      <Text style={[styles.chartTitle, { fontSize: isTablet ? 19 : 17 }]}>{title}</Text>
    </View>
    <View style={styles.chartWrapper}>
        {children}
    </View>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Responsive calculations
  const isLandscape = screenWidth > screenHeight;
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenWidth < 360;
  
  // Adaptive padding and sizing for landscape
  const PADDING = isTablet ? 20 : (isLandscape ? 12 : (isSmallScreen ? 12 : 16));
  const numColumns = isLandscape ? 3.5 : 2; // 3 columns in landscape, 2 in portrait
  const CARD_WIDTH = (screenWidth - (PADDING * (numColumns + 1))) / numColumns;
  const CHART_DIAMETER = isTablet ? screenWidth - (PADDING * 6) : (isLandscape ? screenWidth * 0.6 : screenWidth - (PADDING * 4));
  const DONUT_HOLE_SIZE = CHART_DIAMETER * 0.6;

  const { companyBranchId, loadBranchFromStorage, isBranchLoading } = useContext(BranchContext);
  const [selectedFilter, setSelectedFilter] = useState('6 Months');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [purchaseChartData, setPurchaseChartData] = useState([]);
  const [stockChartData, setStockChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBranchFromStorage(); }, []);
  useEffect(() => { if (companyBranchId) fetchDashboardData(); }, [companyBranchId, selectedFilter]);

  const fetchAndParse = async (url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text.trim().startsWith("<") ? null : JSON.parse(text);
    } catch (error) { return null; }
  };

  const fetchDashboardData = async () => {
    if(!companyBranchId) return; 
    setLoading(true);
    const { fromDate, toDate } = getDateRange(selectedFilter);
    const branchQuery = `companyBranchID=${companyBranchId}`;

    try {
      const statsJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetDashboardStats?fromDate=${fromDate}&toDate=${toDate}&${branchQuery}`);
      if (statsJson?.Data) setDashboardStats(statsJson.Data);

      const salesJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetDayWiseSales?fromDate=${fromDate}&toDate=${toDate}&${branchQuery}`);
      if (salesJson && Array.isArray(salesJson)) {
          salesJson.sort((a, b) => parseDate(a.Date) - parseDate(b.Date));
          setSalesChartData(aggregateSalesData(salesJson));
      }

      const purchaseJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetDayWisePurchase?fromDate=${fromDate}&toDate=${toDate}&${branchQuery}`);
      if (purchaseJson && Array.isArray(purchaseJson)) {
         const monthlyPurchases = {};
         purchaseJson.forEach(item => {
             const monthKey = formatMonthYear(parseDate(item.Date));
             monthlyPurchases[monthKey] = (monthlyPurchases[monthKey] || 0) + item.TotalPurchase;
         });
         const pieData = Object.keys(monthlyPurchases).map((key, index) => ({
             name: key,
             population: monthlyPurchases[key] > 0 ? monthlyPurchases[key] : 0,
             color: MONTH_COLORS[index % MONTH_COLORS.length]
         }));
         setPurchaseChartData(pieData);
      }

      const stockJson = await fetchAndParse(`${API_URL}/MobileReportsAPI/GetTopStockData?fromDate=${fromDate}&toDate=${toDate}&${branchQuery}`);
      if (stockJson?.success && stockJson?.topProducts) {
          const chartData = stockJson.topProducts.slice(0, 5).map((item, index) => ({
              name: item.ProductName.length > 20 ? item.ProductName.substring(0, 20) + '..' : item.ProductName,
              population: item.TotalBalance > 0 ? item.TotalBalance : 0,
              color: STOCK_COLORS[index % STOCK_COLORS.length]
          }));
          setStockChartData(chartData);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
  <StatusBar
    barStyle="light-content"
    backgroundColor="transparent"
    translucent
  />
 <View style={[styles.header, { paddingHorizontal: PADDING }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={isTablet ? 32 : (isSmallScreen ? 24 : 28)} color="white" />
          </TouchableOpacity>
          <Text style={[
            styles.headerTitle, 
            { fontSize: isTablet ? 22 : (isSmallScreen ? 17 : 20) }
          ]}>
            Dashboard
          </Text>
        </View>
        
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <Text style={[styles.filterText, { fontSize: isSmallScreen ? 11 : 13 }]}>
                {selectedFilter}
              </Text>
              <Ionicons name="chevron-down" size={isSmallScreen ? 12 : 14} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{padding: 5}}>
              <Ionicons 
                name="person-circle-outline" 
                size={isTablet ? 32 : (isSmallScreen ? 24 : 28)} 
                color="white" 
              />
          </TouchableOpacity>
        </View>
      </View>

      {loading || isBranchLoading ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.loadingText, { fontSize: isTablet ? 16 : 14 }]}>
                Loading dashboard...
              </Text>
          </View>
      ) : (
          <ScrollView 
            contentContainerStyle={{ 
              paddingBottom: insets.bottom + 20
            }} 
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.gridContainer, { paddingHorizontal: PADDING, paddingTop: PADDING }]}>
              <StatCard 
                title="TOTAL RECEIVABLE" 
                value={formatCardValue(dashboardStats?.TotalReceivable)} 
                icon="cash-outline" 
                color="#2E7D32" 
                accentColor="#E8F5E9"
                isSmallScreen={isSmallScreen}
                isTablet={isTablet}
                cardWidth={CARD_WIDTH}
              />
              <StatCard 
                title="TOTAL SALES" 
                value={formatCardValue(dashboardStats?.TotalSales)} 
                icon="trending-up-outline" 
                color="#1976D2" 
                accentColor="#E3F2FD"
                isSmallScreen={isSmallScreen}
                isTablet={isTablet}
                cardWidth={CARD_WIDTH}
              />
              <StatCard 
                title="TOTAL PURCHASES" 
                value={formatCardValue(dashboardStats?.TotalPurchaseAmount)} 
                icon="cart-outline" 
                color="#6A1B9A" 
                accentColor="#F3E5F5"
                isSmallScreen={isSmallScreen}
                isTablet={isTablet}
                cardWidth={CARD_WIDTH}
              />
              <StatCard 
                title="UNPOSTED CHEQUES" 
                value={dashboardStats?.TotalUnpostedCheques || "0"} 
                icon="documents-outline" 
                color="#FF8F00" 
                accentColor="#FFF8E1"
                isSmallScreen={isSmallScreen}
                isTablet={isTablet}
                cardWidth={CARD_WIDTH}
              />
              <StatCard 
                title="PAYMENT VOUCHER" 
                value={formatCardValue(dashboardStats?.TotalPaymentVoucher)} 
                icon="receipt-outline" 
                color="#D32F2F" 
                accentColor="#FFEBEE"
                isSmallScreen={isSmallScreen}
                isTablet={isTablet}
                cardWidth={CARD_WIDTH}
              />
              <StatCard 
                title="TOTAL EXPENSES" 
                value={formatCardValue(dashboardStats?.TotalExpenseAmount)} 
                icon="wallet-outline" 
                color="#E65100" 
                accentColor="#FFF3E0"
                isSmallScreen={isSmallScreen}
                isTablet={isTablet}
                cardWidth={CARD_WIDTH}
              />
            </View>

            {/* SALES BAR CHART */}
            <View style={{ paddingHorizontal: PADDING, marginBottom: 16 }}>
              <ChartContainer title="Total Sales" isTablet={isTablet}>
                {salesChartData ? (
                  <View style={styles.barChartContainer}>
                    <View style={[styles.yAxisContainer, { width: isSmallScreen ? 38 : 45 }]}>
                      {[4, 3, 2, 1, 0].map((_, idx) => {
                        const maxValue = Math.max(...salesChartData.datasets[0].data);
                        const value = (maxValue / 4) * (4 - idx);
                        return (
                          <Text key={idx} style={[styles.yAxisLabel, { fontSize: isSmallScreen ? 9 : 10 }]}>
                            {formatYAxisLabel(value)}
                          </Text>
                        );
                      })}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <BarChart
                        data={salesChartData}
                        width={Math.max(screenWidth - 120, salesChartData.labels.length * (isSmallScreen ? 60 : 80))}
                        height={isTablet ? 240 : (isSmallScreen ? 180 : 220)}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
                            labelColor: (opacity = 1) => `#666`,
                            barPercentage: 1.0,
                            propsForBackgroundLines: {
                              strokeDasharray: '',
                              stroke: '#e0e0e0',
                              strokeWidth: 1
                            },
                            propsForLabels: {
                              fontSize: isSmallScreen ? 9 : 10
                            }
                        }}
                        style={{ borderRadius: 16, marginLeft: 0 }}
                        fromZero={true}
                        withCustomBarColorFromData={true}
                        flatColor={true}
                        showValuesOnTopOfBars={false}
                        withInnerLines={true}
                        segments={6}
                        withHorizontalLabels={false}
                        withVerticalLabels={true}
                      />
                    </ScrollView>
                  </View>
                ) : <Text style={[styles.noDataText, { fontSize: isTablet ? 15 : 14 }]}>No Data Available</Text>}
              </ChartContainer>
            </View>

            {/* PURCHASE PIE CHART */}
            <View style={{ paddingHorizontal: PADDING, marginBottom: 16 }}>
              <ChartContainer title="Monthly Performance" isTablet={isTablet}>
                 {purchaseChartData.length > 0 ? (
                    <View style={styles.chartWrapperCentered}>
                      <PieChart
                          data={purchaseChartData}
                          width={CHART_DIAMETER}
                          height={CHART_DIAMETER}
                          chartConfig={{ color: (op = 1) => `rgba(0,0,0,${op})` }}
                          accessor={"population"}
                          backgroundColor={"transparent"}
                          paddingLeft={"0"}
                          center={[CHART_DIAMETER / 4, 0]} 
                          hasLegend={false}
                      />
                      <CustomLegend data={purchaseChartData} shape="square" isSmallScreen={isSmallScreen} />
                    </View>
                 ) : <Text style={[styles.noDataText, { fontSize: isTablet ? 15 : 14 }]}>No Data Available</Text>}
              </ChartContainer>
            </View>

            {/* STOCK DONUT CHART */}
            <View style={{ paddingHorizontal: PADDING, marginBottom: 16 }}>
              <ChartContainer title="Top 5 Products Stock" isTablet={isTablet}>
                {stockChartData.length > 0 ? (
                    <View style={styles.chartWrapperCentered}>
                      <View style={styles.donutContainer}>
                        <PieChart
                            data={stockChartData}
                            width={CHART_DIAMETER}
                            height={CHART_DIAMETER}
                            chartConfig={{ color: (op = 1) => `rgba(0,0,0,${op})` }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"0"}
                            center={[CHART_DIAMETER / 4, 0]}
                            hasLegend={false}
                        />
                        <View style={[styles.donutHole, {
                            width: DONUT_HOLE_SIZE,
                            height: DONUT_HOLE_SIZE,
                            borderRadius: DONUT_HOLE_SIZE / 2,
                            top: (CHART_DIAMETER - DONUT_HOLE_SIZE) / 2,
                            left: (CHART_DIAMETER - DONUT_HOLE_SIZE) / 2,
                        }]} />
                      </View>
                      <CustomLegend data={stockChartData} shape="circle" isSmallScreen={isSmallScreen} />
                    </View>
                ) : <Text style={[styles.noDataText, { fontSize: isTablet ? 15 : 14 }]}>No Data Available</Text>}
              </ChartContainer>
            </View>
          </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
            <View style={[styles.modalContent, { width: isTablet ? '60%' : '80%' }]}>
                <Text style={[styles.modalTitle, { fontSize: isTablet ? 21 : 19 }]}>
                  Select Period
                </Text>
                {['Last Month', '6 Months', '1 Year'].map((opt) => (
                    <TouchableOpacity 
                      key={opt} 
                      style={styles.filterOption} 
                      onPress={() => { setSelectedFilter(opt); setShowFilterModal(false); }}
                    >
                        <Text style={[
                          styles.filterOptionText, 
                          { fontSize: isTablet ? 17 : 16 },
                          selectedFilter === opt && {color: COLORS.primary, fontWeight:'bold'}
                        ]}>
                          {opt}
                        </Text>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontWeight: '500' },
  header: { 
  backgroundColor: COLORS.primary,
   paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: { elevation: 4 }
    })
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  menuButton: { padding: 8, marginRight: 4 },
  headerTitle: { color: 'white', fontWeight: 'bold', letterSpacing: 0.5, flex: 1 },
  filterButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    paddingVertical: 6, 
    paddingHorizontal: 14, 
    borderRadius: 20, 
    marginRight: 10
  },
  filterText: { color: 'white', marginRight: 4, fontWeight: '600' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  card: { 
    width: '48%', // This will be overridden by inline style in landscape
    backgroundColor: 'white', 
    borderRadius: 16, 
    marginBottom: 15, 
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 95,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8
      },
      android: { elevation: 4 }
    })
  },
  cardLeftStrip: {
    width: 6,
    height: '100%',
  },
  cardMainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textContainer: { flex: 1, marginRight: 8, minWidth: 0 },
  cardTitle: { 
    fontWeight: '700', 
    color: '#A3AED0',
    marginBottom: 6,
    letterSpacing: 0.3
  },
  cardValue: { 
    fontWeight: '800', 
    color: '#1B2559'
  },
  iconBox: { 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  chartCard: { 
    backgroundColor: 'white', 
    borderRadius: 18, 
    padding: 18, 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8
      },
      android: { elevation: 4 }
    })
  },
  chartHeader: { marginBottom: 16 },
  chartTitle: { fontWeight: 'bold', color: '#1B2559', letterSpacing: 0.3 },
  chartWrapper: {},
  chartWrapperCentered: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    height: 220,
    paddingVertical: 12,
    marginRight: 4
  },
  yAxisLabel: {
    color: '#666',
    textAlign: 'right',
    fontWeight: '500'
  },
  donutContainer: { position: 'relative' },
  donutHole: { 
    position: 'absolute', 
    backgroundColor: 'white',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  legendWrapper: { width: '100%', marginTop: 16 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  legendLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, minWidth: 0 },
  legendDot: { marginRight: 10 },
  legendText: { color: '#666', fontWeight: '500', flex: 1 },
  legendRight: { flexDirection: 'row', alignItems: 'center' },
  legendValue: { fontWeight: 'bold', color: '#333' },
  percentageText: { color: '#999', marginLeft: 4 },
  noDataText: { textAlign: 'center', color: '#999', marginVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24, maxWidth: 340 },
  modalTitle: { fontWeight: 'bold', marginBottom: 18, textAlign: 'center', color: '#1B2559' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterOptionText: { color: '#333' }
});

export default DashboardScreen;