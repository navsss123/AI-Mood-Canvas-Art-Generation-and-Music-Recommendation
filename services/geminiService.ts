import { GoogleGenAI, Type, Part, Modality } from "@google/genai";
import type { MusicGenerationResult, ArtAndMusicGenerationResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const musicSuggestionsSchema = {
  type: Type.OBJECT,
  properties: {
    musicSuggestions: {
      type: Type.ARRAY,
      description: "A list of 3-5 specific song suggestions (artist and title) that fit the mood/vibe. The suggestions should be real songs.",
      items: {
        type: Type.OBJECT,
        properties: {
          artist: {
            type: Type.STRING,
            description: "The name of the artist or band."
          },
          songTitle: {
            type: Type.STRING,
            description: "The title of the suggested song."
          }
        },
        required: ['artist', 'songTitle']
      }
    }
  },
  required: ['musicSuggestions']
};

export async function generateMusicSuggestions(
  prompt: string,
  image?: Part
): Promise<MusicGenerationResult> {
  try {
    const modelParts: Part[] = [];
    let systemInstructionText: string;

    if (prompt && image) {
      systemInstructionText = "You are a seasoned music journalist with an encyclopedic knowledge of music across all genres and eras. Your task is to curate a short, eclectic playlist. Analyze the provided image and text to capture the core emotion and aesthetic. Return a list of 3-5 songs that perfectly match this vibe. Include a mix of genres and artists, from popular hits to hidden gems.";
      modelParts.push({ text: prompt });
      modelParts.push(image);
    } else if (prompt) {
      systemInstructionText = "You are a seasoned music journalist with an encyclopedic knowledge of music across all genres and eras. Your task is to curate a short, eclectic playlist based on the user's description. Capture the core emotion and aesthetic of the text. Return a list of 3-5 songs that perfectly match this vibe. Include a mix of genres and artists, from popular hits to hidden gems.";
      modelParts.push({ text: prompt });
    } else if (image) {
      systemInstructionText = "You are a seasoned music journalist with an encyclopedic knowledge of music across all genres and eras. Your task is to curate a short, eclectic playlist based on the provided image. Analyze its colors, composition, and subject matter to capture its core emotion and aesthetic. Return a list of 3-5 songs that perfectly match this vibe. Include a mix of genres and artists, from popular hits to hidden gems.";
      modelParts.push(image);
    } else {
      throw new Error("Prompt or image must be provided.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: modelParts },
      config: {
        systemInstruction: systemInstructionText,
        responseMimeType: "application/json",
        responseSchema: musicSuggestionsSchema,
      }
    });

    const resultText = response.text.trim();
    const result = JSON.parse(resultText);

    if (!result.musicSuggestions) {
      throw new Error("Failed to generate valid music suggestions.");
    }

    return {
      musicSuggestions: result.musicSuggestions,
    };
  } catch (error) {
    console.error("Error in Gemini service:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error("An unknown error occurred during content generation.");
  }
}

export async function generateArtAndMusic(prompt: string): Promise<ArtAndMusicGenerationResult> {
  try {
    const artPrompt = `A masterpiece digital painting that captures the essence of this mood: "${prompt}". The style should be evocative and artistic, with dramatic lighting, a rich color palette, and intricate details. Aim for a cinematic and emotionally resonant image. Avoid clichés.`;

    const musicPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You are a seasoned music journalist with an encyclopedic knowledge of music across all genres and eras. Your task is to curate a short, eclectic playlist based on the user's description. Capture the core emotion and aesthetic of the text. Return a list of 3-5 songs that perfectly match this vibe. Include a mix of genres and artists, from popular hits to hidden gems.",
        responseMimeType: "application/json",
        responseSchema: musicSuggestionsSchema,
      }
    });

    const artPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: artPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const [musicResponse, artResponse] = await Promise.all([musicPromise, artPromise]);

    // Process music response
    const musicResultText = musicResponse.text.trim();
    const musicResult = JSON.parse(musicResultText);
    if (!musicResult.musicSuggestions) {
      throw new Error("Failed to generate valid music suggestions.");
    }

    // Process art response
    const artPart = artResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    const base64ImageBytes = artPart?.inlineData?.data;
    
    if (base64ImageBytes) {
      const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

      return {
        musicSuggestions: musicResult.musicSuggestions,
        generatedImage: imageUrl,
      };
    } else {
      throw new Error("Failed to generate image from prompt.");
    }

  } catch (error) {
    console.error("Error in Gemini service (Art & Music):", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error("An unknown error occurred during content generation.");
  }
}