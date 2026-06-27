import React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

export default function QuizResults() {
  const location = useLocation();

  const result = location.state;

  if (!result) {
    return (
      <div className="p-10 text-center">
        No result data found.
      </div>
    );
  }

  const correctAnswers =
    result.answers.filter(
      (answer) => answer.is_correct
    ).length;

  const incorrectAnswers =
    result.answers.length -
    correctAnswers;

  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* HERO */}

      <div
        className="
          rounded-[32px]
          bg-white
          dark:bg-slate-900
          border
          border-slate-200
          dark:border-slate-800
          p-8
        "
      >
        <h1
          className="
            text-4xl
            font-black
            text-slate-900
            dark:text-white
          "
        >
          Quiz Completed...
        </h1>

        <p
          className="
            mt-4
            text-5xl
            font-black
            text-indigo-600
          "
        >
          {result.score.toFixed(2)}%
        </p>

        <p
          className="
            mt-2
            text-slate-500
            dark:text-slate-400
          "
        >
          Final Score
        </p>
      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-6">

        <div
          className="
            rounded-[24px]
            p-6
            border
            bg-white
            dark:bg-slate-900
            dark:border-slate-800
          "
        >
          <p className="text-slate-500">
            Correct
          </p>

          <h2 className="text-3xl font-bold text-emerald-600">
            {correctAnswers}
          </h2>
        </div>

        <div
          className="
            rounded-[24px]
            p-6
            border
            bg-white
            dark:bg-slate-900
            dark:border-slate-800
          "
        >
          <p className="text-slate-500">
            Incorrect
          </p>

          <h2 className="text-3xl font-bold text-red-500">
            {incorrectAnswers}
          </h2>
        </div>

        <div
          className="
            rounded-[24px]
            p-6
            border
            bg-white
            dark:bg-slate-900
            dark:border-slate-800
          "
        >
          <p className="text-slate-500">
            Questions
          </p>

          <h2 className="text-3xl font-bold">
            {result.answers.length}
          </h2>
        </div>

      </div>

      {/* REVIEW */}

      <div
        className="
          rounded-[32px]
          bg-white
          dark:bg-slate-900
          border
          border-slate-200
          dark:border-slate-800
          p-8
        "
      >
        <h2 className="text-2xl font-bold mb-6">
          Answer Review
        </h2>

        <div className="space-y-6">

          {result.answers.map(
            (answer, index) => (
              <div
                key={answer.id}
                className="
                  border
                  border-slate-200
                  dark:border-slate-700
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold">
                    Question {index + 1}
                  </h3>

                  <span
                    className={
                      answer.is_correct
                        ? "text-emerald-600"
                        : "text-red-500"
                    }
                  >
                    {answer.is_correct
                      ? "Correct"
                      : "Incorrect"}
                  </span>
                </div>

                <p
                  className="
                    mt-3
                    text-slate-600
                    dark:text-slate-400
                  "
                >
                  {answer.ai_feedback}
                </p>

              </div>
            )
          )}

        </div>
      </div>
      <div className="mt-10 flex gap-4">

  <button
    onClick={() => navigate("/quizzes")}
    className="
      px-6
      py-3
      rounded-xl
      border
      border-slate-300
      dark:border-slate-700
    "
  >
    Back to Quiz Arena
  </button>

  <button
    onClick={() => navigate("/quiz-analytics")}
    className="
      px-6
      py-3
      rounded-xl
      bg-indigo-600
      text-white
      font-semibold
      hover:bg-indigo-500
    "
  >
    View Analytics
  </button>

</div>
    </div>
  );
}