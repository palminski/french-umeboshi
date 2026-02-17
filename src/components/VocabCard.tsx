import { View, Text, Pressable, NativeModules, Alert } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ReactNode, useState } from "react";
import { StyleSheet } from "react-native";
import { Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { loadDeckSetting, loadAPIKeySetting } from "~/utils/settingsManager";

interface VocabWord {
    wordFrench: string
    wordEnglish: string
    meaning: string
    exampleSentenceFrench: string
    exampleSentenceEnglish: string
    partOfSpeech: string
}

interface VocabCardProps {
    vocabWord: VocabWord
    hasBeenSent?: boolean
}



export default function VocabCard({ vocabWord, hasBeenSent = false }: VocabCardProps) {

    const { AnkiModule } = NativeModules;

    const [isAdded, setIsAdded] = useState(hasBeenSent);
    const [isOpen, setIsOpen] = useState(false)

    async function handleSendToAnki(cardObject: VocabWord) {
        const deckToInsertInto = await loadDeckSetting();
        try {
            const result = await AnkiModule.addNote(
                cardObject.wordFrench,
                cardObject.wordEnglish,
                cardObject.exampleSentenceFrench,
                cardObject.exampleSentenceEnglish,
                cardObject.partOfSpeech,
                deckToInsertInto ? deckToInsertInto : "Umeboshi"
            );
            setIsAdded(true)
        } catch (error: any) {
            Alert.alert("AnkiDroid Could Not Be Reached", error?.message);
        }

    }

    useEffect(() => {
        setIsAdded(hasBeenSent);
    }, [hasBeenSent]);

    return (
        <View className="my-2 shadow-lg shadow-sky-800 border border-sky-500 p-3 bg-sky-950  rounded">
            <View className="flex flex-row justify-between items-end ">
                <Pressable onPress={() => setIsOpen(!isOpen)} className="flex-1 mr-2">
                    <Text className="text-sky-300 mb-1">
                        <Text className="text-2xl text-sky-200">{vocabWord.wordFrench}</Text> - <Text className="text text-sky-200">{isOpen ? "▼" : "▲"}</Text>
                    </Text>
                    <Text className=" text-sky-300 text-sm">
                        {vocabWord.wordEnglish}
                    </Text>
                </Pressable>
                {
                    !isAdded ?
                        <Pressable onPress={() => handleSendToAnki(vocabWord)} className="border p-2 bg-sky-800 border-sky-600 rounded flex-row items-center">
                            <Text className=" text-white">Send to Anki</Text>
                            <Ionicons className="ml-2" name="send-outline" size={12} color={"#fff"} />
                        </Pressable>
                        :
                        <Pressable className="border p-2 border-sky-800 bg-sky-950 rounded flex-row items-center">
                            <Text className=" text-sky-400">Card Added!</Text>
                            <Ionicons className="ml-2" name="checkmark-outline" size={12} color={"#38bdf8"} />
                        </Pressable>
                }
            </View>
            {
                isOpen &&
                <>
                    <View
                        className="my-3"
                    />
                    <View className="mb-2">
                        <Text className="text-sky-300"><Text className="font-semibold">French: </Text>{vocabWord.wordFrench}</Text>
                        <Text className="text-sky-300"><Text className="font-semibold">English: </Text>{vocabWord.wordEnglish}</Text>
                        <Text className="text-sky-300"><Text className="font-semibold">Part of Speach: </Text>{vocabWord.partOfSpeech}</Text>
                    </View>
                    <View className="">
                        <Text className="font-semibold text-sky-300 underline">Example Sentence: </Text>
                        <Text className="text-sky-300">{vocabWord.exampleSentenceFrench}</Text>
                        <Text className="text-sky-300">{vocabWord.exampleSentenceEnglish}</Text>
                    </View>
                </>
            }

        </View>


    )
}