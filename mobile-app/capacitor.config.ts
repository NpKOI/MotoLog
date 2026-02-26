import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.motoapp.ios',
  appName: 'MotoLog',
  webDir: 'www-built',
  server: {
    url: 'http://192.168.1.16:5000',
    cleartext: true,
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    }
  }
};

export default config;
