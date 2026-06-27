import React, { useEffect, useState } from "react";
import { quizAnalyticsService } from "../api/quizAnalyticsService";
import { Award,Brain,TrendingUp,ShieldCheck,BrainCircuit} from "lucide-react";
import {Link} from "react-router-dom";

export default function QuizAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const[topics, setTopics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const studentId = localStorage.getItem("user_id");

      const [analyticsData, topicData] =
        await Promise.all([
            quizAnalyticsService.getAnalytics(studentId),
            quizAnalyticsService.getTopics(studentId),
        ]);

        console.log("Analytics:", analyticsData);
        console.log("Topic Mastery:", topicData.topic_mastery);

        setAnalytics(analyticsData);
        setTopics(topicData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">

<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"/>

</div>
    );
  }

  if (!analytics) {
  return (
    <div className="p-8">
      No quiz attempts found.

Generate your first quiz to unlock analytics.
    </div>
  );
}
    const achievements = [];

if (analytics?.average_score >= 90) {
  achievements.push({
    title: "Above 90% Club",
    icon: Award,
  });
}

if (analytics?.total_attempts >= 1) {
  achievements.push({
    title: "Quiz Finisher",
    icon: ShieldCheck,
  });
}

if (
  analytics?.best_score - analytics?.worst_score <= 5
) {
  achievements.push({
    title: "Consistent Performer",
    icon: TrendingUp,
  });
}

if (analytics?.average_score >= 95) {
  achievements.push({
    title: "High Accuracy Learner",
    icon: Brain,
  });
}

    const topicMastery = topics?.topic_mastery || [];

    const weakestTopic =
        topicMastery.length > 0
            ? [...topicMastery].sort(
                (a, b) =>
                a.mastery_percentage -
                b.mastery_percentage
            )[0]
            : null;

    const learnerTitle =
  analytics.average_score >= 90
    ? "High Accuracy Learner"
    : analytics.average_score >= 75
    ? "Steady Learner"
    : "Learning Explorer";

const learnerRank =
  analytics.average_score >= 90
    ? "Grandmaster Rank"
    : analytics.average_score >= 75
    ? "Advanced"
    : "Beginner";

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-4xl font-black mb-8">
        Quiz Analytics
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <div
            className="
            rounded-[32px]
            p-8
            bg-gradient-to-r
            from-indigo-600
            to-purple-600
            text-slate-900 dark:text-white
            "
        >
            <p className="text-sm opacity-80">
            Learning DNA Profile
            </p>

            <h2 className="text-3xl font-black mt-3">{learnerTitle}</h2>
            <div
                className="
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-white/20
                    px-4
                    py-2
                "
                >
                <Award size={16} />
                {learnerRank}
                </div>

            <p className="mt-4 text-indigo-100">
            Your average score is {analytics.average_score}%.
            </p>
        </div>

        <div
            className="
            rounded-[32px]
            border
            p-8
            "
        >
            <h3 className="font-bold mb-3">
            AI Insight
            </h3>

            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
  You have attempted{" "}
  <span className="font-bold text-indigo-500 dark:text-indigo-400">
    {topicMastery.length}
  </span>{" "}
  concepts with an average score of{" "}
  <span className="font-bold text-emerald-500 dark:text-emerald-400">
    {analytics.average_score}%
  </span>.

  <br />
  <br />

  {weakestTopic &&
  weakestTopic.mastery_percentage < 90 ? (
    <>
      Your weakest topic is{" "}
      <span className="font-bold text-red-500">
        {weakestTopic.topic}
      </span>.
      Focus on revising this topic before
      attempting more quizzes.
    </>
  ) : (
    <>
      Excellent work.
      No weak areas detected.
      Continue attempting harder quizzes.
    </>
  )}
</p>
        </div>

        </div>

        <div className="grid md:grid-cols-4 gap-5 mt-8">

  <div className="rounded-3xl border p-6">
    <p>Attempted Quizzes</p>
    <h2>{analytics.total_attempts}</h2>
  </div>

  <div className="rounded-3xl border p-6">
    <p>Average Score</p>
    <h2>{analytics.average_score}%</h2>
  </div>

  <div className="rounded-3xl border p-6">
    <p>Best Score</p>
    <h2>{analytics.best_score}%</h2>
  </div>

  <div className="rounded-3xl border p-6">
    <p>Worst Score</p>
    <h2>{analytics.worst_score}%</h2>
  </div>

</div>
    <div
  className="
    mt-8
    rounded-[32px]
    border
    border-slate-200 dark:border-white/10
    bg-white dark:bg-white/[0.03]
    backdrop-blur-xl
    p-8
  "
