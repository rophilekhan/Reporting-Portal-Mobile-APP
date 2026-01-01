import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, StatusBar } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../config/theme';
import { logoutUser } from '../services/authService';

const { width } = Dimensions.get('window');

const MenuSection = ({ title, icon, children, isOpen, onPress }) => (
  <View style={styles.sectionContainer}>
    <TouchableOpacity style={[styles.menuItem, isOpen && styles.menuItemActive]} onPress={onPress}>
      <View style={styles.menuLabel}>
        <View style={[styles.iconBox, isOpen && styles.iconBoxActive]}>
           <Ionicons name={icon} size={18} color={isOpen ? COLORS.secondary : 'white'} />
        </View>
        <Text style={[styles.menuText, isOpen && styles.menuTextActive]}>{title}</Text>
      </View>
      <Ionicons name={isOpen ? "chevron-up-outline" : "chevron-down-outline"} size={16} color={isOpen ? COLORS.secondary : 'rgba(255,255,255,0.6)'} />
    </TouchableOpacity>
    {isOpen && <View style={styles.subMenu}>{children}</View>}
  </View>
);

const CustomDrawerContent = ({ navigation }) => {
  const [sections, setSections] = useState({ accounts: false, purchase: false, sales: false, inventory: false });
  const [username, setUsername] = useState('User');
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('userInfo');
            const user = jsonValue != null ? JSON.parse(jsonValue) : null;
            if(user && user.UserName) {
                setUsername(user.UserName);
                setInitials(user.UserName.charAt(0).toUpperCase());
            }
        } catch(e) { console.log(e); }
    };
    getUserData();
  }, []);

  // --- FIX: DEEP NAVIGATION HELPER ---
  const handleNavigation = (routeName) => {
    navigation.navigate('DashboardTabs', {
      screen: 'HomeStack',
      params: {
        screen: routeName
      }
    });
  };

  const SubMenuLink = ({ title, routeName }) => (
    <TouchableOpacity style={styles.subMenuItem} onPress={() => handleNavigation(routeName)}>
      <View style={styles.bulletPoint} />
      <Text style={styles.subMenuText}>{title}</Text>
    </TouchableOpacity>
  );

  const toggleSection = (key) => {
    setSections(prev => ({ accounts: false, purchase: false, sales: false, inventory: false, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
      await logoutUser();
      navigation.replace('Login');
  };

  return (
    <LinearGradient colors={['#003892', '#0055c8', '#e98a57']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003892" />
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <View style={styles.contentWrapper}>
        <View style={styles.brandHeader}>
            <View style={styles.logoCircle}>
                <Image source={require('../assets/xinacle-logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View>
                <Text style={styles.brandText}>Xinacle <Text style={{color: COLORS.secondary}}>ERP</Text></Text>
            </View>
        </View>

        <View style={styles.profileCard}>
            <View style={styles.avatarContainer}><Text style={styles.avatarText}>{initials}</Text></View>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>{username}</Text>
                <Text style={styles.profileRole}>Administrator</Text>
            </View>
        </View>

        <View style={styles.divider} />

        <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {/* Dashboard Link directly to root of stack */}
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('DashboardMain')}>
                <View style={styles.menuLabel}>
                    <View style={styles.iconBox}><Ionicons name="grid-outline" size={18} color="white"/></View>
                    <Text style={styles.menuText}>Dashboard</Text>
                </View>
            </TouchableOpacity>

            <MenuSection title="Accounts" icon="wallet-outline" isOpen={sections.accounts} onPress={() => toggleSection('accounts')}>
                <SubMenuLink title="Account Payables" routeName="Account Payables Report" />
                <SubMenuLink title="Account Receivables" routeName="Account Recievable Report" />
                <SubMenuLink title="Payment Summary" routeName="Account Payment Summary" />
                <SubMenuLink title="Receiving Summary" routeName="Account Receiving Summary" />
                <SubMenuLink title="Petty Cash" routeName="Petty Cash Summary" />
                <SubMenuLink title="Expense Payment" routeName="Expense Payment Summary" />
                <SubMenuLink title="Income Statement" routeName="Income Statement" />
                <SubMenuLink title="Balance Sheet" routeName="Balance Sheet" />
                <SubMenuLink title="Trial Balance" routeName="Trial Balance" />
            </MenuSection>

            <MenuSection title="Purchase" icon="cart-outline" isOpen={sections.purchase} onPress={() => toggleSection('purchase')}>
                <SubMenuLink title="Purchase Summary" routeName="Purchase Summary" />
                <SubMenuLink title="Goods Receiving" routeName="Good Recieving Summary" />
            </MenuSection>

            <MenuSection title="Sales" icon="trending-up-outline" isOpen={sections.sales} onPress={() => toggleSection('sales')}>
                <SubMenuLink title="Sales Summary" routeName="Sales Summary" />
            </MenuSection>

            <MenuSection title="Inventory" icon="layers-outline" isOpen={sections.inventory} onPress={() => toggleSection('inventory')}>
                <SubMenuLink title="Product Ledger" routeName="Product Ledger" />
                <SubMenuLink title="Running Stock" routeName="Product Running Stock" />
            </MenuSection>
        </ScrollView>

        <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <View style={styles.logoutIconBox}><Ionicons name="log-out-outline" size={18} color="#fff" /></View>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  decorativeCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50, zIndex: 0 },
  decorativeCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(233,138,87,0.1)', bottom: 100, left: -20, zIndex: 0 },
  contentWrapper: { flex: 1, zIndex: 1 },
  brandHeader: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoImage: { width: 25, height: 25 },
  brandText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 15, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  profileName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  profileRole: { color: COLORS.secondary, fontSize: 11 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20, marginVertical: 15 },
  menuScroll: { flex: 1, paddingHorizontal: 10 },
  sectionContainer: { marginBottom: 5, borderRadius: 10, overflow: 'hidden' },
  menuItem: { paddingVertical: 12, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10 },
  menuItemActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  menuLabel: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBoxActive: { backgroundColor: 'white' },
  menuText: { color: 'rgba(255,255,255,0.95)', fontSize: 15 },
  menuTextActive: { color: 'white', fontWeight: 'bold' },
  subMenu: { paddingLeft: 10, paddingBottom: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 10, marginTop: -5, marginBottom: 5 },
  subMenuItem: { paddingVertical: 10, paddingLeft: 42, flexDirection: 'row', alignItems: 'center' },
  bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.secondary, marginRight: 10, opacity: 0.8 },
  subMenuText: { color: 'rgba(255,255,255,0.8)', fontSize: 13.5 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 12, borderRadius: 12 },
  logoutIconBox: { marginRight: 10, backgroundColor: 'rgba(255,107,107,0.15)', padding: 5, borderRadius: 6 },
  logoutText: { color: '#ffff', fontSize: 15, fontWeight: '600' }
});

export default CustomDrawerContent;