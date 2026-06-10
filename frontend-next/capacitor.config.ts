import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.dealhunter4u.app',
  appName: 'DealHunter4U',
  webDir: 'out',
  server: {
    url: 'https://www.dealhunter4u.nl',
    cleartext: false,
    // Keep Google OAuth inside the WebView so the PKCE/session cookie jar is shared.
    // Without this, accounts.google.com opens in an external browser and the callback
    // loses the pkce cookie set in the WebView → "server error" after account selection.
    allowNavigation: [
      'accounts.google.com',
      'accounts.googleusercontent.com',
      'www.googleapis.com',
      'oauth2.googleapis.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1A1A1A',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '824303476060-9jh588gqcarlahsi2f3cnrgpqu1cvtnq.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  },
};

export default config;
