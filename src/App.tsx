import React, { useState } from "react";
import MarkdownIt from "markdown-it";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import katex from "katex";
import "katex/dist/katex.min.css";
import Header from "./components/Header";
import Disclaimer from "./components/Disclaimer";
import PromptInput from "./components/PromptInput";
import SubmitButton from "./components/SubmitButton";
import Result from "./components/Result";
import Credits from "./components/Credits";

interface ImageFile {
  type: string;
}

export default function App(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiData, setApiData] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: (str: string, lang: string) => {
      if (lang === "latex") {
        try {
          return katex.renderToString(str, { throwOnError: false });
        } catch (e) {
          console.error(e);
          return str;
        }
      }
      return "";
    },
  });

  const API_KEY: string = import.meta.env.VITE_apikey;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      let buffer: string[] = [];
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

  const prefillContent: string = `Results will appear here`;
  const fileToGenerativePart = async (file: ImageFile): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });

    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setImageFiles(Array.from(e.target.files));
  };

  const removeFile = (index: number): void => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  return (
    <div className="terminal-container">
      <Header />
      <Disclaimer />
      <PromptInput
        promptText={promptText}
        setPromptText={setPromptText}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
      />
      <SubmitButton loading={loading} handleSubmit={handleSubmit} />
      <Result loading={loading} apiData={apiData} />
      <Credits />
    </div>
  );
}