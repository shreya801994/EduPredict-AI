import { Trophy, Brain, Target } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { quizAnalyticsService } from "../api/quizAnalyticsService";

export default function QuizArena() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [selectedFile, setSelectedFile] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
  loadAnalytics();
}, []);

const loadAnalytics = async () => {
  try {
    const studentId =
      localStorage.getItem("user_id");

    const analyticsData =
      await quizAnalyticsService.getAnalytics(
        studentId
      );

    const topicData =
      await quizAnalyticsService.getTopics(
        studentId
      );

    setAnalytics(analyticsData);

    setTopics(
      topicData.topic_mastery || []
    );
  } catch (err) {
    console.error(err);
  }
};

  const navigate = useNavigate();

  const handleGenerateQuiz = async () => {
  try {
    if (!selectedFile) {
      alert("Please upload a PDF first.");
      return;
    }

    setLoading(true);

    const token =
      localStorage.getItem("token");

    const formData = new FormData();

    const studentId =
        localStorage.getItem("user_id");

        formData.append(
        "student_id",
        studentId
    );

    formData.append(
      "title",
      selectedFile.name
    );

    formData.append(
      "file",
      selectedFile
    );

    // Upload PDF

    const uploadResponse =
      await fetch(
        "http://127.0.0.1:8000/api/v1/materials/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

    const uploadedMaterial =
      await uploadResponse.json();

      console.log("Material Upload:", uploadedMaterial);

    // Generate Quiz

    const quizResponse =
      await fetch(
        "http://127.0.0.1:8000/api/v1/quizzes/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            material_id:
              uploadedMaterial.id,
            num_questions:
              questionCount,
            target_difficulty:
              difficulty,
          }),
        }
      );

    const quizData =
      await quizResponse.json();

      console.log("Quiz Response:", quizData);

    navigate(
      `/quiz/${quizData.quiz_id}`
    );
  } catch (error) {
    console.error(error);

    alert(
      "Failed to generate quiz."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HERO */}

      <div
        className={`
          rounded-[32px]
          backdrop-blur-3xl
          border
          p-8
          ${
            darkMode
              ? "bg-white/[0.05] border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }
        `}
      >
        <h1
          className={`text-4xl font-black ${
            darkMode
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Quiz Arena
        </h1>

        <p
          className={`mt-3 ${
            darkMode
              ? "text-slate-400"
              : "text-slate-600"
          }`}
        >
          Generate quizzes, track attempts, analyze mistakes,
          and improve weak concepts.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* TOTAL QUIZZES */}

        <div
          className={`
            rounded-3xl
            border
            p-6
            ${
              darkMode
                ? "bg-white/[0.05] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }
          `}
        >
          <Trophy className="text-indigo-500 mb-3" />

          <p
            className={`text-sm ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Total Quizzes
          </p>

          <h2
            className={`text-3xl font-bold mt-2 ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
  {analytics?.total_attempts || 0}
          </h2>
        </div>

        {/* AVG SCORE */}

        <div
          className={`
            rounded-3xl
            border
            p-6
            ${
              darkMode
                ? "bg-white/[0.05] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }
          `}
        >
          <Brain className="text-indigo-500 mb-3" />

          <p
            className={`text-sm ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Average Score
          </p>

          <h2
            className={`text-3xl font-bold mt-2 ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            
  {analytics?.average_score || 0}%
          </h2>
        </div>

        {/* WEAK TOPICS */}

        <div
          className={`
            rounded-3xl
            border
            p-6
            ${
              darkMode
                ? "bg-white/[0.05] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }
          `}
        >
          <Target className="text-indigo-500 mb-3" />

          <p
            className={`text-sm ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Weak Topics
          </p>

          <h2
            className={`text-3xl font-bold mt-2 ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
  {
    topics.filter(topic => topic.mastery_percentage < 90).length
  }
          </h2>
        </div>

      </div>

      {/* QUIZ INSIGHTS */}

<div className="grid lg:grid-cols-2 gap-6">

  {/* RECENT ATTEMPTS */}

  <div
    className={`
      rounded-[28px]
      border
      p-6
      ${
        darkMode
          ? "bg-white/[0.05] border-white/10"
          : "bg-white border-slate-200 shadow-sm"
      }
    `}
  >
    <h2
      className={`text-2xl font-bold mb-5 ${
        darkMode ? "text-white" : "text-slate-900"
      }`}
    >
      Recent Attempts
    </h2>

    <div className="space-y-3">

      {[
        {
          quiz: "DBMS Quiz",
          score: "8/10",
          date: "Today",
        },
        {
          quiz: "OS Quiz",
          score: "6/10",
          date: "Yesterday",
        },
        {
          quiz: "CN Quiz",
          score: "9/10",
          date: "2 Days Ago",
        },
      ].map((item, index) => (
        <div
          key={index}
          className={`
            flex
            justify-between
            items-center
            p-4
            rounded-xl
            ${
              darkMode
                ? "bg-slate-900/40"
                : "bg-slate-50"
            }
          `}
        >
          <div>
            <p
              className={
                darkMode
                  ? "text-white"
                  : "text-slate-900"
              }
            >
              {item.quiz}
            </p>

            <p className="text-sm text-slate-500">
              {item.date}
            </p>
          </div>

          <span className="font-bold text-indigo-500">
            {item.score}
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* WEAK TOPICS */}

  <div
    className={`
      rounded-[28px]
      border
      p-6
      ${
        darkMode
          ? "bg-white/[0.05] border-white/10"
          : "bg-white border-slate-200 shadow-sm"
      }
    `}
  >
    <h2
      className={`text-2xl font-bold mb-5 ${
        darkMode ? "text-white" : "text-slate-900"
      }`}
    >
      Weak Topics
    </h2>

    <div className="space-y-3">

      {
  topics
    .filter(
      topic =>
        topic.mastery_percentage < 90
    )
    .map((topic) => (
      <div
        key={topic.topic}
        className={`
          px-4
          py-3
          rounded-xl
          ${
            darkMode
              ? "bg-slate-900/40"
              : "bg-slate-50"
          }
        `}
      >
        <span
          className={
            darkMode
              ? "text-slate-200"
              : "text-slate-800"
          }
        >
          {topic.topic}
        </span>
      </div>
    ))
}
    </div>
  </div>

</div>

{/* AI RECOMMENDATIONS */}

<div
  className={`
    rounded-[28px]
    border
    p-6
    ${
      darkMode
        ? "bg-white/[0.05] border-white/10"
        : "bg-white border-slate-200 shadow-sm"
    }
  `}
>
  <h2
    className={`text-2xl font-bold mb-5 ${
      darkMode ? "text-white" : "text-slate-900"
    }`}
  >
    AI Recommendations
  </h2>

  <div className="space-y-3">

    {
  topics
    .filter(
      topic =>
        topic.mastery_percentage < 90
    )
    .map((topic) => (
      <div
        key={topic.topic}
        className={`
          px-4
          py-3
          rounded-xl
          ${
            darkMode
              ? "bg-slate-900/40"
              : "bg-slate-50"
          }
        `}
      >
        <span
          className={
            darkMode
              ? "text-slate-200"
              : "text-slate-800"
          }
        >
        Revise  {topic.topic}
        </span>
      </div>
    ))
}
  </div>
</div>

<div
  className={`
    rounded-[28px]
    border
    p-6
    ${
      darkMode
        ? "bg-white/[0.05] border-white/10"
        : "bg-white border-slate-200 shadow-sm"
    }
  `}
>
  <h2
    className={`text-2xl font-bold mb-5 ${
      darkMode ? "text-white-600/10" : "text-slate-900"
    }`}
  >
    Generate Quiz From PDF
  </h2>

  <div className="space-y-4">

    {/* FILE PICKER */}

    <input
      type="file"
      accept=".pdf"
      onChange={(e) =>
        setSelectedFile(e.target.files[0])
      }
      className={`
        w-full
        rounded-xl
        border
        p-3
        ${
          darkMode
            ? "bg-slate-900/50 border-slate-700 text-white"
            : "bg-slate-50 border-slate-300 text-slate-900"
        }
      `}
    />

    {selectedFile && (
      <p className="text-indigo-500 text-sm">
        Selected: {selectedFile.name}
      </p>
    )}

    {/* DIFFICULTY */}

    <select
      value={difficulty}
      onChange={(e) =>
        setDifficulty(e.target.value)
      }
      className={`
        w-full
        rounded-xl
        border
        p-3
        ${
          darkMode
            ? "bg-slate-900/50 border-slate-700 text-white"
            : "bg-slate-50 border-slate-300 text-slate-900"
        }
      `}
    >
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>

    {/* QUESTION COUNT */}

    <select
      value={questionCount}
      onChange={(e) =>
        setQuestionCount(Number(e.target.value))
      }
      className={`
        w-full
        rounded-xl
        border
        p-3
        ${
          darkMode
            ? "bg-slate-900/50 border-slate-700 text-white"
            : "bg-slate-50 border-slate-300 text-slate-900"
        }
      `}
    >
      <option value={5}>5 Questions</option>
      <option value={10}>10 Questions</option>
      <option value={15}>15 Questions</option>
      <option value={20}>20 Questions</option>
    </select>

    <button
      onClick={handleGenerateQuiz}
      disabled={loading}
      className="
        w-full
        py-3
        rounded-xl
        bg-gradient-to-r
        from-indigo-500
        to-purple-600
        text-white
        font-semibold
      "
    >
      {loading
        ? "Generating..."
        : "Generate Quiz"}
    </button>

  </div>
</div>

    </div>
  );
}