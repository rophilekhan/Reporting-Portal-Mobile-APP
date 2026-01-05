import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, useWindowDimensions, Platform } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../config/theme';
import { logoutUser } from '../services/authService';

const MenuSection = ({ title, icon, children, isOpen, onPress, isLandscape }) => (
  <View style={styles.sectionContainer}>
    <TouchableOpacity 
      activeOpacity={0.7} 
      style={[
        styles.menuItem, 
        isOpen && styles.menuItemActive,
        isLandscape && { paddingVertical: 8 }
      ]} 
      onPress={onPress}
    >
      <View style={styles.menuLabel}>
        <View style={[styles.iconBox, isOpen && styles.iconBoxActive]}>
           <Ionicons name={icon} size={18} color={isOpen ? COLORS.secondary : 'white'} />
        </View>
        <Text style={[styles.menuText, isOpen && styles.menuTextActive]}>{title}</Text>
      </View>
      <Ionicons 
        name={isOpen ? "chevron-up-outline" : "chevron-down-outline"} 
        size={16} 
        color={isOpen ? COLORS.secondary : 'rgba(255,255,255,0.6)'} 
      />
    </TouchableOpacity>
    {isOpen && <View style={styles.subMenu}>{children}</View>}
  </View>
);

const CustomDrawerContent = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;

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

  const handleNavigation = (routeName) => {
    navigation.navigate('DashboardTabs', {
      screen: 'HomeStack',
      params: { screen: routeName }
    });
  };

  const SubMenuLink = ({ title, routeName }) => (
    <TouchableOpacity 
      style={[styles.subMenuItem, isLandscape && { paddingVertical: 8 }]} 
      onPress={() => handleNavigation(routeName)}
    >
      <View style={styles.bulletPoint} />
      <Text style={styles.subMenuText} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
  );

  const toggleSection = (key) => {
    setSections(prev => ({ 
        accounts: false, purchase: false, sales: false, inventory: false, 
        [key]: !prev[key] 
    }));
  };

  const handleLogout = async () => {
      await logoutUser();
      navigation.replace('Login');
  };

  // Responsive sizing
  const headerPadding = isTablet ? 24 : (isLandscape ? 12 : 20);
  const logoSize = isTablet ? 40 : (isLandscape ? 32 : 36);
  const avatarSize = isTablet ? 40 : (isLandscape ? 32 : 36);
  const brandFontSize = isTablet ? 20 : (isLandscape ? 16 : 18);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient colors={[COLORS.primary, '#0055c8', COLORS.secondary]} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={false} />
        
        <View style={styles.contentWrapper}>
          
          {/* Header */}
          <View style={[
            styles.brandHeader, 
            { 
              paddingBottom: isLandscape ? 8 : 20,
              paddingHorizontal: headerPadding 
            }
          ]}>
              <View style={[styles.logoCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
                  <Image 
                    source={require('../assets/xinacle-logo.png')} 
                    style={[styles.logoImage, { width: logoSize * 0.6, height: logoSize * 0.6 }]} 
                    resizeMode="contain" 
                  />
              </View>
              <View>
                  <Text style={[styles.brandText, { fontSize: brandFontSize }]}>
                    Xinacle <Text style={{color: COLORS.secondary}}>ERP</Text>
                  </Text>
              </View>
          </View>

          {/* Profile Card */}
          <View style={[
            styles.profileCard, 
            { 
              marginVertical: isLandscape ? 5 : 0,
              marginHorizontal: isTablet ? 20 : 15
            }
          ]}>
              <View style={[
                styles.avatarContainer,
                { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }
              ]}>
                  <Text style={[styles.avatarText, { fontSize: isTablet ? 18 : (isLandscape ? 14 : 16) }]}>
                    {initials}
                  </Text>
              </View>
              <View style={styles.profileInfo}>
                  <Text 
                    style={[styles.profileName, { fontSize: isTablet ? 15 : 14 }]} 
                    numberOfLines={1}
                  >
                    {username}
                  </Text>
                  <Text style={[styles.profileRole, { fontSize: isTablet ? 11 : 10 }]}>
                    Administrator
                  </Text>
              </View>
          </View>

          <View style={[styles.divider, { marginHorizontal: isTablet ? 24 : 20 }]} />

          {/* ScrollView takes up remaining space */}
          <ScrollView 
            style={styles.menuScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: isLandscape ? 12 : 20,
              paddingHorizontal: isTablet ? 12 : 10
            }}
          >
              <TouchableOpacity 
                style={[styles.menuItem, isLandscape && { paddingVertical: 8 }]} 
                onPress={() => handleNavigation('DashboardMain')}
              >
                  <View style={styles.menuLabel}>
                      <View style={styles.iconBox}>
                        <Ionicons name="grid-outline" size={18} color="white"/>
                      </View>
                      <Text style={styles.menuText}>Dashboard</Text>
                  </View>
              </TouchableOpacity>

              <MenuSection 
                title="Accounts" 
                icon="wallet-outline" 
                isOpen={sections.accounts} 
                onPress={() => toggleSection('accounts')}
                isLandscape={isLandscape}
              >
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

              <MenuSection 
                title="Purchase" 
                icon="cart-outline" 
                isOpen={sections.purchase} 
                onPress={() => toggleSection('purchase')}
                isLandscape={isLandscape}
              >
                  <SubMenuLink title="Purchase Summary" routeName="Purchase Summary" />
                  <SubMenuLink title="Goods Receiving" routeName="Good Recieving Summary" />
              </MenuSection>

              <MenuSection 
                title="Sales" 
                icon="trending-up-outline" 
                isOpen={sections.sales} 
                onPress={() => toggleSection('sales')}
                isLandscape={isLandscape}
              >
                  <SubMenuLink title="Sales Summary" routeName="Sales Summary" />
              </MenuSection>

              <MenuSection 
                title="Inventory" 
                icon="layers-outline" 
                isOpen={sections.inventory} 
                onPress={() => toggleSection('inventory')}
                isLandscape={isLandscape}
              >
                  <SubMenuLink title="Product Ledger" routeName="Product Ledger" />
                  <SubMenuLink title="Running Stock" routeName="Product Running Stock" />
              </MenuSection>
          </ScrollView>

          {/* Footer: Sign Out Button */}
          <View style={[styles.footer, { paddingHorizontal: isTablet ? 24 : 20 }]}>
              <TouchableOpacity 
                style={[styles.logoutBtn, isLandscape && { padding: 10 }]} 
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                  <View style={styles.logoutIconBox}>
                      <Ionicons name="log-out-outline" size={18} color="#fff" />
                  </View>
                  <Text style={[styles.logoutText, { fontSize: isTablet ? 16 : 15 }]}>
                    Sign Out
                  </Text>
              </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#003892' },
  container: { flex: 1 },
  contentWrapper: { flex: 1 },
  brandHeader: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  logoCircle: { 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  logoImage: {},
  brandText: { 
    fontWeight: 'bold', 
    color: 'white' 
  },
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  avatarContainer: { 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  avatarText: { 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  profileRole: { 
    color: COLORS.secondary 
  },
  divider: { 
    height: 1, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    marginVertical: 12 
  },
  menuScroll: { flex: 1 },
  sectionContainer: { 
    marginBottom: 4, 
    borderRadius: 10, 
    overflow: 'hidden' 
  },
  menuItem: { 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderRadius: 10 
  },
  menuItemActive: { 
    backgroundColor: 'rgba(255,255,255,0.15)' 
  },
  menuLabel: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  iconBox: { 
    width: 30, 
    height: 30, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  iconBoxActive: { 
    backgroundColor: 'white' 
  },
  menuText: { 
    color: 'rgba(255,255,255,0.95)', 
    fontSize: 14,
    flex: 1
  },
  menuTextActive: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  subMenu: { 
    paddingLeft: 10, 
    paddingBottom: 5, 
    backgroundColor: 'rgba(0,0,0,0.1)', 
    borderRadius: 10, 
    marginTop: -2, 
    marginBottom: 5 
  },
  subMenuItem: { 
    paddingVertical: 10, 
    paddingLeft: 42, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  bulletPoint: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: COLORS.secondary, 
    marginRight: 10, 
    opacity: 0.8 
  },
  subMenuText: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 13,
    flex: 1
  },
  footer: { 
    marginTop: 10,
    marginBottom: 5
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    padding: 12, 
    borderRadius: 12 
  },
  logoutIconBox: { 
    marginRight: 10, 
    backgroundColor: 'rgba(255,107,107,0.2)', 
    padding: 5, 
    borderRadius: 6 
  },
  logoutText: { 
    color: '#ffff', 
    fontWeight: '600' 
  }
});

export default CustomDrawerContent;