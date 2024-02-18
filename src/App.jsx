import React, { useState } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const API_KEY = import.meta.env.VITE_apikey;
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState("");
  const [promptText, setPromptText] = useState("");

  const genAI = new GoogleGenerativeAI(API_KEY);

  const fetchData = async () => {
    if(!promptText){
      alert("Enter the prompt..");
      return;
    }
    setLoading(true);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = await response.text();
    setApiData(text);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="container">
      <h1>Dask58 GenAI application.</h1>
      <h5 className="text-align-right">Based on Google Gemini-Pro Model.</h5>
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
        {!loading && <p className="text-align-left">{apiData}</p>}
        {loading && <p>Loading...</p>}
      </div>
      <div className="credits">
        Made with ♥️ by <a href="https://dask-58.github.io">Dhruv Koli.</a>
      </div>
    </div>
  );
}

export default App;
