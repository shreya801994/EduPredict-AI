import DashboardChat from "../components/chat/DashboardChat";

export default function Tutor() {
  return (
    <div
      className="
        max-w-7xl
        mx-auto
        flex
        flex-col
        gap-6
      "
    >
      {/* HEADER */}

      <div
        className="
          rounded-[32px]
          bg-white/[0.05]
          backdrop-blur-3xl
          border
          border-white/10
          p-8
        "
      >
        <h1 className="text-4xl font-black text-white">
          Gyaan Saathi's Workspace
        </h1>

        <p className="text-slate-400 mt-3">
          Ask questions, generate quizzes, explain concepts,
          debug code, and receive personalized study guidance.
        </p>
      </div>

      {/* CHAT */}

      <DashboardChat />
    </div>
  );
}