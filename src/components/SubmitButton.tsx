import React from "react";

interface SubmitButtonProps {
  loading: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  handleSubmit,
}) => {
  return (
    <button
      type="submit"
      className="terminal-submit"
      onClick={(e) => handleSubmit(e)}
      disabled={loading}
    >
      Submit
    </button>
  );
};

export default SubmitButton;