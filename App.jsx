import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import Screens
import SplashScreen from './src/screens/Auth/SplashScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import GenericReportScreen from './src/screens/Reports/GenericReportScreen';
import CustomDrawerContent from './src/navigation/CustomDrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Group
const DrawerGroup = () => {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      {/* Configure all Report Routes to use the SAME component */}
      <Drawer.Screen name="Account Payables Report" component={GenericReportScreen} />
      <Drawer.Screen name="Account Recievable Report" component={GenericReportScreen} />
      <Drawer.Screen name="Account Payment Summary" component={GenericReportScreen} />
      <Drawer.Screen name="Petty Cash Summary" component={GenericReportScreen} />
      <Drawer.Screen name="Income Statement" component={GenericReportScreen} />
      <Drawer.Screen name="Balance Sheet" component={GenericReportScreen} />
      <Drawer.Screen name="Purchase Summary" component={GenericReportScreen} />
      <Drawer.Screen name="Good Recieving Summary" component={GenericReportScreen} />
      <Drawer.Screen name="Sales Summary" component={GenericReportScreen} />
      <Drawer.Screen name="Product Ledger" component={GenericReportScreen} />
      <Drawer.Screen name="Product Running Stock" component={GenericReportScreen} />
      {/* ... Add all other routes here mapping to GenericReportScreen */}
    </Drawer.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DrawerRoot" component={DrawerGroup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;