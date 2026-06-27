import AnimatedRobot from "./AnimatedRobot";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

export default function AuthLayout({ children }) {
  const { theme } = useTheme();

  const darkMode = theme === "dark";

  return (
    <div
      className={`
        min-h-screen
        flex
        items-center
        justify-center
        relative
        overflow-hidden
        transition-all
        duration-500
        ${
          darkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
            : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
        }
      `}
    >
      {/* Background Glow */}
      <div
        className={`
          absolute
          w-[500px]
          h-[500px]
          rounded-full
          blur-[150px]
          left-0
          top-0
          transition-all
          duration-500
          ${
            darkMode
              ? "bg-indigo-500/20"
              : "bg-blue-300/30"
          }
        `}
      />

      <div
        className={`
          absolute
          w-[400px]
          h-[400px]
          rounded-full
          blur-[120px]
          right-0
          bottom-0
          transition-all
          duration-500
          ${
            darkMode
              ? "bg-purple-500/20"
              : "bg-pink-300/30"
          }
        `}
      />

      {/* Main Card */}
      <div
        className={`
          relative
          z-10
          w-[95%]
          max-w-7xl
          rounded-3xl
          overflow-hidden
          backdrop-blur-xl
          border
          shadow-2xl
          grid
          grid-cols-1
          lg:grid-cols-2
          transition-all
          duration-500
          ${
            darkMode
              ? "bg-slate-900/60 border-slate-800"
              : "bg-white/80 border-slate-200"
          }
        `}
      >
        {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20 cursor-pointer">
        <ThemeToggle />
      </div>
      
        {/* LEFT SIDE */}
        <div
          className={`
            flex
            flex-col
            items-center
            justify-center
            p-6 md:p-10
            border-r
            transition-all
            duration-500
            ${
              darkMode
                ? "border-slate-800"
                : "border-slate-200"
            }
          `}
        >
          <AnimatedRobot />

          <h1
            className="
              text-4xl md:text-6xl
              mt-3
              tracking-wide
              bg-gradient-to-r
              from-indigo-400
              via-purple-400
              to-pink-400
              bg-clip-text
              text-transparent
            "
            style={{
              fontFamily: "Audiowide",
            }}
          >
            EduPredict AI
          </h1>

          <p
            className={`
              mt-2
              text-center
              max-w-xs md:max-w-md
              text-sm md:text-lg
              transition-all
              duration-500
              ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }
            `}
          >
            Predict Performance.
            <br />
            Master Concepts.
            <br />
            Achieve More.
            <br />
            <br />
            Your personal AI tutor for smarter learning.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div
          className={`
            flex
            items-center
            justify-center
            p-6
            md:p-14
            transition-all
            duration-500
            ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}