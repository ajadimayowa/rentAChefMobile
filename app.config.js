import 'dotenv/config';

export default {
  expo: {
    name: 'Rent A Chef',
    slug: 'rentAChef',
    scheme: 'rentachef',
    version: '2.0',
    orientation: 'portrait',
    icon: './assets/images/loadIcon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.app.rentachef',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          'This app needs your location to show nearby chefs and improve recommendations.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'This app may use your location to provide location-based services even when the app is in the background.',
      },
    },

    android: {
      package: 'com.app.rentachef',

      adaptiveIcon: {
        backgroundColor: '#F3F3F1',
        foregroundImage: './assets/images/loadIcon.png',
        backgroundImage: './assets/images/loadIcon.png',
        monochromeImage: './assets/images/loadIcon.png',
      },

      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,

      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
    },

    web: {
      output: 'static',
      favicon: './assets/images/loadIcon.png',
    },

    extra: {
      apiUrl: process.env.API_BASEURL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      nodeEnv: process.env.NODE_ENV,

      eas: {
        projectId: '82bf931e-fee8-4dc9-b3a1-bb732a7fa63b',
      },
    },

    plugins: [
      'expo-router',

      '@react-native-community/datetimepicker',

      [
        'expo-splash-screen',
        {
          image: './assets/images/loadIcon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#F3F3F1',
          dark: {
            backgroundColor: '#F3F3F1',
          },
        },
      ],

      [
        'expo-build-properties',
        {
          android: {
            enableMinifyInReleaseBuilds: true,
          },
        },
      ],

      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow this app to use your location.',
        },
      ],

      'expo-secure-store',
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};