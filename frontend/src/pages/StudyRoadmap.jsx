import React, { useEffect, useState } from "react";
import { quizAnalyticsService } from "../api/quizAnalyticsService";
import {
  BrainCircuit,
  Target,
  TrendingUp,
  Trophy
} from "lucide-react";

export default function StudyRoadmap() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const studentId = localStorage.getItem("user_id");

      const data =
        await quizAnalyticsService.getTopics(studentId);

      setTopics(data.topic_mastery || []);
    } catch (err) {
      console.error(err);
    }
  };

  const weakTopics = topics
  .filter(topic => topic.mastery_percentage < 90)
  .sort(
    (a, b) =>
      a.mastery_percentage -
      b.mastery_percentage
  )
  .slice(0, 3);

  const strongestTopic =
  topics.length > 0
    ? topics.reduce((best, current) =>
        current.mastery_percentage > best.mastery_percentage
          ? current
          : best
      )
    : null;
  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* HERO */}

      <div
        className="
          rounded-[32px]
          p-8
          mb-8
          bg-gradient-to-r
          from-indigo-600
          via-purple-600
          to-fuchsia-600
          text-white
          shadow-xl
        "
      >
        <div className="flex items-center gap-4">

          <BrainCircuit size={42} />

          <div>
            <h1 className="text-4xl font-black">
              AI Study Roadmap
            </h1>

            <p className="mt-2 text-indigo-100">
              Personalized learning path generated
              from your quiz performance.
            </p>
          </div>

        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid md:grid-cols-3 gap-5 mb-8">

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-slate-900
            p-6
          "
        >
          <Target
            className="text-indigo-500 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Topics To Improve
          </p>

          <h2
            className="
              text-3xl
              font-black
              text-slate-900
              dark:text-white
            "
          >
            {
topics.filter(
topic => topic.mastery_percentage < 90
).length
}
          </h2>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-slate-900
            p-6
          "
        >
          <TrendingUp
            className="text-emerald-500 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Strongest Score
          </p>

          <h2
  className="
    text-3xl
    font-black
    text-slate-900
    dark:text-white
  "
>
  {strongestTopic
    ? `${strongestTopic.mastery_percentage}%`
    : "0%"}
</h2>

<p className="mt-2 text-sm text-slate-500">
  {strongestTopic
    ? strongestTopic.topic
    : "No topics yet"}
</p>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-slate-900
            p-6
          "
        >
          <Trophy
            className="text-yellow-500 mb-3"
            size={28}
          />

          <p className="text-slate-500 text-sm">
            Learning Status
          </p>

          <h2
  className="
    text-3xl
    font-black
    text-slate-900
    dark:text-white
  "
>
  {topics.length === 0
    ? "No Data"
    : topics.every(
        topic => topic.mastery_percentage >= 90
      )
    ? "Expert"
    : topics.some(
        topic => topic.mastery_percentage < 60
      )
    ? "Needs Work"
    : "Advanced"}
</h2>
        </div>

      </div>

      {/* ROADMAP */}

      <div className="space-y-6">

        {weakTopics.length === 0 ? (

    <div
      className="
        rounded-[32px]
        border
        border-emerald-300
        dark:border-emerald-700
        bg-emerald-50
        dark:bg-emerald-950/30
        p-8
        text-center
      "
    >
      <h2 className="text-3xl font-black text-emerald-600">
        Great Job!
      </h2>

      <p className="mt-4 text-slate-600 dark:text-slate-300">
        All tracked topics have reached at least 90% mastery.
        Continue practicing to maintain your performance.
      </p>
    </div>

  ) : (

        weakTopics.map((topic, index) => (

          <div
            key={topic.topic}
            className="
              relative
              rounded-[32px]
              border
              border-slate-200
              dark:border-slate-700
              bg-white
              dark:bg-slate-900
              p-8
              shadow-sm
              hover:shadow-xl
              transition-all
            "
          >

            <div
              className="
                absolute
                top-6
                right-6
                h-12
                w-12
                rounded-full
                bg-indigo-600
                text-white
                flex
                items-center
                justify-center
                font-black
              "
            >
              {index + 1}
            </div>

            <p
              className="
                text-sm
                font-bold
                text-indigo-500
              "
            >
              STEP {index + 1}
            </p>

            <h2
              className="
                text-3xl
                font-black
                mt-3
                text-slate-900
                dark:text-white
              "
            >
              {topic.topic}
            </h2>

            <p
              className="
                mt-4
                text-slate-500
                dark:text-slate-400
              "
            >
              Current Mastery:
              {" "}
              {topic.mastery_percentage}%
            </p>

            <div className="mt-6">

              <div
                className="
                  w-full
                  h-4
                  rounded-full
                  bg-slate-200
                  dark:bg-slate-700
                  overflow-hidden
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-indigo-500
                    to-purple-500
                    transition-all
                    duration-1000
                  "
                  style={{
                    width: `${topic.mastery_percentage}%`
                  }}
                />
              </div>

            </div>

            <div
              className="
                mt-6
                rounded-2xl
                bg-indigo-50
                dark:bg-indigo-950/30
                p-4
              "
            >
              <p
                className="
                  text-sm
                  text-slate-700
                  dark:text-slate-300
                "
              >
                Recommendation:
{" "}

{topic.mastery_percentage < 50 &&
"Start from the basics and review your notes before attempting another quiz."}

{topic.mastery_percentage >= 50 &&
topic.mastery_percentage < 75 &&
"Practice 2-3 more quizzes and revise important concepts."}

{topic.mastery_percentage >= 75 &&
topic.mastery_percentage < 90 &&
"Almost there. One more revision and quiz should push this topic into mastery."}

{topic.mastery_percentage >= 90 &&
"Excellent! Maintain your understanding with occasional practice."}
</p>
            </div>

          </div>
    ))
      )}

      </div>

    </div>
  );
}