>
  <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
    Achievements
  </h2>

  <div className="flex flex-wrap gap-4">
    {achievements.length === 0 ? (

<p className="text-slate-500">
No achievements unlocked yet.
</p>

) : (

achievements.map((achievement,index)=>{

  const Icon = achievement.icon;

  return (
    <div
      key={index}
      className="
        flex
        items-center
        gap-3
        px-5
        py-3
        rounded-2xl
        bg-gradient-to-r
        from-indigo-500/20
        to-purple-500/20
        border
        border-indigo-500/20
        text-slate-900 dark:text-white
      "
    >
      <Icon
        size={20}
        className="text-indigo-400"
      />

      <span className="font-medium">
        {achievement.title}
      </span>
    </div>
  );
})
)}
  </div>
    </div>
    <div
  className="
    mt-8
    rounded-[32px]
    border
    border-slate-200 dark:border-white/10
    bg-white dark:bg-white/[0.03]
    backdrop-blur-xl
    p-8
  "
>
  <div className="flex items-center justify-between mb-8">

    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
      Knowledge Map
    </h2>

    <span
      className="
        px-4
        py-2
        rounded-full
        bg-indigo-500/20
        text-indigo-500
        dark:text-indigo-300
      "
    >
      {topicMastery.length} Topics
    </span>
  </div>

  <Link
  to="/roadmap"
  className="
    inline-flex
    items-center
    gap-2
    px-5
    py-3
    rounded-2xl
    bg-indigo-600
    text-white
    font-semibold
    hover:bg-indigo-500
    transition
  "
>
  <BrainCircuit size={18} />
  Generate Study Roadmap
</Link>

  <div
  className="
    mt-8
    rounded-[32px]
    border
    border-indigo-500/20
    bg-gradient-to-r
    from-indigo-500/10
    to-purple-500/10
    p-8
  "
>
  <h2
    className="
      text-2xl
      font-bold
      mb-6
      text-slate-900
      dark:text-white
    "
  >
    AI Learning Diagnosis
  </h2>

  <div className="space-y-4">

  {weakestTopic ? (

    <>

      <p className="text-slate-700 dark:text-slate-300">
        Weakest Topic:
        <span className="font-bold ml-2 text-red-500">
          {weakestTopic.topic}
        </span>
      </p>

      <p className="text-slate-700 dark:text-slate-300">
        Current Mastery:
        <span className="font-bold ml-2">
          {weakestTopic.mastery_percentage}%
        </span>
      </p>

      <p className="text-slate-700 dark:text-slate-300">
        Questions Attempted:
        <span className="font-bold ml-2">
          {weakestTopic.total_questions_answered}
        </span>
      </p>

      <p className="text-slate-700 dark:text-slate-300">
        Recommendation:
        <span className="font-semibold ml-2">

          {weakestTopic.mastery_percentage < 60 &&
            "Immediate revision recommended. Review notes thoroughly and attempt another quiz."}

          {weakestTopic.mastery_percentage >= 60 &&
            weakestTopic.mastery_percentage < 90 &&
            "Practice 2-3 more quizzes to strengthen this topic."}

          {weakestTopic.mastery_percentage >= 90 &&
            "Excellent mastery. Continue exploring more advanced concepts."}

        </span>
      </p>

    </>

  ) : (

    <div className="text-center py-6">

      <p className="text-slate-600 dark:text-slate-400 text-lg">
        No learning diagnosis available yet.
      </p>

      <p className="text-slate-500 mt-2">
        Complete your first quiz to receive personalized AI insights.
      </p>

    </div>

  )}

</div>
</div>

  <div
    className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-3
      gap-5
    "
  >
{topicMastery.length === 0 ? (

<div className="text-slate-500">
No topic analytics available yet.
Complete your first quiz.
</div>

) : (

topicMastery.map((topic,index)=>{


      const mastery =
        topic.mastery_percentage;

      let glow =
        "border-red-200 dark:border-red-500/20";

      let textColor =
        "text-red-500";

      if (mastery >= 90) {
        glow =
          "border-emerald-200 dark:border-emerald-500/20";
        textColor =
          "text-emerald-500";
      }

      else if (mastery >= 70) {
        glow =
          "border-yellow-200 dark:border-yellow-500/20";
        textColor =
          "text-yellow-500";
      }

      return (
        <div
          key={index}
          className={`
            rounded-3xl
            border
            ${glow}
            bg-slate-50
            dark:bg-slate-900/40
            p-6
            hover:scale-[1.02]
            transition-all
          `}
        >
          <h3
            className="
              text-slate-900
              dark:text-white
              font-bold
              text-lg
              mb-4
            "
          >
            {topic.topic}
          </h3>

          <div className="flex items-center justify-between">
            <span
              className={`
                text-4xl
                font-black
                ${textColor}
              `}
            >
              {mastery}%
            </span>

            <div
              className="
                text-right
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              <p>
                {topic.total_questions_answered}
              </p>

              <p>
                Questions Solved
              </p>
            </div>
          </div>
        </div>
      );
    })
  )}
        </div>
    </div>
</div>
  );
}