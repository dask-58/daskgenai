// index.tsx
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';

import React, { useState, FormEvent } from "react";
import MarkdownIt from "markdown-it";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState("");
  const [promptText, setPromptText] = useState("");

  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
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

  const API_KEY = import.meta.env.VITE_apikey as string;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!promptText.trim()) {
      alert("Please enter a prompt before submitting.");
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
        model: "gemini-pro",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      const result = await model.generateContentStream({ contents });
      const buffer: string[] = [];
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

  return (
    <div className="terminal-container">
      <h1 className="terminal-header">
        E<span className="terminal-header-accent">rudite</span>.
      </h1><p>(formerly daskgenai)</p>
      <p className="terminal-subheader">
        Based on{" "}
        <span className="terminal-subheader-accent">G</span>
        <span className="terminal-subheader-accent">o</span>
        <span className="terminal-subheader-accent">o</span>
        <span className="terminal-subheader-accent">g</span>
        <span className="terminal-subheader-accent">l</span>
        <span className="terminal-subheader-accent">e </span>
        Gemini-Pro Model.
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
