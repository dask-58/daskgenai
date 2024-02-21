import React, { useState } from "react";
import "./App.css";
import MarkdownIt from 'markdown-it';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

function App() {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState("");
  const [promptText, setPromptText] = useState("");

  const API_KEY = import.meta.env.VITE_apikey;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assemble the prompt with text only
      const contents = [
        {
          role: "user",
          parts: [
            { text: promptText }
          ]
        }
      ];

      // Instantiate AI with safety settings
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
      const md = new MarkdownIt();
      let buffer = [];
      for await (const response of result.stream) {
        buffer.push(response.text());
      }
      const markdownOutput = md.render(buffer.join(""));

      setApiData(markdownOutput);
    } catch (error) {
      console.error("Error:", error);
      setApiData("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const prefillContent = `(Your Results will appear here.)`;

  return (
    <div className="container">
      <h1>D<span className="text-cyan">as</span>k58 GenAI.</h1>
      <h5 className="text-align-right">Based on 
        <span className="blue"> G</span>
        <span className="red">o</span>
        <span className="yellow">o</span>
        <span className="blue">g</span>
        <span className="green">l</span>
        <span className="red">e </span>
       Gemini-Pro Model.</h5>
      <hr></hr>
      <p>The content is Purely AI Generated. The author of this webpage does not hold any responsibility of the response received.</p>
      <div className="mt-5 mb-5">
        <form onSubmit={handleSubmit}>
          <div className="row d-flex align-items-end">
            <div className="col-lg-8">
              <textarea
                placeholder="Enter your prompt"
                className="form-control"
                id="promptText"
                rows="2"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                style={{ width: "100%", minWidth: "100%", maxWidth: "100%" }}
              ></textarea>
            </div>
            <div className="col-lg-2">
              <button type="submit" className="btn btn-primary mt-3 col-lg-12" disabled={loading}>
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="">
        {!loading && <div className="text-align-left" dangerouslySetInnerHTML={{ __html: apiData || prefillContent }}></div>}
        {loading && <p>Loading...</p>}
      </div>
      <br></br><br></br><br></br><br></br>
      <hr></hr>
      <div className="credits">
        Made with ♥️ by <a href="https://dask-58.github.io">Dhruv Koli.</a>
        <a href="https://www.buymeacoffee.com/dask_58">Click Here</a>
        <p>To support me.</p>
      </div>
    </div>
  );
}

export default App;
