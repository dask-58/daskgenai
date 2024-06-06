import React from "react";

interface PromptInputProps {
  promptText: string;
  setPromptText: (text: string) => void;
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  promptText,
  setPromptText,
  imageFiles,
  setImageFiles,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFiles(Array.from(e.target.files || []));
  };

  const removeFile = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  return (
    <form className="terminal-form">
      <textarea
        placeholder="Enter your prompt"
        className="terminal-textarea"
        rows={4}
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
      />
      <div className="terminal-file-upload">
        <input
          accept="image/*"
          multiple
          type="file"
          onChange={handleImageUpload}
          id="upload-images"
          className="terminal-file-input"
        />
        <label htmlFor="upload-images" className="terminal-file-label">
          Upload Images
        </label>
      </div>
      {imageFiles.length > 0 && (
        <div className="terminal-file-list">
          {imageFiles.map((file, index) => (
            <div key={index} className="terminal-file-item">
              <span className="terminal-file-name">{file.name}</span>
              <button
                className="terminal-file-remove"
                onClick={() => removeFile(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default PromptInput;