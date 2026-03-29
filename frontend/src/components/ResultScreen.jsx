import { useState, useEffect } from "react";

function getResultMessage(score, total) {
  const pct = score / total;
  if (pct === 1) return { msg: "Perfect Score! 🏆", sub: "Absolutely flawless. You know your stuff." };
  if (pct >= 0.8) return { msg: "Excellent! 🎯", sub: "Strong performance. Near the top." };
  if (pct >= 0.6) return { msg: "Good Job! 👍", sub: "Solid effort. Keep learning!" };
  if (pct >= 0.4) return { msg: "Not Bad 🤔", sub: "Some gaps to fill. Try again!" };
  return { msg: "Keep Practicing 💪", sub: "Review the material and give it another shot." };
}

export default function ResultScreen({ playerName, score, total, onRestart, apiBase }) {
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);

  const { msg, sub } = getResultMessage(score, total);

  useEffect(() => {
    fetch(`${apiBase}/scores`)
      .then((r) => r.json())
      .then((data) => setScores(data))
      .catch(() => {})
      .finally(() => setLoadingScores(false));
  }, [apiBase]);

  return (
    <div className="card">
      <span className="tag">Quiz Complete</span>

      <div className="score-ring">
        <div className="score-circle">
          <span className="score-number">{score}</span>
          <span className="score-label">/ {total}</span>
        </div>
        <p className="result-message">{msg}</p>
        <p className="result-sub">
          {playerName}, you scored {score} out of {total} — {Math.round((score / total) * 100)}%
        </p>
      </div>

      <p className="result-sub" style={{ textAlign: "center" }}>{sub}</p>

      {/* Leaderboard */}
      <p className="section-title">Top Scores</p>

      {loadingScores ? (
        <div className="loading" style={{ padding: "1.5rem" }}>
          <div className="spinner" />
        </div>
      ) : scores.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "1rem" }}>
          No scores yet.
        </p>
      ) : (
        <table className="scores-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Score</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={i}>
                <td className="rank">#{i + 1}</td>
                <td>{s.player_name}</td>
                <td className="mono">{s.score}/{s.total}</td>
                <td className="mono">{Math.round((s.score / s.total) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="result-actions">
        <button className="btn-primary" onClick={onRestart}>
          Play Again →
        </button>
        <button
          className="btn-ghost"
          onClick={() => window.open("https://github.com", "_blank")}
        >
          GitHub
        </button>
      </div>
    </div>
  );
}
