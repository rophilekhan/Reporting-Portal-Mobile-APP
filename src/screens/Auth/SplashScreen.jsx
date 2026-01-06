import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Text,
  Image,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SplashScreen = ({ navigation }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLandscape = screenWidth > screenHeight;
  const scale = isLandscape ? screenHeight / 480 : screenWidth / 375;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const checkLogin = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        setTimeout(() => {
          navigation.replace(userInfo ? 'DrawerRoot' : 'Login');
        }, 3000);
      } catch {
        navigation.replace('Login');
      }
    };

    checkLogin();
  }, []);

  const logoSize = (isLandscape ? screenHeight * 0.25 : screenWidth * 0.3) * Math.min(scale, 0.8);
  const containerSize = logoSize + 40 * scale;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#003892', '#0055c8', '#e98a57']}
        style={StyleSheet.absoluteFill}
      >
        {/* Background Decoration */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.circle, styles.circle1, { width: 200 * scale, height: 200 * scale }]} />
          <View style={[styles.circle, styles.circle2, { width: 120 * scale, height: 120 * scale }]} />
        </View>

        {/* Center Content */}
        <View style={styles.centerWrapper}>

          {/* Powered By Badge */}
          <Animated.View style={[styles.poweredBadge, { opacity: fadeAnim }]}>
            <Text style={styles.poweredText}>
              Powered by{' '}
              <Text style={styles.poweredBrand}>Hassoft Solutions</Text>
            </Text>
          </Animated.View>

          {/* Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View
              style={[
                styles.logoContainer,
                {
                  width: containerSize,
                  height: containerSize,
                  borderRadius: containerSize / 2,
                },
              ]}
            >
              <Image
                source={require('../../assets/xinacle-logo.png')}
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* App Title */}
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <Text style={[styles.title, { fontSize: 36 * scale }]}>
              Xinacle <Text style={styles.highlight}>ERP</Text>
            </Text>
            <Text style={[styles.subtitle, { fontSize: 16 * scale }]}>
              Simplifying Business Processes
            </Text>
          </Animated.View>

        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  /* ---------- Powered By Badge ---------- */
  poweredBadge: {
    marginBottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  poweredText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
  },

  poweredBrand: {
    color: '#e98a57',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  /* ---------- Logo ---------- */
  logoWrapper: {
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 15,
      },
    }),
  },

  logoContainer: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ---------- Text ---------- */
  title: {
    color: 'white',
    fontWeight: '900',
    textAlign: 'center',
  },

  highlight: {
    color: '#e98a57',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontWeight: '500',
  },

  /* ---------- Decorative Circles ---------- */
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  circle1: {
    top: -50,
    left: -50,
  },

  circle2: {
    bottom: '20%',
    right: -30,
    backgroundColor: 'rgba(233,138,87,0.1)',
  },
});

export default SplashScreen;
