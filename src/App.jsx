// index.js
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';

import React, { useState } from "react";
import MarkdownIt from "markdown-it";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState("");
  const [promptText, setPromptText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);

  

  const API_KEY = import.meta.env.VITE_apikey;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!promptText.trim() && imageFiles.length === 0) {
      alert("Please enter a prompt or select an image before submitting.");
      return;
    }

    setLoading(true);
    try {
      const contents = [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ];

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: imageFiles.length > 0 ? "gemini-pro-vision" : "gemini-pro",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      if (imageFiles.length > 0) {
        const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));
        contents[0].parts.push(...imageParts);
      }

      const result = await model.generateContentStream({ contents });
      const md = new MarkdownIt();
      let buffer = [];
      for await (const response of result.stream) {
        buffer.push(response.text());
      }
      const markdownOutput = md.render(buffer.join(""));

      setApiData(markdownOutput);
    } catch (error) {
      console.error("Error:", error);
      setApiData("Sorry. Error occurred, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const prefillContent = `Results will appear here`;
  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });

    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleImageUpload = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const removeFile = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  return (
    <div className="terminal-container">
      <h1 className="terminal-header">
        E<span className="terminal-header-accent">rudite</span>.
      </h1>
      <p className="terminal-subheader">
        Based on{" "}
        <span className="terminal-subheader-accent">G</span>
        <span className="terminal-subheader-accent">o</span>
        <span className="terminal-subheader-accent">o</span>
        <span className="terminal-subheader-accent">g</span>
        <span className="terminal-subheader-accent">l</span>
        <span className="terminal-subheader-accent">e </span>
        Gemini-Pro-Vision Model.
      </p>
      <p className="terminal-disclaimer">
        The content is Purely AI Generated. The author of this webpage does not hold any responsibility for the response received.
      </p>
      <form onSubmit={handleSubmit} className="terminal-form">
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
                <button className="terminal-file-remove" onClick={() => removeFile(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="terminal-submit" disabled={loading}>
          Submit
        </button>
      </form>
  
      <div className="terminal-result">
        {loading ? (
          <div className="terminal-loading"></div>
        ) : (
          <div className="terminal-output" dangerouslySetInnerHTML={{ __html: apiData || prefillContent }} />
        )}
      </div>
  
      <p className="terminal-credits">
        Made with <span className="terminal-heart">&#10084;</span> by{" "}
        <a href="https://dask-58.github.io" className="terminal-link">
          Dhruv Koli.
        </a>
      </p>
    </div>
  );
}