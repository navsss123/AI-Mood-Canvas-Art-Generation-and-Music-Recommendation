import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  caption: string;
  hasUserImage: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, caption, hasUserImage }) => {
  return (
    <div className="w-full h-full bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between space-y-4">
      <div className="aspect-square w-full rounded-lg overflow-hidden border-2 border-white/10 flex items-center justify-center bg-black/20">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={hasUserImage ? "User uploaded vibe" : "AI generated art for your vibe"} 
            className="w-full h-full object-cover" 
          />
        ) : (
            <p className="text-gray-500">Your art will appear here.</p>
        )}
      </div>
      {caption && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Vibe Description:</h3>
          <p className="text-gray-300 text-sm italic bg-black/20 p-3 rounded-md">"{caption}"</p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;