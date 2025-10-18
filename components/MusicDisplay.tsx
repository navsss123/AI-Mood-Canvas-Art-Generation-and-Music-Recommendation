import React from 'react';
import type { MusicSuggestion } from '../types';
import MusicNoteIcon from './icons/MusicNoteIcon';

interface MusicDisplayProps {
  suggestions: MusicSuggestion[];
}

const MusicDisplay: React.FC<MusicDisplayProps> = ({ suggestions }) => {
  const createYouTubeSearchUrl = (artist: string, songTitle: string) => {
    const query = encodeURIComponent(`${artist} ${songTitle}`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  return (
    <div className="w-full h-full bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col">
      {suggestions && suggestions.length > 0 ? (
        <ul className="space-y-3">
          {suggestions.map((song, index) => (
            <li key={index}>
              <a 
                href={createYouTubeSearchUrl(song.artist, song.songTitle)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-black/20 p-3 rounded-md transition-colors hover:bg-black/40"
                aria-label={`Listen to ${song.songTitle} by ${song.artist}`}
              >
                <MusicNoteIcon className="w-5 h-5 text-pink-400/70 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-200">{song.songTitle}</p>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No music suggestions available.</p>
      )}
    </div>
  );
};

export default MusicDisplay;