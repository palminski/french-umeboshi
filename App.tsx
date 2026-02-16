
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, NativeModules, Alert } from 'react-native';
import './global.css';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '~/screens/HomeScreen';
import SettingsScreen from '~/screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
// import { getIsUserSubscribed, getDeviceInfo } from '~/utils/subscriptionMethods';

import { useEffect, createContext, useState } from 'react';
import Purchases from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


interface UserData {
    appUserId: string,
    isSubscribed: boolean,
    imagesRemaining: number,
    wordsRemaining: number,
}

interface AppContextType {
    userData: UserData,
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export default function App() {

    const { AnkiModule } = NativeModules;

    useEffect(() => {
        (async () => {
            try {
                await AnkiModule.checkAndRequestPermissions();
            } catch (error: any) {
                console.warn("Failed to check permission on startup");
            }
        })();
    }, [])

    return (
        
            <SafeAreaView className='flex-1 bg-black' edges={["bottom", "left", "right"]}>


                <NavigationContainer>
                    <Stack.Navigator
                        screenOptions={({ route, navigation }) => ({
                            headerShown: true,
                            headerShadowVisible: true,
                            headerStyle: {
                                backgroundColor: "#050505",

                            },
                            headerTintColor: "#fff",
                        })}
                    >
                        <Stack.Screen
                            name='Home'
                            component={HomeScreen}
                            options={({ navigation }) => ({
                                title: "Wayne's French App",

                                headerRight: () => (
                                    <Pressable onPress={() => { navigation.navigate("Settings") }} style={{ marginRight: 15 }}>
                                        <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                                    </Pressable>
                                ),
                            })}
                        />
                        <Stack.Screen
                            name='Settings'
                            component={SettingsScreen}
                            options={{
                                title: "Settings",
                                headerStyle: { backgroundColor: "#050505" },
                                headerTintColor: "#fff",
                            }}
                        />

                        
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaView>
    );
}
