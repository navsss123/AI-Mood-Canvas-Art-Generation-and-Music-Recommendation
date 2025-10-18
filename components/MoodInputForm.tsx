import React, { useState, useRef } from 'react';

interface MoodInputFormProps {
  onGenerate: (mood: string, imageFile: File | null) => void;
  isLoading: boolean;
}

const MoodInputForm: React.FC<MoodInputFormProps> = ({ onGenerate, isLoading }) => {
  const [mood, setMood] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((mood.trim() || imageFile) && !isLoading) {
      onGenerate(mood.trim(), imageFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg">
      <label htmlFor="mood-input" className="block text-lg font-medium text-gray-300 mb-3">
        Describe a vibe, or upload an image
      </label>
      <div className="space-y-4">
        <textarea
          id="mood-input"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g., a quiet, snowy night in the city..."
          className="w-full bg-gray-800/50 border-2 border-transparent focus:border-purple-500 focus:ring-0 rounded-lg p-3 text-gray-200 placeholder-gray-500 transition-colors duration-300 resize-none"
          rows={2}
          disabled={isLoading}
        />

        {imagePreview && (
            <div className="relative group">
                <img src={imagePreview} alt="Selected preview" className="w-full max-h-60 object-contain rounded-lg" />
                <button 
                    type="button" 
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                    disabled={isLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                id="image-upload"
                disabled={isLoading}
            />
            <label
                htmlFor="image-upload"
                className={`w-full sm:w-auto flex-grow text-center px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isLoading ? 'border-gray-600 text-gray-500 cursor-not-allowed' : 'border-gray-500 text-gray-400 hover:border-pink-500 hover:text-pink-400'}`}
            >
                {imageFile ? `Selected: ${imageFile.name}` : 'Upload Image'}
            </label>
            <button
              type="submit"
              disabled={isLoading || (!mood.trim() && !imageFile)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
            >
              {isLoading ? 'Creating...' : 'Generate'}
            </button>
        </div>
      </div>
    </form>
  );
};

export default MoodInputForm;
