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
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  Linking
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage'; // IMPORT THIS
import { COLORS } from '../../config/theme'; 
import { loginUser } from '../../services/authService';

const { width, height } = Dimensions.get('window');

// Custom Toast Component
const CustomToast = ({ visible, message, type }) => {
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

  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim, backgroundColor: bg }]}>
      <Ionicons name={iconName} size={24} color="white" style={{ marginRight: 10 }} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // NEW STATE for Remember Me
  const [isLoading, setIsLoading] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const showToast = (msg, type = 'error') => {
    setToast({ visible: true, message: msg, type });
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    const timeoutId = setTimeout(() => setToast({ visible: false, message: '', type: 'error' }), 3000);
    setToast(prev => ({ ...prev, timeoutId }));
  };

  // --- 1. CHECK FOR SAVED LOGIN ON MOUNT ---
  useEffect(() => {
    const checkSavedLogin = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('username');
        const savedPassword = await AsyncStorage.getItem('password');
        const savedRemember = await AsyncStorage.getItem('rememberMe');

        // If data exists, pre-fill it
        if (savedRemember === 'true' && savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setRememberMe(true);
            
            // OPTIONAL: Uncomment the line below if you want to AUTO-LOGIN immediately
            // performSilentLogin(savedUsername, savedPassword);
        }
      } catch (error) {
        console.log('Error loading saved credentials', error);
      }
    };

    checkSavedLogin();
  }, []);

  // Optional: Helper for silent login (if you want auto-redirect)
  /*
  const performSilentLogin = async (usr, pwd) => {
      setIsLoading(true);
      try {
          await loginUser(usr, pwd);
          navigation.replace('DrawerRoot');
      } catch (e) {
          setIsLoading(false); // Stop loading if auto-login fails
      }
  }
  */

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username || !password) {
      showToast('Please enter both username and password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await loginUser(username, password);

      // --- 2. SAVE OR CLEAR CREDENTIALS BASED ON CHECKBOX ---
      if (rememberMe) {
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
          await AsyncStorage.setItem('rememberMe', 'true');
      } else {
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
          await AsyncStorage.setItem('rememberMe', 'false');
      }

      showToast('Login Successful!', 'success');
      
      setTimeout(() => {
        navigation.replace('DrawerRoot'); 
      }, 500);

    } catch (error) {
      console.error("Login Failed:", error);
      showToast(error.message || 'Invalid credentials or server error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRememberMe = () => {
      setRememberMe(!rememberMe);
  };

  const handleHassoftLink = async () => {
    const url = 'https://www.hassoftsolutions.com/';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Don't know how to open this URL:", url);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#003892" />
        <CustomToast visible={toast.visible} message={toast.message} type={toast.type} />

        {/* Curved Gradient Header */}
        <LinearGradient
          colors={['#003892', '#0055c8', '#e98a57']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          {/* Animated decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          <View style={styles.decorativeCircle4} />
          
          {/* Logo with elegant glow */}
          <View style={styles.logoOuterGlow}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/xinacle-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <Text style={styles.brandText}>Xinacle <Text style={styles.brandHighlight}>ERP</Text></Text>
          <Text style={styles.tagline}>Simplifying Business Processes.</Text>
        </LinearGradient>

        {/* White curved section */}
        <View style={styles.whiteSection}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formContainer}
          >
            <View style={styles.formContent}>
              <Text style={styles.loginTitle}>Welcome Back!</Text>
              <Text style={styles.loginSubtitle}>Sign in to continue</Text>
              
              {/* Email Input */}
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
                    editable={!isLoading}
                  />
                  <View style={styles.rightIconContainer}>
                    <View style={[styles.iconCircle, styles.emailIconCircle]}>
                      <Ionicons name="mail" size={20} color="white" />
                    </View>
                  </View>
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <View style={styles.leftIconContainer}>
                    <View style={[styles.iconCircle, styles.passwordIconCircle]}>
                      <Ionicons name="lock-closed" size={20} color="white" />
                    </View>
                  </View>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Password" 
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword} 
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.8}
                    style={styles.eyeToggle}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* --- 3. UPDATED REMEMBER ME UI --- */}
              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.rememberContainer} onPress={toggleRememberMe} activeOpacity={0.8}>
                  {/* Changed Checkbox Style based on State */}
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButtonWrapper}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#003892', '#0055c8', '#e98a57']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.loginButton, isLoading && styles.btnDisabled]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>LOGIN</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            </View>
            
            {/* Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>© 2026 </Text>
              <TouchableOpacity onPress={handleHassoftLink}>
                <Text style={styles.footerLink}>Hassoft Solutions</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> . All Rights Reserved.</Text>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header Styles
  headerContainer: {
    height: height * 0.42,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: width * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: "#003892",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    paddingBottom: 30,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    left: -30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233,138,87,0.15)',
    top: 60,
    right: 30,
    borderWidth: 2,
    borderColor: 'rgba(233,138,87,0.2)',
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    bottom: 80,
    left: 50,
  },
  decorativeCircle4: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(233,138,87,0.2)',
    top: height * 0.15,
    right: width * 0.25,
  },

  logoOuterGlow: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoContainer: {
    width: 110,
    height: 110,
    backgroundColor: 'white',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logoImage: {
    width: 75,
    height: 75,
  },
  brandText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  brandHighlight: {
    color: '#e98a57',
    fontWeight: '800',
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // White Section Styles
  whiteSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
    borderTopRightRadius: width * 0.2,
    marginTop: -35,
    paddingTop: 35,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  formContainer: {
    flex: 1,
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 10,
  },

  loginTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#003892',
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
  },

  inputContainer: {
    marginBottom: 35,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    height: 65,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailIconCircle: {
    backgroundColor: '#FFD700',
  },
  passwordIconCircle: {
    backgroundColor: '#FF4444',
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  leftIconContainer: {
    marginRight: 8,
  },
  eyeToggle: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Options Row
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // --- Checkbox Styles ---
  checkbox: {
    width: 20, // Slightly larger for better tap target
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#003892',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  checkboxActive: {
      backgroundColor: '#003892', // Fill with blue when active
  },
  rememberText: {
    color: '#666',
    fontSize: 13,
  },
  forgotText: {
    color: '#e98a57',
    fontSize: 13,
    fontWeight: '600',
  },

  // Login Button
  loginButtonWrapper: {
    marginBottom: 25,
  },
  loginButton: {
    height: 58,
    borderRadius: 29,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#003892',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 2,
  },
  arrowIcon: {
    marginLeft: 10,
  },

  // Footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  footerText: {
    color: '#999',
    fontSize: 16,
  },
  footerLink: {
    color: '#e98a57',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  toastText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
});

export default LoginScreen;