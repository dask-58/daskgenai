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
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <h1 className="text-5xl font-bold text-indigo-600 mb-4">
        D<span className="text-red-500">ask</span>58 GenAI.
      </h1>
      <h5 className="text-gray-600 text-right mb-4">
        Based on{" "}
        <span className="text-blue-500 font-semibold">G</span>
        <span className="text-red-500 font-semibold">o</span>
        <span className="text-yellow-500 font-semibold">o</span>
        <span className="text-blue-500 font-semibold">g</span>
        <span className="text-green-500 font-semibold">l</span>
        <span className="text-red-500 font-semibold">e </span>
        Gemini-Pro-Vision Model.
      </h5>
      <hr className="mb-4" />
      <p className="text-gray-700 mb-6">
        The content is Purely AI Generated. The author of this webpage does not hold any responsibility for the
        response received.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center">
        <div className="flex-1 mr-4">
          <textarea
            placeholder="Enter your prompt"
            className="form-control mt-3 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            id="promptText"
            rows="1"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-3 w-full"
          />
          <button
            className="btn btn-primary mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Upload Images
          </button>
          {imageFiles.length > 0 && (
            <div className="flex flex-wrap mt-3">
              {imageFiles.map((file, index) => (
                <div key={index} className="mr-3 mb-3 bg-gray-100 rounded-md p-2 flex items-center">
                  <span className="mr-2">{file.name}</span>
                  <button
                    className="btn btn-danger btn-sm ml-2 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-primary mt-3 w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </form>

      <div className="result mt-8">
        {!loading && (
          <div
            className="text-left bg-gray-100 p-4 rounded-md"
            dangerouslySetInnerHTML={{
              __html: apiData || prefillContent,
            }}
          />
        )}
        {loading && <p className="text-gray-600">Generating...</p>}
      </div>
      <hr className="my-8" />
      <div className="credits text-center">
        Made with <span className="text-red-500 animate-pulse">&#10084;</span> by{" "}
        <a
          href="https://dask-58.github.io"
          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
        >
          Dhruv Koli.
        </a>
      </div>
    </div>
  );
}