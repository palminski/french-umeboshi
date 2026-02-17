import { loadDeckSetting, updateDeckSetting, loadAPIKeySetting, updateAPIKeySetting } from "~/utils/settingsManager";
import { imageInstructionText, singleWordInstructionText, systemInstructionText } from "./aiInstructions";
import OpenAI from "openai";
import axios from "axios";

export async function translateWord(textToSend) {
    console.log("here");
    try {
        const key = await loadAPIKeySetting();
        const response = await axios.post(
            // `http://10.0.2.2:8000/api/french_ai_translation/single_word`,
            `https://nihonki-server-udaaiuh2.on-forge.com/api/french_ai_translation/single_word`,
            { wordToTranslate: textToSend },
            {
                headers: {
                    Authorization: `Bearer ${key}`,
                },
            });
        const jsonString = response.data.message;
        return jsonString;
    } catch (error) {
        if (error.response?.status == 403 || error?.message && error?.message.toLowerCase().includes('incorrect api key')) {
            throw new Error(
                "The API key sent to OpenAi was incorrect. Please input the correct key in this app's settings"
            )
        }
        throw new Error(
            error?.message || "Something went wrong while making the request. Please make sure your API key is correctly configured"
        )
    }
}
