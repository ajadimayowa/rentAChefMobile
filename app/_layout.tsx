import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";
import { Text, TouchableOpacity } from "react-native";

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index', // or 'authscreen'
};


export default function RootLayout() {

  const [loaded, error] = useFonts({
    primaryFont: require('../assets/fonts/DM_Sans/static/DMSans_18pt-Light.ttf'),
    secondaryFont: require('../assets/fonts/Poppins-Bold.ttf'),
    titleFont: require('../assets/fonts/Poppins-ExtraBold.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);


  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="authscreen" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="login-chef" options={{ headerShown: false }} />
            <Stack.Screen name="(guest)" options={{ headerShown: false }} />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
            <Stack.Screen name="(chefdashboard)" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="signup-chef" options={{ headerShown: false }} />
            <Stack.Screen name="otpverificationscreen" options={{ headerShown: false }} />
            <Stack.Screen name="emailotpverificationscreen" options={{ headerShown: false }} />
            <Stack.Screen name="SetPassword" options={{ headerShown: false }} />
            <Stack.Screen name="forgotpasswordscreen" options={{ headerShown: false }}/>
            <Stack.Screen name="resetpasswordscreen" options={{ headerShown: false }}/>

            <Stack.Screen name="viewmenu" options={{ headerShown: false }} />
            <Stack.Screen name="viewchefinfo" options={{ headerShown: true,headerTitleAlign: "center", title:'Chef Information', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />
            <Stack.Screen name="viewavailability" options={{ headerShown: true,headerTitleAlign: "center", title:'Check Availability', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />
            <Stack.Screen name="viewspecialmenubooking" options={{ headerShown: true,headerTitleAlign: "center", title:'Booking details', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />

            <Stack.Screen name="viewprofile" options={{ headerShown: false,headerTitleAlign: "center", title:'User Profile', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />
            
            <Stack.Screen name="paymentpage" options={{ headerShown: true,headerTitleAlign: "center", title:'Complete Payment', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />
            <Stack.Screen name="bookingpage" options={{ headerShown: true,headerTitleAlign: "center", title:'Booking Options', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />
            <Stack.Screen name="clientviewbookinginfo" options={{ headerShown: true,headerTitleAlign: "center", title:'Booking Information', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />
            <Stack.Screen name="chefviewbookinginfo" options={{ headerShown: true,headerTitleAlign: "center", title:'Booking Information', headerLeft:()=><TouchableOpacity onPress={()=>router.back()}><Text>Back</Text></TouchableOpacity> }} />

            <Stack.Screen name="paystackscreen" options={{ presentation: "modal",headerTitleAlign: "center", title: 'Pay With Paystack' }} />
            <Stack.Screen name="paystackscreenchef" options={{ presentation: "modal",headerTitleAlign: "center", title: 'Pay With Paystack' }} />
            <Stack.Screen name="states" options={{ presentation: "modal",headerTitleAlign: "center", title: 'Choose State' }} />
            <Stack.Screen name="notifications" options={{ presentation: "modal",headerTitleAlign: "center", title: 'Notifications' }} />
            <Stack.Screen name="location" options={{ presentation: "modal",headerTitleAlign: "center", title: 'Choose LGA' }} />
            <Stack.Screen name="search" options={{ presentation: "modal",headerTitleAlign: "center", title: 'Search Menu' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          
        </ThemeProvider>
      </PersistGate>
      <Toast/>
    </Provider>
  );
}