import { useState } from "react";

const LETTERS = ["A", "B", "C", "D"];

export default function QuizScreen({ questions, playerName, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const question = questions[current];
  const progress = ((current) / questions.length) * 100;
  const isAnswered = selected !== null;
  const isLast = current === questions.length - 1;

  function handleSelect(index) {
    if (isAnswered) return;
    setSelected(index);
    if (index === question.correct_answer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (isLast) {
      const finalScore = selected === question.correct_answer ? score : score;
      onComplete(finalScore);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  function getOptionClass(index) {
    if (!isAnswered) return "";
    if (index === question.correct_answer) return "correct";
    if (index === selected) return "wrong";
    return "";
  }

  return (
    <div className="card" key={current}>
      {/* Progress */}
      <div className="quiz-meta">
        <span className="quiz-counter mono">
          {String(current + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
        </span>
        {question.category && (
          <span className="category-badge">{question.category}</span>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <p className="question-text">{question.question}</p>

      {/* Options */}
      <div className="options-grid">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${getOptionClass(i)}`}
            onClick={() => handleSelect(i)}
            disabled={isAnswered}
          >
            <span className="option-letter">{LETTERS[i]}</span>
            {opt}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <>
          <div
            className={`feedback ${
              selected === question.correct_answer ? "correct-fb" : "wrong-fb"
            }`}
          >
            {selected === question.correct_answer
              ? "✓ Correct!"
              : `✗ Correct answer: ${LETTERS[question.correct_answer]} — ${question.options[question.correct_answer]}`}
          </div>

          <div className="next-btn-wrap">
            <button className="btn-primary" style={{ width: "auto", padding: "0.75rem 2rem" }} onClick={handleNext}>
              {isLast ? "See Results →" : "Next Question →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
