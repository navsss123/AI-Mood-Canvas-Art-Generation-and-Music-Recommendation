import { GoogleGenAI, Type, Part } from "@google/genai";
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
      systemInstructionText = "You are an expert music curator. Generate specific song suggestions that perfectly match the visual mood and atmosphere of the user's image, and consider any accompanying text description.";
      modelParts.push({ text: prompt });
      modelParts.push(image);
    } else if (prompt) {
      systemInstructionText = "You are an expert music curator. Generate specific song suggestions that perfectly match the vibe of the user's text description.";
      modelParts.push({ text: prompt });
    } else if (image) {
      systemInstructionText = "You are an expert music curator. Generate specific song suggestions that perfectly match the visual mood and atmosphere of the user's image.";
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
    const artPrompt = `A stunning, high-quality artwork representing the mood: "${prompt}".`;

    const musicPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You are an expert music curator. Generate specific song suggestions that perfectly match the vibe of the user's text description.",
        responseMimeType: "application/json",
        responseSchema: musicSuggestionsSchema,
      }
    });

    const artPromise = ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: artPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
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
    const base64ImageBytes = artResponse.generatedImages?.[0]?.image?.imageBytes;
    
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