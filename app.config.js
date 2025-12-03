import 'dotenv/config';

import 'dotenv/config';

export default {
  expo: {
    name: 'rentAChef',
    slug: 'rentAChef',
    scheme: 'rentAChef',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/loadIcon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
    },

    android: {
      package: 'com.floathhub.rentachef',
      adaptiveIcon: {
        backgroundColor: '#F3F3F1',
        foregroundImage: './assets/loadIcon.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      output: 'static',
      favicon: './assets/loadIcon.png',
    },
    extra: {
      apiUrl: process.env.API_BASEURL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      "eas": {
        "projectId": "753119bc-6b63-49d4-93be-0ef5d1caf033"
      }
    },

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/loadIcon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#F3F3F1',
          dark: {
            backgroundColor: '#F3F3F1'
          },
        },
      ],
      'expo-secure-store'
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },

};