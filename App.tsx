import React, { useState } from 'react';
import MoodInputForm from './components/MoodInputForm';
import ImageDisplay from './components/ArtDisplay';
import MusicDisplay from './components/MusicDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { generateMusicSuggestions, generateArtAndMusic } from './services/geminiService';
import type { MusicSuggestion } from './types';
import PaintBrushIcon from './components/icons/PaintBrushIcon';
import MusicNoteIcon from './components/icons/MusicNoteIcon';

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [musicSuggestions, setMusicSuggestions] = useState<MusicSuggestion[] | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');

  const handleGenerate = async (mood: string, imageFile: File | null) => {
    setIsLoading(true);
    setError(null);
    setMusicSuggestions(null);
    setGeneratedImage(null);
    setUserPrompt('');

    // Revoke previous object URL if it exists to prevent memory leaks
    if (userImage) {
      URL.revokeObjectURL(userImage);
      setUserImage(null);
    }

    try {
      if (imageFile) {
        // Case 1: User uploaded an image (with or without text)
        const base64Data = await fileToBase64(imageFile);
        const imagePayload = {
          inlineData: {
            data: base64Data,
            mimeType: imageFile.type,
          },
        };
        setUserImage(URL.createObjectURL(imageFile));
        if (mood) {
          setUserPrompt(mood);
        }
        const result = await generateMusicSuggestions(mood, imagePayload);
        setMusicSuggestions(result.musicSuggestions);
      } else if (mood.trim()) {
        // Case 2: User provided only text input
        setUserPrompt(mood);
        const result = await generateArtAndMusic(mood);
        setGeneratedImage(result.generatedImage);
        setMusicSuggestions(result.musicSuggestions);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showResults = (musicSuggestions || userImage || generatedImage) && !isLoading;

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200 selection:bg-purple-500 selection:text-white">
      <div className="relative isolate min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
        {/* Background Gradients */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <main className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-8 z-10">
          <header className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              AI Mood Canvas
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Find the perfect soundtrack for any vibe.
            </p>
          </header>

          <MoodInputForm onGenerate={handleGenerate} isLoading={isLoading} />

          {error && <div className="mt-6 p-4 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg">{error}</div>}

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 text-gray-400">
              <LoadingSpinner />
              <p>Curating your soundtrack...</p>
            </div>
          )}

          {showResults && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 animate-fade-in">
              <div className="flex flex-col space-y-4">
                 <h2 className="text-2xl font-display flex items-center gap-3">
                  <PaintBrushIcon className="w-6 h-6 text-purple-400" />
                  {userImage ? 'Your Vibe' : 'Generated Art'}
                </h2>
                <ImageDisplay
                  imageUrl={userImage || generatedImage}
                  caption={userPrompt}
                  hasUserImage={!!userImage}
                />
              </div>
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-display flex items-center gap-3">
                  <MusicNoteIcon className="w-6 h-6 text-pink-400" />
                  Music Suggestions
                </h2>
                <MusicDisplay
                  suggestions={musicSuggestions ?? []}
                />
              </div>
            </div>
          )}
        </main>
        
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;