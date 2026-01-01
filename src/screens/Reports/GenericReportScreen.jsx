import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, 
  StyleSheet, Alert, StatusBar, Linking, 
  Animated, Easing, Platform, UIManager 
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native'; 

import { useReportLogic } from '../../hooks/useReportLogic';
import DataGrid from '../../components/organisms/DataGrid';
import BusinessDatePicker from '../../components/atoms/BusinessDatePicker';
import CustomDropdown from '../../components/atoms/CustomDropdown';
import { COLORS } from '../../config/theme';

const BASE_URL = "https://erp.hassoftsolutions.com/";
const SIDEBAR_WIDTH = 280;

const GenericReportScreen = ({ route, navigation }) => {
  const { name } = route;
  
  const { 
    data, columns, config, filters, isLoading, 
    updateFilter, loadReportData, activeType, setActiveType 
  } = useReportLogic(name);

  // Track state for logic
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Animation Value: 280 = Open, 0 = Closed
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

  // --- MENU OPEN FUNCTION ---
  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // --- ANIMATION TOGGLE FUNCTION ---
  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? 0 : SIDEBAR_WIDTH;
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 500, // Slower duration for smooth sliding
      useNativeDriver: false, // 'false' is required for width/height animations
      easing: Easing.out(Easing.ease), // Smooth easing function
    }).start();

    setSidebarOpen(!isSidebarOpen);
  };

  // --- AUTO-CLOSE ON SHOW ---
  const handleButtonClick = async (action) => {
    if (action === 'show') {
      loadReportData();
      
      // Close Sidebar Smoothly
      if (isSidebarOpen) {
        toggleSidebar(); 
      }
    } 
    else if (action === 'print') {
      if (!config.sidebarPrintConfig) {
        Alert.alert("Print", "Print is not configured for this report.");
        return;
      }
      const { reportName } = config.sidebarPrintConfig;
      
      const storedBranchID = await AsyncStorage.getItem('companyBranchId');
      const storedUserID = await AsyncStorage.getItem('userID'); 
      const branchID = storedBranchID || '1';
      const userID = storedUserID || '1'; 

      let url = `${BASE_URL}ReportViewer.aspx?Report='${reportName}'`;

      Object.keys(filters).forEach(key => {
        let val = filters[key];
        if (key === 'dateRange' || key === 'toDateOnly') return;
        if (val instanceof Date) {
           const year = val.getFullYear();
           const month = (val.getMonth() + 1).toString().padStart(2, '0');
           const day = val.getDate().toString().padStart(2, '0');
           val = `${year}-${month}-${day}`;
        }
        if (val === null || val === undefined) val = '';
        url += `&${key}=${val}`;
      });

      if (reportName === 'PurchaseSummaryReportMobile') {
          url += `&Status=S&UserID=${userID}`;
      }
      if (reportName === 'GoodReceiveSummaryMobile') {
          url += `&UserID=${userID}`;
      }
      url += `&companyBranchID=${branchID}`;
      Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    }
  };

  const handleRowPrint = async (item) => {
    if (!config.rowPrintConfig) return;
    const { reportName, idParam, pk } = config.rowPrintConfig;
    const idValue = item[pk]; 
    if (!idValue) return;

    const storedBranchID = await AsyncStorage.getItem('companyBranchId');
    const storedUserID = await AsyncStorage.getItem('userID');
    const branchID = storedBranchID || '1';
    const userID = storedUserID || '1';

    let url = `${BASE_URL}ReportViewer.aspx?Report='${reportName}'&${idParam}=${idValue}`;

    if (['ExpensePaymentReportMobile', 'PurchaseInvoiceReportMobile', 'GoodReceiveIndividualReportMobile'].includes(reportName)) {
        url += `&UserID=${userID}`;
    }
    url += `&companyBranchID=${branchID}`;
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView edges={['top']} style={styles.safeAreaTop} />
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeAreaBottom}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={openMenu} 
              style={styles.menuButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="menu-outline" size={35} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>{name}</Text>
          </View>

          <TouchableOpacity onPress={toggleSidebar} style={styles.optionButton}>
            <Ionicons name={isSidebarOpen ? "chevron-forward-outline" : "options-outline"} size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* ANIMATED SIDEBAR */}
          <Animated.View 
            style={[
              styles.sidebar, 
              { width: slideAnim } // Bind width to animation
            ]}
          >
            {/* Inner View with Fixed Width ensures content doesn't squash during animation */}
            <View style={{ width: SIDEBAR_WIDTH }}>
              <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
                {config?.isSpecial && config?.specialTypes && (
                  <View style={styles.tabContainer}>
                    {config.specialTypes.map((type) => (
                      <TouchableOpacity 
                        key={type.label}
                        style={[styles.tabButton, activeType?.label === type.label && styles.tabButtonActive]}
                        onPress={() => setActiveType(type)}
                      >
                        <Text style={[styles.tabText, activeType?.label === type.label && styles.tabTextActive]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.filterTitle}>Filters</Text>

                {config?.filters?.map((filter, index) => {
                  if (filter.key === 'dateRange') {
                    return (
                      <View key={`date-${index}`}>
                        <BusinessDatePicker label="From Date" date={filters.fromDate} onDateChange={(d) => updateFilter('fromDate', d)} />
                        <BusinessDatePicker label="To Date" date={filters.toDate} onDateChange={(d) => updateFilter('toDate', d)} />
                      </View>
                    );
                  }
                  if (filter.key === 'toDateOnly') {
                    return <BusinessDatePicker key={`date-single-${index}`} label="As of Date" date={filters.toDate} onDateChange={(d) => updateFilter('toDate', d)} />;
                  }
                  if (filter.type === 'dropdown') {
                    return (
                      <CustomDropdown 
                        key={filter.key} 
                        label={filter.label} 
                        apiEndpoint={filter.api} 
                        valueField={filter.valueField} 
                        labelField={filter.labelField} 
                        value={filters[filter.key]} 
                        onChange={(val) => updateFilter(filter.key, val)} 
                      />
                    );
                  }
                  if (filter.type === 'button') {
                    return (
                      <TouchableOpacity 
                        key={`btn-${index}`} 
                        style={[styles.actionBtn, { backgroundColor: filter.color || COLORS.secondary }]} 
                        onPress={() => handleButtonClick(filter.action)}
                      >
                        <Ionicons name={filter.icon} size={18} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>{filter.label}</Text>
                      </TouchableOpacity>
                    );
                  }
                })}
              </ScrollView>
            </View>
          </Animated.View>

          {/* MAIN GRID */}
          <View style={styles.content}>
            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 50 }} />
            ) : data.length > 0 ? (
              <DataGrid 
                data={data} 
                columns={columns} 
                isGrouped={config.isGrouped} 
                groupBy={config.groupBy}
                hasSubGrid={config.hasSubGrid || (activeType && activeType.subApi ? true : false)}
                subApi={activeType?.subApi || config.subApi}
                subGridKey={config.subGridKey || `${name}_${activeType?.label}_Sub`}
                pk={activeType?.pk || config.pk || 'ID'} 
                filters={filters} 
                onPrintRow={handleRowPrint}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bar-chart-outline" size={60} color="#DDD" />
                <Text style={styles.emptyText}>Select filters and click "Show" to view data.</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: COLORS.primary },
  safeAreaTop: { flex: 0, backgroundColor: COLORS.primary },
  safeAreaBottom: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    height: 60, 
    backgroundColor: COLORS.primary, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    elevation: 4, 
    zIndex: 9999, 
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    zIndex: 1000 
  },
  
  menuButton: {
    padding: 10, 
    marginRight: 5,
    backgroundColor: 'transparent',
    zIndex: 1001,
  },
  
  optionButton: { padding: 10 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  body: { flex: 1, flexDirection: 'row' },
  
  // UPDATED SIDEBAR STYLE
  sidebar: { 
    backgroundColor: 'white', 
    borderRightWidth: 1, 
    borderColor: '#DDD', 
    elevation: 2,
    overflow: 'hidden', // Essential for clean animation
    // Width is now controlled by Animation
  },
  
  content: { flex: 1, padding: 10 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 15 },
  tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#EEE', borderRadius: 8, padding: 2 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabButtonActive: { backgroundColor: 'white', elevation: 2 },
  tabText: { color: '#666', fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  actionBtn: { flexDirection: 'row', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 2 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 },
});

export default GenericReportScreen;