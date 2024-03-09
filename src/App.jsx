import React, { useState } from "react";
import "./App.css";
import MarkdownIt from "markdown-it";
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from "@google/generative-ai";

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
                const imageParts = await Promise.all(
                    imageFiles.map(fileToGenerativePart)
                );
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
            setApiData("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


    const prefillContent = `(Your Results will appear here...)`;
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
        <div className="container">
            <h1>
                D<span className="text-cyan">ask</span>58 GenAI.
            </h1>
            <h5 className="text-align-right">
                Based on
                <span className="blue"> G</span>
                <span className="red">o</span>
                <span className="yellow">o</span>
                <span className="blue">g</span>
                <span className="green">l</span>
                <span className="red">e </span>
                Gemini-Pro Model.
            </h5>
            <hr></hr>
            <p>
                The content is Purely AI Generated. The author of this webpage
                does not hold any responsibility of the response received.
            </p>
            <div className="mt-5 mb-5 d-flex justify-content-center">
                <form onSubmit={handleSubmit} style={{ width: "83%" }}>
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <textarea
                                placeholder="Enter your prompt"
                                className="form-control mt-3"
                                id="promptText"
                                rows="1"
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                style={{
                                    width: "100%",
                                    minWidth: "100%",
                                    maxWidth: "100%",
                                }}
                            ></textarea>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="form-control mt-3"
                            />
                            <button className="btn btn-primary mt-3">
                                Upload Images
                            </button>
                            {imageFiles.length > 0 && (
                                <div className="d-flex flex-wrap mt-3">
                                    {imageFiles.map((file, index) => (
                                        <div key={index} className="mr-3 mb-3">
                                            <span>{file.name}</span>
                                            <button
                                                className="btn btn-danger btn-sm ml-2"
                                                onClick={() => removeFile(index)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-lg-3">
                            <button
                                type="submit"
                                className="btn btn-primary mt-3 w-100"
                                disabled={loading}
                            >
                                {"Submit"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="result">
                {!loading && (
                    <div
                        className="text-align-left"
                        dangerouslySetInnerHTML={{
                            __html: apiData || prefillContent,
                        }}
                    ></div>
                )}
                {loading && <p>Generating...</p>}
            </div>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <hr></hr>
            <div className="credits">
                Made with <span className="heart">♥️</span> by{" "}
                <a href="https://dask-58.github.io">Dhruv Koli.</a>
                <br></br>
            </div>
        </div>
    );
}