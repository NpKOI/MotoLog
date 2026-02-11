import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.motoapp.ios',
  appName: 'MotoLog',
  webDir: 'www-built',
  server: {
    url: 'https://web-production-24d0.up.railway.app',
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
