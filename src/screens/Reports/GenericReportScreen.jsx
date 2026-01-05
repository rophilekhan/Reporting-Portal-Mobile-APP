import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, 
  StyleSheet, Alert, StatusBar, Linking, 
  Animated, Easing, Platform, useWindowDimensions 
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native'; 

import { useReportLogic } from '../../hooks/useReportLogic';
import DataGrid from '../../components/organisms/DataGrid';
import BusinessDatePicker from '../../components/atoms/BusinessDatePicker';
import CustomDropdown from '../../components/atoms/CustomDropdown';
import { COLORS } from '../../config/theme';

const BASE_URL = "https://erp.hassoftsolutions.com/";

const GenericReportScreen = ({ route, navigation }) => {
  const { name } = route;
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Comprehensive responsive calculations
  const isLandscape = screenWidth > screenHeight;
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenWidth < 360;
  
  // Dynamic sidebar width based on device type and orientation
  const SIDEBAR_MAX_WIDTH = isTablet 
    ? (isLandscape ? 320 : 360)
    : (isLandscape ? Math.min(280, screenWidth * 0.4) : screenWidth * 0.85);

  const { 
    data, columns, config, filters, isLoading, 
    updateFilter, loadReportData, activeType, setActiveType 
  } = useReportLogic(name);

  const [isSidebarOpen, setSidebarOpen] = useState(!isLandscape);
  const slideAnim = useRef(new Animated.Value(isSidebarOpen ? 1 : 0)).current;

  // Update sidebar state when orientation changes
  useEffect(() => {
    if (isLandscape && isSidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isLandscape]);

  // Sync animation with sidebar state
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSidebarOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start();
  }, [isSidebarOpen]);

  // Toggle Sidebar Animation
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const animatedWidth = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SIDEBAR_MAX_WIDTH],
  });

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleButtonClick = async (action) => {
    if (action === 'show') {
      // Close sidebar smoothly before loading data
      if (isSidebarOpen) {
        setSidebarOpen(false);
        // Small delay to let animation start before data loads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      loadReportData();
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

      if (reportName === 'PurchaseSummaryReportMobile') url += `&Status=S&UserID=${userID}`;
      if (reportName === 'GoodReceiveSummaryMobile') url += `&UserID=${userID}`;
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

  // Responsive styling values
  const headerHeight = isTablet ? 64 : 56;
  const PADDING = isTablet ? 18 : (isLandscape ? 12 : (isSmallScreen ? 12 : 16));
  const iconSize = isTablet ? 32 : (isSmallScreen ? 24 : 28);
  const titleSize = isTablet ? 20 : (isSmallScreen ? 16 : 18);
  const contentPadding = isTablet ? 12 : (isLandscape ? 6 : 8);

  return (
    <SafeAreaView style={styles.rootContainer} 
    edges={[ 'left', 'right']}
    >
      <StatusBar 
                barStyle="light-content" 
                backgroundColor={COLORS.primary}
                translucent={false}
              />
      
      {/* HEADER */}
       <View style={[styles.header, { paddingHorizontal: PADDING }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={iconSize} color="white" />
          </TouchableOpacity>
          <Text 
            style={[styles.headerTitle, { fontSize: titleSize }]} 
            numberOfLines={1}
            adjustsFontSizeToFit={isSmallScreen}
            minimumFontScale={0.8}
          >
            {name}
          </Text>
        </View>

        <TouchableOpacity onPress={toggleSidebar} style={styles.optionButton}>
          <Ionicons 
            name={isSidebarOpen ? "chevron-back-outline" : "options-outline"} 
            size={iconSize - 4} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* ANIMATED SIDEBAR */}
        <Animated.View style={[styles.sidebar, { width: animatedWidth }]}>
          <View style={{ width: SIDEBAR_MAX_WIDTH }}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ 
                padding: isTablet ? 20 : (isSmallScreen ? 12 : 15),
                paddingBottom: isLandscape ? 24 : 32
              }}
            >
              {config?.isSpecial && config?.specialTypes && (
                <View style={styles.tabContainer}>
                  {config.specialTypes.map((type) => (
                    <TouchableOpacity 
                      key={type.label}
                      style={[
                        styles.tabButton, 
                        activeType?.label === type.label && styles.tabButtonActive,
                        { paddingVertical: isTablet ? 12 : 10 }
                      ]}
                      onPress={() => setActiveType(type)}
                    >
                      <Text 
                        style={[
                          styles.tabText, 
                          activeType?.label === type.label && styles.tabTextActive,
                          { fontSize: isTablet ? 14 : (isSmallScreen ? 11 : 13) }
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[
                styles.filterTitle, 
                { fontSize: isTablet ? 17 : (isSmallScreen ? 13 : 15) }
              ]}>
                Filters
              </Text>

              {config?.filters?.map((filter, index) => {
                if (filter.key === 'dateRange') {
                  return (
                    <View key={`date-${index}`} style={styles.filterGap}>
                      <BusinessDatePicker 
                        label="From Date" 
                        date={filters.fromDate} 
                        onDateChange={(d) => updateFilter('fromDate', d)} 
                      />
                      <BusinessDatePicker 
                        label="To Date" 
                        date={filters.toDate} 
                        onDateChange={(d) => updateFilter('toDate', d)} 
                      />
                    </View>
                  );
                }
                if (filter.key === 'toDateOnly') {
                  return (
                    <BusinessDatePicker 
                      key={`date-single-${index}`} 
                      label="As of Date" 
                      date={filters.toDate} 
                      onDateChange={(d) => updateFilter('toDate', d)} 
                    />
                  );
                }
                if (filter.type === 'dropdown') {
                  return (
                    <View key={filter.key} style={styles.filterGap}>
                        <CustomDropdown 
                            label={filter.label} 
                            apiEndpoint={filter.api} 
                            valueField={filter.valueField} 
                            labelField={filter.labelField} 
                            value={filters[filter.key]} 
                            onChange={(val) => updateFilter(filter.key, val)} 
                        />
                    </View>
                  );
                }
                if (filter.type === 'button') {
                  return (
                    <TouchableOpacity 
                      key={`btn-${index}`} 
                      style={[
                        styles.actionBtn, 
                        { 
                          backgroundColor: filter.color || COLORS.secondary,
                          padding: isTablet ? 16 : (isSmallScreen ? 12 : 14)
                        }
                      ]} 
                      onPress={() => handleButtonClick(filter.action)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={filter.icon} 
                        size={isTablet ? 20 : 18} 
                        color="white" 
                        style={{ marginRight: 8 }} 
                      />
                      <Text style={[
                        styles.btnText,
                        { fontSize: isTablet ? 16 : (isSmallScreen ? 13 : 15) }
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              })}
            </ScrollView>
          </View>
        </Animated.View>

        {/* MAIN GRID */}
        <View style={[styles.content, { padding: contentPadding }]}>
          {isLoading ? (
            <View style={styles.centerContainer}>
                <ActivityIndicator 
                  size={isTablet ? "large" : "large"} 
                  color={COLORS.secondary} 
                />
                <Text style={[
                  styles.loadingText,
                  { fontSize: isTablet ? 16 : 14 }
                ]}>
                  Loading data...
                </Text>
            </View>
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
              <Ionicons 
                name="bar-chart-outline" 
                size={isTablet ? 80 : (isSmallScreen ? 48 : 64)} 
                color="#CCC" 
              />
              <Text style={[
                styles.emptyText,
                { 
                  fontSize: isTablet ? 17 : (isSmallScreen ? 13 : 15),
                  marginTop: isTablet ? 16 : 12
                }
              ]}>
                Select filters and click "Show" to view data.
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: { 
    flex: 1, 
    backgroundColor: '#F4F7FE'
  },
  header: { 
  backgroundColor: COLORS.primary,
   paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 8,
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
  headerLeft: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    minWidth: 0,
  },
  menuButton: { 
    padding: 8,
    marginRight: 4,
  },
  optionButton: { 
    padding: 12,
    marginLeft: 8,
  },
  headerTitle: { 
    color: 'white', 
    fontWeight: '700', 
    flex: 1,
    marginRight: 8,
  },
  body: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#F5F5F5' 
  },
  sidebar: { 
    backgroundColor: 'white', 
    borderRightWidth: StyleSheet.hairlineWidth, 
    borderColor: '#CCC', 
    overflow: 'hidden',
    ...Platform.select({
      ios: { 
        shadowColor: '#000', 
        shadowOffset: { width: 2, height: 0 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4 
      },
      android: { elevation: 3 }
    }),
  },
  content: { 
    flex: 1,
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTitle: { 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginBottom: 12, 
    marginTop: 5 
  },
  filterGap: { 
    marginBottom: 10 
  },
  tabContainer: { 
    flexDirection: 'row', 
    marginBottom: 15, 
    backgroundColor: '#F0F0F0', 
    borderRadius: 8, 
    padding: 3,
    overflow: 'hidden',
  },
  tabButton: { 
    flex: 1, 
    alignItems: 'center', 
    borderRadius: 6,
    marginHorizontal: 2,
  },
  tabButtonActive: { 
    backgroundColor: 'white', 
    ...Platform.select({
      ios: { 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 2 
      },
      android: { elevation: 2 }
    }),
  },
  tabText: { 
    color: '#777', 
    fontWeight: '600',
  },
  tabTextActive: { 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
  actionBtn: { 
    flexDirection: 'row', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 12,
    ...Platform.select({
      ios: { 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 3 
      },
      android: { elevation: 3 }
    }),
  },
  btnText: { 
    color: 'white', 
    fontWeight: 'bold',
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  emptyText: { 
    color: '#AAA', 
    textAlign: 'center', 
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

export default GenericReportScreen;