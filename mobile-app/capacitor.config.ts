import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.motoapp.ios',
  appName: 'MotoLog',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true // Allow http on localhost for development
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
