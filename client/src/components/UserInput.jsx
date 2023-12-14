// UserInput.jsx
import React, { useState } from "react";

function UserInput({ label, placeholder, onSubmit }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    setInput(document.getElementById("input").value);
    onSubmit(input);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div id="message-input">
      <h3>{label || ''}</h3>
      <div id="text-input">
      <input
        id="input"
        type="text"
        placeholder={placeholder || "Type here..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button id="send-button" onClick={handleSubmit}>
        Send
      </button>
      </div>
    </div>
  );
}

export default UserInput;
