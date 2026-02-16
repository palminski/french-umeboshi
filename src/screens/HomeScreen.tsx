import { View, Text, Pressable, Alert, Image, ScrollView, NativeModules, TextInput, ActivityIndicator, ImageBackground } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ScreenWrapper from "~/components/ScreenWrapper";
import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { loadAPIKeySetting } from "~/utils/settingsManager";
import { loadVocabList, updateVocabList } from "~/utils/asyncStorageManager";
import { Ionicons } from "@expo/vector-icons";
import LinearGradient from "react-native-linear-gradient";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import VocabCard from "~/components/VocabCard";
import ImageView from "react-native-image-viewing";
import axios from "axios";
import Purchases from "react-native-purchases";

import { translateWord } from "~/utils/aiAPICalls";

import UmeboshiChan from "../assets/UmeboshiChan.svg";

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const [currentRequests, setCurrentRequests] = useState<Record<string, string>>({});

    const [inputText, setInputText] = useState<string>("");

    const [fromFrench, setfromFrench] = useState<boolean>(true);

    const [cardObjectArray, setCardObjectArray] = useState<Array<any>>([]);

    const [snappedImages, setSnappedImages] = useState<any[]>([]);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [hasKey, setHasKey] = useState(false);


    
    

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const key = await loadAPIKeySetting();
                if (!(key == null || key == "")) {
                    setHasKey(true);
                }
                else {
                    setHasKey(false);
                }
            })();
        }, [])
    )


    const textInputRef = useRef<TextInput>(null);

    const handleTextSubmit = async (textToSend: string) => {

        if (textToSend == null || textToSend == "") return;

        // const key = await loadAPIKeySetting();
        // if ((key == null || key == "")) {
        //     Alert.alert("Setup Required", "To start making cards please go to settings and either purchase a subscription or provide an OpenAI API key.")
        //     return;
        // }

        try {
            setInputText("");
            setCurrentRequests(prev => ({
                ...prev,
                [textToSend]: "text"
            }));

            let jsonString = "";

            // Make request from app or from server depending on if user input a key
            
            jsonString = await translateWord(textToSend, fromFrench);

            setCurrentRequests(prev => {
                const { [textToSend]: _, ...rest } = prev
                return rest
            });

            if (jsonString !== null) {
                //Validate Response
                const cardObject = JSON.parse(jsonString);
                const { valid, missing } = ValidateCardData(cardObject);
                if (!valid) {
                    Alert.alert("Something was wrong with the response");
                    return;
                }
                //Add Vocab Word To VOcab Word Array
                setCardObjectArray(prev => {
                    const filtered = prev.filter(card => card.wordFrench !== cardObject.wordFrench);
                    return [cardObject, ...filtered]
                })
            }

        } catch (error: any) {
            setCurrentRequests(prev => {
                const { [textToSend]: _, ...rest } = prev
                return rest
            });
            alert(error?.message);
        }
    }

    const HandleFormChange = async (value: string) => {
        setInputText(value);
    }

    const handleEnterText = async (shouldSetToFrench: boolean) => {
        
        setfromFrench(shouldSetToFrench);


        textInputRef.current?.blur();
        setTimeout(() => {
            textInputRef.current?.focus();
        }, 150);
    }

    function ValidateCardData(data: any): { valid: boolean; missing: string[] } {
        let requiredFields = [
            "wordEnglish",
            "wordFrench",
            "partOfSpeech",
            "exampleSentenceFrench",
            "exampleSentenceEnglish"
        ]
        const missing = requiredFields.filter((key) => !(key in data) || data[key] === "");
        return {
            valid: missing.length === 0,
            missing
        }
    }

    return (
        <ScreenWrapper>
            <View className="flex-1 ">

                <ScrollView
                    style={{ flex: 1, zIndex: 15 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    className="p-4"
                >

                    {/* INPUT AND STATUS BOX */}
                            <View className="flex flex-row bg-black rounded min-h-[100px] border mb-2 shadow-lg shadow-sky-300 border-sky-800">
                                <View className="border border-r-sky-600 w-full flex flex-row">
                                    <TextInput onSubmitEditing={() => handleTextSubmit(inputText)} ref={textInputRef} className='border text-lg text-sky-300 placeholder:text-sky-300/50 rounded m-2 flex-1' value={inputText} onChangeText={(text) => HandleFormChange(text)} placeholder={fromFrench ? "Enter French Word" : "Enter English Word"} />
                                    <View className="flex justify-end">
                                        <Pressable onPress={() => handleTextSubmit(inputText)} className="m-2 border p-2 bg-sky-800 border-sky-600 rounded flex-row items-center">
                                            <Text className=" text-white">{fromFrench ? "Submit French Word" : "Submit English Word"}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                    {

                        Object.entries(currentRequests).map(([key, value]) => (
                            <View key={key} className="my-2  shadow-sky-800 border border-sky-300 p-3 bg-black/20  rounded">
                                <View className="flex flex-row justify-start items-center ">
                                    <View>
                                        <ActivityIndicator size={50} color={'#A855F7'} />
                                    </View>
                                    <View className="mx-auto">
                                        {
                                            value === "text" ?
                                                <Text className="text-sky-300 text-lg">Loading Request For <Text className="font-semibold">{key}</Text></Text>
                                                :
                                                <Text className="text-sky-300 text-lg">Loading Image</Text>
                                        }
                                    </View>
                                    {
                                        (value !== "text") && <Image className="rounded border border-sky-800" source={{ uri: value }} style={{ width: 100, height: 100 }} />
                                    }

                                </View>
                            </View>
                        ))
                    }



                    {/* Kanji List */}
                    {
                        (cardObjectArray.length > 0 || Object.entries(currentRequests).length > 0) ?
                            <>
                                {cardObjectArray.map((card: any, index: number) => (
                                    <View key={card.wordFrench}>
                                        <VocabCard vocabWord={card} />
                                    </View>
                                ))}
                            </>
                            :
                            <View>
                                <Text className="mt-6 text-xl font-semibold text-sky-300/50 mx-auto">Translated Words Will Appear Here</Text>
                            </View>
                    }

                    {/* Comment In To See Test Vocab Card */}
                    {/* <View className="my-2 shadow-lg shadow-sky-800 border border-sky-500 p-3 bg-sky-950  rounded">
                        <View className="flex flex-row justify-between items-end ">
                            <Pressable className="flex-1 mr-2">
                                <Text className="text-sky-300 mb-1">
                                    <Text className="text-2xl text-sky-200">TEST CARD</Text> - <Text className="text text-sky-200">[ TEST CARD ]</Text>
                                </Text>
                                <Text className=" text-sky-300 text-sm">
                                    TEST CARD
                                </Text>
                            </Pressable>
                        </View>
                    </View> */}


                </ScrollView>
                <UmeboshiChan width={200} height={200} style={{position: "absolute", bottom: 0, left:15, zIndex:10}}></UmeboshiChan>

                <LinearGradient
                    style={{ position: 'absolute', bottom: 0, width: "100%", height: 50, zIndex: 20 }}
                    colors={['#52525200', '#000000']}
                    pointerEvents={'none'}
                />

            </View>
            {/* Bottom Menu */}
            <View className="relative bg-transparent">
                <View className="flex-row justify-around items-end py-1 bg-[#000000]">
                    <Pressable onPress={()=>handleEnterText(false)} className="items-center w-1/3">
                            <Text style={{ fontSize: 30 }}>🇬🇧</Text>
                        
                        <Text className="text-white text-xs mt-1">From English</Text>
                    </Pressable>
                    {/* <View className="items-center w-1/3 relative">
                        <Pressable onPress={handleOpenCamera} className="">
                            <Ionicons name="camera" size={50} color={"#fff"} />
                            

                        </Pressable>
                        <Text className="text-white text-xs mt-1">Scan Text</Text>
                    </View> */}
                    <View className="items-center w-1/3 relative">
                        <Pressable onPress={()=>handleEnterText(true)}>
                            <Text style={{ fontSize: 30 }}>🇫🇷</Text>

                            
                        </Pressable>
                        <Text className="text-white text-xs mt-1">From French</Text>
                    </View>
                </View>
            </View>

        </ScreenWrapper>
    )
}