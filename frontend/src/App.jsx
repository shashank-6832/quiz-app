import { useState } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | quiz | result
  const [playerName, setPlayerName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart(name) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/questions`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.slice(0, 10));
      setPlayerName(name);
      setScreen("quiz");
    } catch (err) {
      setError("Could not connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuizComplete(score) {
    try {
      await fetch(`${API_BASE}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: playerName, score, total: questions.length }),
      });
    } catch {
      // Score save failing shouldn't block the result screen
    }
    setFinalScore(score);
    setScreen("result");
  }

  function handleRestart() {
    setScreen("welcome");
    setQuestions([]);
    setFinalScore(null);
    setPlayerName("");
  }

  return (
    <>
      <div className="scanlines" />
      {screen === "welcome" && (
        <WelcomeScreen
          onStart={handleStart}
          loading={loading}
          error={error}
        />
      )}
      {screen === "quiz" && (
        <QuizScreen
          questions={questions}
          playerName={playerName}
          onComplete={handleQuizComplete}
        />
      )}
      {screen === "result" && (
        <ResultScreen
          playerName={playerName}
          score={finalScore}
          total={questions.length}
          onRestart={handleRestart}
          apiBase={API_BASE}
        />
      )}
    </>
  );
}
