export interface MusicSuggestion {
  artist: string;
  songTitle: string;
}

export interface MusicGenerationResult {
  musicSuggestions: MusicSuggestion[];
}

export interface ArtAndMusicGenerationResult {
    musicSuggestions: MusicSuggestion[];
    generatedImage: string;
}