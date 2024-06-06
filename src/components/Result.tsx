import React from "react";
import MarkdownIt from "markdown-it";
import katex from "katex";
import "katex/dist/katex.min.css";

interface ResultProps {
  loading: boolean;
  apiData: string;
}

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

const Result: React.FC<ResultProps> = ({ loading, apiData }) => {
  const prefillContent = `Results will appear here`;

  return (
    <div className="terminal-result">
      {loading ? (
        <div className="terminal-loading"></div>
      ) : (
        <div
          className="terminal-output"
          dangerouslySetInnerHTML={{
            __html: apiData || md.render(prefillContent),
          }}
        />
      )}
    </div>
  );
};

export default Result;