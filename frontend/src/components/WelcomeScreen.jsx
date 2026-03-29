import { useState } from "react";

export default function WelcomeScreen({ onStart, loading, error }) {
  const [name, setName] = useState("");

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onStart(trimmed);
  }

  return (
    <div className="card">
      <span className="tag">CS515 · Quiz App</span>

      <h1 className="title">
        Quiz<span>Byte</span>
      </h1>

      <p className="subtitle">
        10 questions. Multiple choice. Prove your knowledge across Computer Science,
        Networking, DevOps, and more.
      </p>

      <div className="input-group">
        <label className="input-label" htmlFor="player-name">
          Your name
        </label>
        <input
          id="player-name"
          className="input"
          type="text"
          placeholder="e.g. Jonny"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          maxLength={30}
          autoFocus
        />
      </div>

      {error && <div className="error-box">{error}</div>}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={!name.trim() || loading}
      >
        {loading ? "Loading Questions..." : "Start Quiz →"}
      </button>
    </div>
  );
}
