import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setupNotifications = async () => {
  try {
    // 1. Android 13+ POST_NOTIFICATIONS Permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Notification permission denied");
      }
    }

    // 2. Request Firebase Permission (iOS & Android)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await getAndSaveToken();
    }

    // 3. Listen for Token Refresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log("FCM Token Refreshed:", newToken);
      await saveTokenToServer(newToken);
    });

    // 4. Foreground Handler: Jab app chal rahi ho
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      Alert.alert(
        remoteMessage.notification?.title || "Notification",
        remoteMessage.notification?.body || ""
      );
    });

    // 5. Background Handler: Jab notification par click karke app Background se open ho
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("Notification opened from background:", remoteMessage.notification);
      // Yahan aap navigation logic dal sakte hain (e.g. Navigate to a specific report)
    });

    // 6. Quit State Handler: Jab app band ho aur notification se khule
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("Notification opened from quit state:", remoteMessage.notification);
        }
      });

    return unsubscribeOnMessage;
  } catch (error) {
    console.log("Notification Setup Error:", error);
  }
};

const getAndSaveToken = async () => {
  try {
    const token = await messaging().getToken();
    if (token) {
      console.log("FCM TOKEN:", token);
      await saveTokenToServer(token);
    }
  } catch (err) {
    console.log("Token generation error:", err);
  }
};

const saveTokenToServer = async (token) => {
  // Local storage mein save karein
  await AsyncStorage.setItem('fcmToken', token);
  
  // TODO: Yahan apni API hit karein: axios.post('/save-token', { token, platform: Platform.OS })
  console.log("Token saved to local storage/server logic triggered");
};