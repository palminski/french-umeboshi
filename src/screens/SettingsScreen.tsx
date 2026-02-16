import { View, Text, Pressable, TextInput, Alert, ScrollView, ActivityIndicator, NativeModules, Linking } from "react-native";
import { useEffect, useState, useCallback, useContext } from "react";
import ScreenWrapper from "~/components/ScreenWrapper";
import { loadDeckSetting, updateDeckSetting, loadAPIKeySetting, updateAPIKeySetting } from "~/utils/settingsManager";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AppContext } from "App";

export default function SettingsScreen() {
    

    const [loading, setLoading] = useState(false);


    const [settingForm, setSettingsForm] = useState({
        insertDeck: "",
        apiKey: ""
    });


    useFocusEffect(
        useCallback(() => {
            (async () => {
                setLoading(true);

                const deckSetting = await loadDeckSetting();
                // const apiKeySetting = await loadAPIKeySetting();
                setSettingsForm({
                    ...settingForm,
                    insertDeck: deckSetting != null ? deckSetting : "",
                });


                setLoading(false);
            })();
        }, [])
    )

    const handleFormChange = (key: string, value: string) => {
        setSettingsForm({
            ...settingForm,
            [key]: value,
        })
    }

    const handleFormSubmit = async () => {
        if (loading) return;
        setLoading(true);
        await updateAPIKeySetting(settingForm.apiKey);
        await updateDeckSetting(settingForm.insertDeck);
        setLoading(false);
        Alert.alert("Setting Saved!")
    }

    const debug = async () => {
        if (!__DEV__) {
            Alert.alert("Can't access purchases yet.", "Purchases are currently only set up on development build. Please use API key");

        }
        try {
            
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            Alert.alert(error?.message ? error.message : "ERROR");
        }
    }

   

    return (
        <ScreenWrapper>
            <View className="flex-1">
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    className="p-4"
                >

                    <View className="mb-3">
                        <View className="flex-row items-center">
                            <Text className="text-white text-lg mr-2">
                                Anki Deck To Insert Into
                            </Text>
                            <Pressable onPress={() => Alert.alert("Anki Deck To Insert Into", "When send to anki is clicked this is the deck new cards will be inserted into. If no deck with the given name exists a new one will be made. If no text is entered here it will default to Umeboshi")} className="items-center">
                                <Ionicons name="help-circle-outline" size={18} color={"#fff"} />
                            </Pressable>
                        </View>
                        <TextInput className='bg-black border mb-2 shadow-lg shadow-sky-300 border-sky-800 my-1 rounded placeholder:text-sky-300/50' value={settingForm.insertDeck} onChangeText={(text) => handleFormChange('insertDeck', text)} placeholder='Deck Name (Defaults to Umeboshi)' />
                    </View>

                </ScrollView>
                <LinearGradient
                    style={{ position: 'absolute', bottom: 0, width: "100%", height: 50 }}
                    colors={['#52525200', '#000000']}
                    pointerEvents={'none'}
                />
            </View>
            <View className="relative bg-transparent">
                <View className="flex-row justify-around items-end py-1 bg-[#000000]">
                    <Pressable className="items-center w-1/3">
                        {/* <Ionicons name="list" size={30} color={"#fff"} />
                        <Text className="text-white text-xs mt-1">Vocab List</Text> */}
                    </Pressable>
                    <Pressable onPress={handleFormSubmit} className="items-center w-1/3">
                        <Ionicons name="save-outline" size={50} color={"#fff"} />
                        <Text className="text-white text-xs mt-1">Save Settings</Text>
                    </Pressable>
                    <Pressable className="items-center w-1/3">
                        {/* <Ionicons name="bug-outline" size={30} color={"#fff"} />
                        <Text className="text-white text-xs mt-1">Debug</Text> */}
                    </Pressable>
                </View>
            </View>



            {
                loading &&
                <View className="w-full h-full absolute bg-black/20 flex items-center justify-center">
                    <ActivityIndicator size={50} color={'#A855F7'} />
                </View>
            }

        </ScreenWrapper>
    )
}