package com.palminski.frenchumeboshi;

import android.database.Cursor;
import android.net.Uri;
import android.util.Log;
import android.util.SparseArray;
import android.app.Activity;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReadableArray;

import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.json.JSONArray;

import com.ichi2.anki.api.NoteInfo;
import com.ichi2.anki.api.AddContentApi;

public class AnkiModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private final AnkiDroidHelper helper;

    public AnkiModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.helper = new AnkiDroidHelper(context);
    }

    @Override
    public String getName() {
        return "AnkiModule";
    }

    // ==============================================================================================================

    // Methods To Be Called From Native App

    // ==============================================================================================================

    @ReactMethod
    public void addNote(
            String wordFrench,
            String wordEnglish,
            String exampleSentenceFrench,
            String exampleSentenceEnglish,
            String partOfSpeech,
            String deckToInsertInto,
            Promise promise) {
        try {
            String pkg = AddContentApi.getAnkiDroidPackageName(reactContext);
            if (pkg == null) {
                promise.reject("ANKI_UNAVAILABLE", "ANKIDROID API is not available");
                return;
            }

            if (!handlePermissions(promise))
                return;

            // Ensure Deck Exists
            Long deckId = helper.findDeckIdByName(deckToInsertInto);
            if (deckId == null) {
                deckId = helper.getApi().addNewDeck(deckToInsertInto);
            }

            Long modelId = helper.findModelIdByName("Umeboshi French Card", 5);
            if (modelId == null) {
                modelId = addFrenchNoteType(deckId);
            }
            if (modelId == null) {
                promise.resolve("Model Could Not Be Added");
                return;
            }

            List<String> keys = Arrays.asList(wordFrench);
            SparseArray<List<NoteInfo>> duplicateNotes = helper.getApi().findDuplicateNotes(modelId, keys);
            if (duplicateNotes != null && duplicateNotes.size() > 0) {
                promise.resolve("Duplicate Found. Note Not Added");
                return;
            }

            long noteId = helper.getApi().addNote(
                    modelId,
                    deckId,
                    new String[] {
                        wordFrench,
                        wordEnglish,
                        exampleSentenceFrench,
                        exampleSentenceEnglish,
                        partOfSpeech,
                    },
                    null);
            // "日の出", "sunrise"
            if (noteId == -1) {
                promise.resolve("Duplicate note skipped");
                return;
            } else {
                promise.resolve("Note added with Id: " + noteId);
                return;
            }

        } catch (Exception e) {
            Log.e("AnkiModule", "ERROR ADDING TEST NOTE", e);
            promise.reject("ANKI_ERROR", e);
                return;
        }
    }

    @ReactMethod
    public void getDuplicateNotes(
            String deckToCheck,
            ReadableArray vocabArray,
            Promise promise) {
        try {
            String pkg = AddContentApi.getAnkiDroidPackageName(reactContext);
            if (pkg == null) {
                promise.reject("ANKI_UNAVAILABLE", "ANKIDROID API is not available");
                return;
            }

            if (!handlePermissions(promise))
                return;

            Long modelId = helper.findModelIdByName("Umeboshi French Card", 5);
            if (modelId == null) {
                promise.resolve("Umeboshi French Card Note Type Not Found");
                return;
            }

            List<String> keys = new ArrayList<>();
            for (int i = 0; i < vocabArray.size(); i++) {
                keys.add(vocabArray.getString(i));
            }

            SparseArray<List<NoteInfo>> duplicates = helper.getApi().findDuplicateNotes(modelId, keys);

            JSONArray duplicatesArray = new JSONArray();

            if (duplicates != null && duplicates.size() > 0) {
                {
                    for (int i = 0; i < duplicates.size(); i++) {
                        int keyIndex = duplicates.keyAt(i);
                        List<NoteInfo> noteInfos = duplicates.valueAt(i);

                        for (NoteInfo info : noteInfos) {
                            duplicatesArray.put(keys.get(keyIndex));
                        }
                    }
                }
                promise.resolve(duplicatesArray.toString());
                return;
            }

        } catch (Exception e) {
            Log.e("AnkiModule", "Error Getting Cards", e);
            promise.reject("ANKI_ERROR", e);
                return;
        }
    }

    @ReactMethod
    public void checkAndRequestPermissions(Promise promise) {
        handlePermissions(promise);
    }

    // ==============================================================================================================

    // Private Methods

    // ==============================================================================================================

    private Long addFrenchNoteType(Long deckId) {
    AddContentApi api = helper.getApi();

    // Only the fields you said you need:
    // String wordFrench,
    // String wordEnglish,
    // String exampleSentenceFrench,
    // String exampleSentenceEnglish,
    // String partOfSpeech,
    String[] fields = new String[] {
            "Word-French",
            "Word-English",
            "Sentence-French",
            "Sentence-English",
            "Part-Of-Speech",
    };

    // FRONT: French word + French sentence + part of speech
    String frontTemplate = """
            <div class="word">{{Word-French}}</div>
            <div class="pos">{{Part-Of-Speech}}</div>
            
            <hr id="answer" />

            <div class="sentence">{{Sentence-French}}</div>
            """;

    // BACK: English translation for word + sentence (and you can keep POS if you want)
    String backTemplate = """
            <style>
            body {
                background-size: cover;
                background: linear-gradient(to top, #001c54 1%, rgba(0,0,0,0) 99%);
                background-repeat: no-repeat;
                background-position: bottom;
            }
            </style>

            <div class="word">{{Word-French}}</div>
            <div class="pos">{{Part-Of-Speech}}</div>

            <hr id="answer" />

            <div class="sentence" style="font-size: 30px; ">{{Word-English}}</div>

            <div class="sentence">{{Sentence-French}}</div>
            <div class="sentence" style="font-size: 20px; ">{{Sentence-English}}</div>
            """;

    // No Japanese fonts/links; simple styling
    String css = """
            .card {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                font-size: 22px;
                text-align: center;
                color: white;
                background-color: black;
            }

            html, body {
                min-height: 100%;
                margin: 0;
                padding: 0;
            }

            .word {
                font-size: 56px;
                margin-top: 14px;
                margin-bottom: 6px;
            }

            .pos {
                font-size: 16px;
                opacity: 0.85;
                margin-bottom: 24px;
            }

            .sentence {
                font-size: 32px;
                line-height: 1.25;
                padding: 0 10px 16px 10px;
            }

            hr#answer {
                margin: 18px 0;
                opacity: 0.5;
            }
            """;

    String[] cards = new String[] { "French → English" };
    String[] qfmt  = new String[] { frontTemplate };
    String[] afmt  = new String[] { backTemplate };

    Long newModelId = api.addNewCustomModel(
            "Umeboshi French Card",
            fields,
            cards,
            qfmt,
            afmt,
            css,
            deckId,
            0
    );

    return newModelId;
}


    private boolean handlePermissions(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("ANKI_NO_ACTIVITY", "No active activity to request this permission");
            return false;
        }
        if (helper.shouldRequestPermission()) {
            helper.requestPermission(activity, 0);
            promise.resolve("requested permissions");
            return false;
        }
        return true;
    }
}