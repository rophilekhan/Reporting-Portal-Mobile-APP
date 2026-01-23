import 'react-native-gesture-handler';
import React, { useEffect } from 'react'; // Added useEffect
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from './src/config/theme';

// Import Notification Service
import { setupNotifications } from './src/services/NotificationService';

// Import Screens
import SplashScreen from './src/screens/Auth/SplashScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import UserProfileScreen from './src/screens/Dashboard/UserProfileScreen';
import GenericReportScreen from './src/screens/Reports/GenericReportScreen';
import CustomDrawerContent from './src/navigation/CustomDrawerContent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BranchProvider } from './src/context/BranchContext'; 

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();

// --- DASHBOARD STACK ---
const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
      {/* ... Baki Reports ... */}
      <DashboardStack.Screen name="Account Payables Report" component={GenericReportScreen} />
      <DashboardStack.Screen name="Account Recievable Report" component={GenericReportScreen} />
      <DashboardStack.Screen name="Account Payment Summary" component={GenericReportScreen} />
      <DashboardStack.Screen name="Account Receiving Summary" component={GenericReportScreen} />
      <DashboardStack.Screen name="Expense Payment Summary" component={GenericReportScreen} />
      <DashboardStack.Screen name="Petty Cash Summary" component={GenericReportScreen} />
      <DashboardStack.Screen name="Income Statement" component={GenericReportScreen} />
      <DashboardStack.Screen name="Balance Sheet" component={GenericReportScreen} />
      <DashboardStack.Screen name="Trial Balance" component={GenericReportScreen} />
      <DashboardStack.Screen name="Purchase Summary" component={GenericReportScreen} />
      <DashboardStack.Screen name="Good Recieving Summary" component={GenericReportScreen} />
      <DashboardStack.Screen name="Sales Summary" component={GenericReportScreen} />
      <DashboardStack.Screen name="Product Ledger" component={GenericReportScreen} />
      <DashboardStack.Screen name="Product Running Stock" component={GenericReportScreen} />
    </DashboardStack.Navigator>
  );
};

// --- BOTTOM TABS ---
const DashboardTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeStack') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
        tabBarStyle: { 
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: insets.bottom > 0 ? 0 : 5,
        }
      })}
    >
      <Tab.Screen name="HomeStack" component={DashboardStackNavigator} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

// --- DRAWER ---
const DrawerGroup = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="DashboardTabs" component={DashboardTabNavigator} />
    </Drawer.Navigator>
  );
};

// --- ROOT APP ---
const App = () => {
  useEffect(() => {
    let unsubscribe;
    const init = async () => {
      unsubscribe = await setupNotifications();
    };
    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <BranchProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="DrawerRoot" component={DrawerGroup} />
        </Stack.Navigator>
      </NavigationContainer>
    </BranchProvider>
  );
};

export default App;