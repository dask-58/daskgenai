import React from "react";

const Header: React.FC = () => {
  return (
    <>
      <h1 className="terminal-header">
        E<span className="terminal-header-accent">rudite</span>.
      </h1>
      <p>(formerly daskgenai)</p>
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
    </>
  );
};

export default Header;