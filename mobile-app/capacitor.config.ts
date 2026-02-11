import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.motoapp.ios',
  appName: 'MotoLog',
  webDir: 'www-built',
  
  server: {
    url: 'http://192.168.0.102:5000',
    androidScheme: 'https',
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
