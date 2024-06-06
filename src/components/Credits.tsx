import React from "react";

const Credits: React.FC = () => {
  return (
    <p className="terminal-credits">
      Made with <span className="terminal-heart">&#10084;</span> by{" "}
      <a href="https://dask-58.github.io" className="terminal-link">
        Dhruv Koli.
      </a>
    </p>
  );
};

export default Credits;