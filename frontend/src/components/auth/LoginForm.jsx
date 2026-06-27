import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";

export default function LoginForm() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await authAPI.login(email, password);
      console.log("LOGIN RESPONSE:", data);

      localStorage.setItem(
      "token",
      data.access_token
      );

      localStorage.setItem(
      "user_id",
      data.user_id
      );

      localStorage.setItem(
      "email",
      data.email
      );

      localStorage.setItem(
  "full_name",
  data.full_name
);

      navigate("/home");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2
        className={`text-4xl font-bold mb-3 ${
          darkMode ? "text-white" : "text-slate-900"
        }`}
      >
        Welcome Back
      </h2>

      <p
        className={`mb-5 ${
          darkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        Sign in to continue your learning journey.
      </p>

      <div className="relative mb-4">
        <Mail
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none ${
            darkMode
              ? "bg-slate-800/70 border-slate-700 text-white"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />
      </div>

      <div className="relative mb-3">
        <Lock
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        />

        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="Password"
          className={`w-full pl-12 pr-12 py-4 rounded-2xl border outline-none ${
            darkMode
              ? "bg-slate-800/70 border-slate-700 text-white"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(!showPassword)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          {showPassword ? (
            <EyeOff
              size={18}
              className={
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            />
          ) : (
            <Eye
              size={18}
              className={
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            />
          )}
        </button>
      </div>

      <div className="flex justify-end mb-6">
        <button
          type="button"
          className="text-sm text-indigo-500 hover:text-indigo-400 cursor-pointer"
        >
          Forgot Password?
        </button>
      </div>

      {message && (
        <div className="mb-4 text-center text-red-400 text-sm">
          {message}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="
          w-full
          py-4
          rounded-2xl
          bg-gradient-to-r
          from-indigo-600
          to-purple-600
          text-white
          font-semibold
          hover:scale-[1.02]
          transition-all
          duration-300
          cursor-pointer
        "
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      <div className="flex items-center gap-4 my-5">
        <div
          className={`flex-1 h-px ${
            darkMode
              ? "bg-slate-700"
              : "bg-slate-300"
          }`}
        />
        <span className="text-sm text-slate-500">
          OR
        </span>
        <div
          className={`flex-1 h-px ${
            darkMode
              ? "bg-slate-700"
              : "bg-slate-300"
          }`}
        />
      </div>

      <p
        className={`text-center ${
          darkMode
            ? "text-slate-400"
            : "text-slate-600"
        }`}
      >
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="text-indigo-500 font-semibold hover:text-indigo-400 cursor-pointer"
        >
          Create Account
        </button>
      </p>
    </div>
  );
}