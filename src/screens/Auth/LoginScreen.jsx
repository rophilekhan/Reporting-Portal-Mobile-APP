import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Keyboard,
  Image,
  StatusBar,
  Animated,
  Linking,
  ScrollView
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../config/theme'; 
import { loginUser } from '../../services/authService';

const { width, height } = Dimensions.get('window');
const currentYear = new Date().getFullYear();

const CustomToast = ({ visible, message, type }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible && fadeAnim._value === 0) return null;

  const bg = type === 'error' ? '#FF5252' : '#4CAF50';
  const iconName = type === 'error' ? 'alert-circle' : 'checkmark-circle';
  const topPosition = Platform.OS === 'ios' ? insets.top + 10 : 40;

  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim, backgroundColor: bg, top: topPosition }]}>
      <Ionicons name={iconName} size={24} color="white" style={{ marginRight: 10 }} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const successBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkSavedLogin = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('username');
        const savedPassword = await AsyncStorage.getItem('password');
        const savedRemember = await AsyncStorage.getItem('rememberMe');
        if (savedRemember === 'true' && savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setRememberMe(true);
        }
      } catch (error) { console.log(error); }
    };
    checkSavedLogin();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.spring(successScaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(successBounceAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
          Animated.timing(successBounceAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
          Animated.spring(successBounceAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [showSuccess]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username || !password) {
      showToast('Please enter both username and password.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await loginUser(username, password);
      if (rememberMe) {
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
          await AsyncStorage.setItem('rememberMe', 'true');
      } else {
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
          await AsyncStorage.setItem('rememberMe', 'false');
      }
      // Inside handleLogin after success
const response = await loginUser(username, password);
await AsyncStorage.setItem('userResponse', JSON.stringify(response));
      setShowSuccess(true);
      showToast('Login Successful!', 'success');
      setTimeout(() => { navigation.replace('DrawerRoot'); }, 1500);
    } catch (error) {
      showToast(error.message || 'Invalid credentials.', 'error');
    } finally { setIsLoading(false); }
  };

  const showToast = (msg, type = 'error') => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'error' }), 3000);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#003892" translucent={true} />
      <CustomToast visible={toast.visible} message={toast.message} type={toast.type} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={keyboardVisible}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#003892', '#0055c8', '#e98a57']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[
              styles.headerContainer, 
              { 
                paddingTop: insets.top,
                height: keyboardVisible ? height * 0.25 : height * 0.45 
              }
            ]}
          >
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            
            <View style={[styles.logoOuterGlow, keyboardVisible && { scaleX: 0.6, scaleY: 0.6, marginBottom: 0 }]}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/xinacle-logo.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
            </View>

            {!keyboardVisible && (
                <>
                    <Text style={styles.brandText}>Xinacle <Text style={styles.brandHighlight}>ERP</Text></Text>
                    <Text style={styles.tagline}>Simplifying Business Processes.</Text>
                </>
            )}
          </LinearGradient>

          <View style={[styles.whiteSection, { paddingBottom: insets.bottom + 20 }]}> 
            <View style={styles.formContent}>
              <Text style={styles.loginTitle} allowFontScaling={false}>Welcome Back!</Text>
              <Text style={styles.loginSubtitle} allowFontScaling={false}>Sign in to continue</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Email or Username" 
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading && !showSuccess}
                    allowFontScaling={false}
                  />
                  <View style={styles.rightIconContainer}>
                    <View style={[styles.iconCircle, styles.emailIconCircle]}><Ionicons name="mail" size={20} color="white" /></View>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <View style={styles.leftIconContainer}>
                    <View style={[styles.iconCircle, styles.passwordIconCircle]}><Ionicons name="lock-closed" size={20} color="white" /></View>
                  </View>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Password" 
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword} 
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading && !showSuccess}
                    allowFontScaling={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggle}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={styles.rememberText} allowFontScaling={false}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity><Text style={styles.forgotText} allowFontScaling={false}>Forgot Password?</Text></TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButtonWrapper} onPress={handleLogin} disabled={isLoading || showSuccess}>
                <LinearGradient colors={['#003892', '#0055c8', '#e98a57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButton}>
                  {isLoading ? <ActivityIndicator color="white" size="small" /> : showSuccess ? <Ionicons name="checkmark" size={24} color="white" /> : <Text style={styles.loginButtonText}>LOGIN</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>© {currentYear} </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.hassoftsolutions.com/')}><Text style={styles.footerLink}>Hassoft Solutions</Text></TouchableOpacity>
              <Text style={styles.footerText}>. All Rights Reserved.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS OVERLAY - ScrollView ke bahar taake screen center mein aaye */}
      {showSuccess && (
        <Animated.View 
          style={[
            styles.successOverlay, 
            { 
              opacity: successScaleAnim, 
              transform: [{ scale: successScaleAnim }, { scaleY: successBounceAnim }] 
            }
          ]}
        >
          <View style={styles.successCheckmarkCircle}>
            <Ionicons name="checkmark-circle" size={120} color="#4CAF50" />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { width: '100%', borderBottomRightRadius: width * 0.65, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', paddingBottom: 10 },
  decorativeCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -40, left: -30 },
  decorativeCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(233,138,87,0.15)', top: 60, right: 30 },
  logoOuterGlow: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoContainer: { width: 100, height: 100, backgroundColor: 'white', borderRadius: 50, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  logoImage: { width: 65, height: 65 },
  
  // Updated Success Overlay for Screen Center
  successOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successCheckmarkCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  brandText: { fontSize: 28, fontWeight: 'bold', color: 'white', letterSpacing: 1.5 },
  brandHighlight: { color: '#e98a57' },
  tagline: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  whiteSection: { flex: 1, backgroundColor: 'white', borderTopRightRadius: width * 0.2, marginTop: -40, paddingTop: 15, justifyContent: 'space-between' },
  formContent: { paddingHorizontal: 30 },
  loginTitle: { fontSize: 26, fontWeight: 'bold', color: '#003892' },
  loginSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, height: 55, paddingHorizontal: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, borderWidth: 1, borderColor: '#EEE' },
  input: { flex: 1, fontSize: 15, color: '#333' },
  iconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  emailIconCircle: { backgroundColor: '#FFD700' },
  passwordIconCircle: { backgroundColor: '#FF4444' },
  rightIconContainer: { marginLeft: 8 },
  leftIconContainer: { marginRight: 8 },
  eyeToggle: { padding: 4 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  rememberContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#003892', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#003892' },
  rememberText: { color: '#666', fontSize: 12 },
  forgotText: { color: '#e98a57', fontSize: 12, fontWeight: '600' },
  loginButtonWrapper: { marginBottom: 15 },
  loginButton: { height: 55, borderRadius: 27, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  loginButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#999', fontSize: 12 },
  footerLink: { color: '#e98a57', fontSize: 12, fontWeight: 'bold' },
  toastContainer: { position: 'absolute', left: 20, right: 20, padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', zIndex: 9999, elevation: 10 },
  toastText: { color: 'white', fontWeight: '600', fontSize: 13, flex: 1 },
});

export default LoginScreen;