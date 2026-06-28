import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/quizzes/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("QUIZ DATA:", data);

      setQuiz(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
  try {
    const payload = {
      quiz_id: quiz.id,
      student_id: Number(
        localStorage.getItem("user_id")
      ),
      answers: quiz.questions.map((question) => {
        if (question.question_type === "MCQ") {
          return {
            question_id: question.id,
            selected_option:
              answers[question.id] || null,
          };
        }

        return {
          question_id: question.id,
          provided_text:
            answers[question.id] || "",
        };
      }),
    };

    console.log(
      "Submitting payload:",
      payload
    );

    const token =
      localStorage.getItem("token");

    const response = await fetch(
        `${API_BASE_URL}/attempts/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data =
      await response.json();

    console.log(
      "Response status:",
      response.status
    );

    console.log(
      "Response data:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.detail ||
          "Quiz submission failed."
      );
    }

    navigate(
      `/quiz-results/${data.attempt_id}`,
      {
        state: data
      }
    );

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  if (loading) {
    return (
      <div className="p-8">
        Loading Quiz...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="p-8">
        Loading questions...
      </div>
    );
  }

  const currentQuestion =
    quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* HEADER */}

      <div
        className="
          rounded-[32px]
          bg-white
          dark:bg-slate-900
          border
          border-slate-200
          dark:border-slate-800
          p-8
          shadow-sm
        "
      >
        <h1
          className="
            text-3xl
            font-black
            text-slate-900
            dark:text-white
          "
        >
          {quiz.title}
        </h1>

        <p
          className="
            mt-2
            text-slate-500
            dark:text-slate-400
          "
        >
          {quiz.questions.length} Questions
        </p>
      </div>

      {/* MAIN GRID */}

      <div
        className="
          grid
          lg:grid-cols-[1fr_260px]
          gap-6
        "
      >

        {/* QUESTION AREA */}

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

          <p
            className="
              text-indigo-600
              dark:text-indigo-400
              font-semibold
            "
          >
            Question {currentQuestionIndex + 1}
          </p>

          <h2
            className="
              mt-4
              text-xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            {currentQuestion.question_text}
          </h2>

          {/* MCQ */}

          {currentQuestion.question_type ===
            "MCQ" && (
            <div className="mt-8 space-y-4">
              {currentQuestion.options.map(
                (option, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [currentQuestion.id]:
                          String.fromCharCode(65 + index),
                      })
                    }
                    className={`
                      w-full
                      text-left
                      p-4
                      rounded-2xl
                      border
                      transition-all

                      ${
                        answers[currentQuestion.id] ===
                          String.fromCharCode(65 + index)
                          ? `
                            border-indigo-500
                            bg-indigo-50
                            dark:bg-indigo-500/10
                          `
                          : `
                            border-slate-200
                            dark:border-slate-700
                            hover:border-indigo-400
                          `
                      }
                    `}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          )}

          {/* SHORT ANSWER */}

          {currentQuestion.question_type ===
            "SHORT_ANSWER" && (
            <textarea
              value={
                answers[
                  currentQuestion.id
                ] || ""
              }
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [currentQuestion.id]:
                    e.target.value,
                })
              }
              placeholder="Type your answer..."
              className="
                mt-8
                w-full
                min-h-[140px]
                rounded-2xl
                border
                border-slate-300
                dark:border-slate-700
                bg-transparent
                p-4
                outline-none
              "
            />
          )}

          {/* LONG ANSWER */}

          {currentQuestion.question_type ===
            "LONG_ANSWER" && (
            <textarea
              value={
                answers[
                  currentQuestion.id
                ] || ""
              }
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [currentQuestion.id]:
                    e.target.value,
                })
              }
              placeholder="Write a detailed answer..."
              className="
                mt-8
                w-full
                min-h-[220px]
                rounded-2xl
                border
                border-slate-300
                dark:border-slate-700
                bg-transparent
                p-4
                outline-none
              "
            />
          )}

          {/* NAVIGATION */}

          <div className="mt-8 flex justify-between">

            <button
              disabled={
                currentQuestionIndex === 0
              }
              onClick={() =>
                setCurrentQuestionIndex(
                  currentQuestionIndex - 1
                )
              }
              className="
                px-6
                py-3
                rounded-xl
                bg-slate-200
                dark:bg-slate-800
                disabled:opacity-40
              "
            >
              Previous
            </button>

            {currentQuestionIndex ===
            quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="
                  px-6
                  py-3
                  rounded-xl
                  bg-emerald-600
                  text-white
                "
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestionIndex(
                    currentQuestionIndex + 1
                  )
                }
                className="
                  px-6
                  py-3
                  rounded-xl
                  bg-indigo-600
                  text-white
                "
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* QUESTION PALETTE */}

        <div
          className="
            rounded-[32px]
            bg-white
            dark:bg-slate-900
            border
            border-slate-200
            dark:border-slate-800
            p-6
            h-fit
          "
        >
          <h3
            className="
              font-bold
              text-slate-900
              dark:text-white
              mb-4
            "
          >
            Questions
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {quiz.questions.map(
              (question, index) => {
                const answered =
                  answers[question.id];

                const current =
                  index ===
                  currentQuestionIndex;

                return (
                  <button
                    key={question.id}
                    onClick={() =>
                      setCurrentQuestionIndex(
                        index
                      )
                    }
                    className={`
                      w-12
                      h-12
                      rounded-full
                      font-semibold

                      ${
                        current
                          ? `
                            bg-indigo-600
                            text-white
                          `
                          : answered
                          ? `
                            bg-emerald-500
                            text-white
                          `
                          : `
                            bg-slate-200
                            dark:bg-slate-800
                          `
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}