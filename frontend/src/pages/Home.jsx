import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUserGraduate,
  FaCalculator,
  FaChartLine,
  FaBrain,
} from "react-icons/fa";

import RobotLogo from "../components/common/RobotLogo";

function FlipCard({
  id,
  icon,
  title,
  description,
  details,
  flippedCard,
  setFlippedCard,
  onNavigate,
}) {
  const flipped = flippedCard === id;

  return (
    <div
      onClick={() =>
        setFlippedCard(flipped ? null : id)
      }
      className="
        cursor-pointer
        h-56
        perspective-[1200px]
      "
    >
      <div
        className={`
          relative
          h-full
          w-full
          transition-all
          duration-[1200ms]
          ease-[cubic-bezier(.22,1,.36,1)]
          [transform-style:preserve-3d]
          ${flipped ? "[transform:rotateY(180deg)]" : ""}
        `}
      >
        {/* FRONT */}

        <div
          className="
            absolute
            inset-0
            rounded-[28px]
            overflow-hidden
            bg-white/[0.05]
            backdrop-blur-2xl
            border
            border-white/10
            [backface-visibility:hidden]
          "
        >
          <div className="h-full p-5 flex flex-col justify-between">
            <div className="text-4xl text-indigo-400">
              {icon}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {title}
              </h3>

              <p className="text-slate-400 mt-2 text-sm">
                {description}
              </p>

              <p className="mt-4 text-xs text-indigo-300">
                Click to explore →
              </p>
            </div>
          </div>
        </div>

        {/* BACK */}

        <div
          onClick={(e) => {
            e.stopPropagation();

            if (onNavigate) {
              onNavigate();
            }
          }}
          className="
            absolute
            inset-0
            rounded-[28px]
            overflow-hidden
            bg-gradient-to-br
            from-indigo-900/70
            via-purple-900/60
            to-slate-900/90
            backdrop-blur-2xl
            border
            border-indigo-500/20
            [transform:rotateY(180deg)]
            [backface-visibility:hidden]
          "
        >
          <div className="h-full p-5 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-3">
              {title}
            </h3>

            <p className="text-slate-200 text-sm leading-relaxed">
              {details}
            </p>

            <div className="mt-5">
              <span
                className="
                  px-3
                  py-2
                  rounded-xl
                  bg-indigo-500/20
                  text-indigo-200
                  text-xs
                "
              >
                Open Module →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const today = new Date();

  const [flippedCard, setFlippedCard] =
    useState(null);

  const fullName =
  localStorage.getItem("full_name");

const profileCompleted =
  localStorage.getItem(
    "profile_completed"
  ) === "true";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* HERO */}

      <div
        className="
          relative
          rounded-[32px]
          overflow-hidden
          bg-white/[0.05]
          backdrop-blur-3xl
          border
          border-white/10
          p-8
        "
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />

        <div
          className="
            relative
            flex
            flex-col
            lg:flex-row
            items-center
            justify-between
            gap-8
          "
        >
          {/* LEFT */}

          <div className="flex-1">
            <p className="text-indigo-300 uppercase tracking-wider text-sm">
              EduPredict AI
            </p>

            <h1 className="text-4xl md:text-5xl font-black text-white mt-3">
  Welcome Back, {fullName || "Student"} 
</h1>

            <p className="text-indigo-300 mt-2">
              {fullName}
            </p>

            <p className="text-slate-300 mt-4 max-w-xl">
              Predict Performance.
              Master Concepts.
              Achieve More.
            </p>

            <p className="text-slate-500 mt-4">
              {today.toLocaleDateString()}
            </p>
          </div>

          {/* RIGHT */}

          <div className="w-[220px] h-[220px] flex items-center justify-center">
            <RobotLogo />
          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {profileCompleted
  ? [
      ["Profile", "✓ " ],
      [" Analytics", "Ready "],
      [" Quiz Arena", "Ready "],
      [" AI Tutor", "Ready "],
    ]
  : [
      [" Profile", "Pending "],
      [" Analytics", "Locked "],
      [" Quiz Arena", "Ready "],
      [" AI Tutor", "Ready "],
    ].map(([title, value]) => (
          <div
            key={title}
            className="
              rounded-3xl
              p-5
              bg-white/[0.04]
              backdrop-blur-xl
              border
              border-white/10
            "
          >
            <p className="text-slate-400 text-sm">
              {title}
            </p>

            <h3 className="text-3xl font-bold text-white mt-2">
              {value}
            </h3>
          </div>
        ))}
      </div>

      {/* AI INSIGHT */}

      <div
        className="
          rounded-[28px]
          p-6
          bg-white/[0.05]
          backdrop-blur-2xl
          border
          border-indigo-500/20
        "
      >
        <div className="flex items-center gap-3">
          <FaBrain className="text-2xl text-indigo-400" />

          <h2 className="text-2xl font-bold text-white">
            AI Insight
          </h2>
        </div>

        <p className="text-slate-300 mt-4 leading-relaxed">
  {profileCompleted
    ? "Your academic profile has been configured successfully. You can now access analytics, quizzes, and AI-powered learning tools."
    : "Complete your academic profile to unlock GPA prediction, risk analysis, and personalized recommendations."}
</p>
      </div>

      {/* MODULES */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <FlipCard
          id="profile"
          icon={<FaUserGraduate />}
          title="Profile"
          description="Manage academic profile."
          details="Store study habits, attendance and demographic information."
          flippedCard={flippedCard}
          setFlippedCard={setFlippedCard}
          onNavigate={() => navigate("/dashboard")}
        />

        <FlipCard
          id="sgpa"
          icon={<FaCalculator />}
          title="SGPA"
          description="Track semester grades."
          details="Calculate SGPA instantly using credits and grades."
          flippedCard={flippedCard}
          setFlippedCard={setFlippedCard}
          onNavigate={() =>
            navigate("/sgpa-calculator")
          }
        />

        <FlipCard
          id="analytics"
          icon={<FaChartLine />}
          title="Analytics"
          description="Explore performance trends."
          details="Visualize predictions and AI-powered recommendations."
          flippedCard={flippedCard}
          setFlippedCard={setFlippedCard}
          onNavigate={() => navigate("/analytics")}
        />

        <FlipCard
          id="tutor"
          icon={<FaBrain />}
          title="AI Tutor"
          description="Adaptive learning assistant."
          details="Ask questions, generate quizzes and get explanations."
          flippedCard={flippedCard}
          setFlippedCard={setFlippedCard}
          onNavigate={() => navigate("/tutor")}
        />
      </div>
    </div>
  );
}