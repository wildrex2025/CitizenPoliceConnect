import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Share } from '@capacitor/share';

export interface DeviceInfo {
  platform: string;
  isNative: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  model: string;
  operatingSystem: string;
  osVersion: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export const useCapacitor = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<boolean>(true);

  useEffect(() => {
    initializeDevice();
    initializeNetwork();
    if (Capacitor.isNativePlatform()) {
      initializeStatusBar();
      initializePushNotifications();
    }
  }, []);

  const initializeDevice = async () => {
    try {
      const info = await Device.getInfo();
      setDeviceInfo({
        platform: info.platform,
        isNative: Capacitor.isNativePlatform(),
        isAndroid: Capacitor.getPlatform() === 'android',
        isIOS: Capacitor.getPlatform() === 'ios',
        model: info.model,
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion
      });
    } catch (error) {
      console.error('Error getting device info:', error);
    }
  };

  const initializeNetwork = async () => {
    try {
      const status = await Network.getStatus();
      setNetworkStatus(status.connected);

      Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status.connected);
      });
    } catch (error) {
      console.error('Error initializing network:', error);
    }
  };

  const initializeStatusBar = async () => {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#1e40af' });
    } catch (error) {
      console.error('Error setting status bar:', error);
    }
  };

  const initializePushNotifications = async () => {
    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.warn('Push notification permission denied');
          return;
        }
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const takePicture = async (source: CameraSource = CameraSource.Camera): Promise<string | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        timestamp: coordinates.timestamp
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const watchLocation = (callback: (location: LocationData) => void) => {
    const watchId = Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 10000
    }, (position) => {
      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      }
    });

    return watchId;
  };

  const sendLocalNotification = async (title: string, body: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style });
      }
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  };

  const shareContent = async (title: string, text: string, url?: string) => {
    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share with...'
      });
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  return {
    deviceInfo,
    networkStatus,
    isNative: Capacitor.isNativePlatform(),
    isAndroid: Capacitor.getPlatform() === 'android',
    isIOS: Capacitor.getPlatform() === 'ios',
    takePicture,
    getCurrentLocation,
    watchLocation,
    sendLocalNotification,
    triggerHaptic,
    shareContent
  };
};