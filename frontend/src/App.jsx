import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";

import { Menu, X, Home, BarChart3, Calculator, User, LogOut, Bot, ClipboardList, BrainCircuit } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import HomePage from "./pages/Home";
import StudentProfileForm from "./components/StudentProfileForm";
import AnalyticsPage from "./pages/AnalyticsPage";
import SgpaCalculator from "./pages/SgpaCalculator";
import Tutor from "./pages/Tutor";
import QuizArena from "./pages/QuizArena";
import TakeQuiz from "./pages/QuizAttempt";
import QuizResults from "./pages/QuizResults";
import QuizAnalytics from "./pages/QuizAnalytics";
import StudyRoadmap from "./pages/StudyRoadmap";

import RobotLogo from "./components/common/RobotLogo";
import ThemeToggle from "./components/auth/ThemeToggle";
import { useTheme } from "./context/ThemeContext";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/" replace />;
}

function DashboardLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const logout = () => {
  const userId = localStorage.getItem("user_id");

  if (userId) {
    localStorage.removeItem(
      `gyaan_saathi_history_${userId}`
    );
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("email");
  localStorage.removeItem("full_name");

  window.location.href = "/";
};

  const links = [
    {
      name: "Gyaan Saathi",
      path: "/tutor",
      icon: <Bot size={18} />,
    },
    {
      name: "Home",
      path: "/home",
      icon: <Home size={18} />,
    },
    {
      name: "Demographics",
      path: "/dashboard",
      icon: <User size={18} />,
    },
    {
      name: "SGPA",
      path: "/sgpa-calculator",
      icon: <Calculator size={18} />,
    },
    {
      name: "Study Roadmap",
      path: "/roadmap",
      icon: <BrainCircuit size={18} />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <BarChart3 size={18} />,
    },
    {
      name: "Quiz Arena",
      path: "/quizzes",
      icon: <ClipboardList size={18} />,
    },
  ];

  return (
    <div
      className={`
        min-h-screen
        transition-all
        duration-500
        ${
          darkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white"
            : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-slate-900"
        }
      `}
    >
      {/* TOPBAR */}

      <div
        className={`
          sticky
          top-0
          z-40
          backdrop-blur-xl
          px-4
          md:px-8
          py-4
          flex
          items-center
          justify-between
          ${
            darkMode
              ? "bg-slate-900/40 border-white/5"
              : "bg-white/60 border-slate-200/40"
          }
        `}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer"
          >
            <Menu size={24} />
          </button>

          <RobotLogo />
        </div>

        <ThemeToggle />
      </div>

      {/* SIDEBAR */}

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.5 }}
              className={`
                fixed
                top-0
                left-0
                h-full
                w-72
                z-50
                backdrop-blur-2xl
                border-r
                p-6
                flex
                flex-col
                ${
                  darkMode
                    ? "bg-slate-950/95 border-slate-800"
                    : "bg-white/90 border-slate-200"
                }
              `}
            >
              <div className="flex items-center justify-between mb-10">
                <RobotLogo />

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-3">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      rounded-xl
                      transition-all
                      ${
                        location.pathname === link.path
                          ? "bg-indigo-600 text-white"
                          : darkMode
                          ? "hover:bg-slate-800"
                          : "hover:bg-slate-100"
                      }
                    `}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto">
                <button
                  onClick={logout}
                  className="
                    flex
                    items-center
                    gap-3
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    text-red-400
                    hover:bg-red-500/10
                    cursor-pointer
                  "
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PAGE CONTENT */}

      <main className="max-w-full p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <HomePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudentProfileForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Tutor />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizArena />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:quizId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TakeQuiz />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-results/:attemptId"
          element={<QuizResults />}
        />

        <Route
          path="/quiz-analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizAnalytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sgpa-calculator"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SgpaCalculator />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudyRoadmap />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
  );
}