import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { authAPI } from "../../api/auth";

export default function SignupForm() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    try {
      setMessage("");

      if (password !== confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }

      setLoading(true);

      const data = await authAPI.register(
        email,
        password,
        fullName
      );

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
        Create Account
      </h2>

      <p
        className={`mb-8 ${
          darkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        Start your AI-powered learning journey.
      </p>

      <div className="relative mb-4">
        <User
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        />

        <input
          type="text"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
          placeholder="Full Name"
          className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none ${
            darkMode
              ? "bg-slate-800/70 border-slate-700 text-white"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />
      </div>

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
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Email Address"
          className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none ${
            darkMode
              ? "bg-slate-800/70 border-slate-700 text-white"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />
      </div>

      <div className="relative mb-4">
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
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>

      <div className="relative mb-6">
        <Lock
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        />

        <input
          type={
            showConfirmPassword
              ? "text"
              : "password"
          }
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          placeholder="Confirm Password"
          className={`w-full pl-12 pr-12 py-4 rounded-2xl border outline-none ${
            darkMode
              ? "bg-slate-800/70 border-slate-700 text-white"
              : "bg-white border-slate-300 text-slate-900"
          }`}
        />

        <button
          type="button"
          onClick={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          {showConfirmPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>

      {message && (
        <div className="mb-4 text-center text-red-400 text-sm">
          {message}
        </div>
      )}

      <button
        onClick={handleSignup}
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
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>

      <div className="mt-6 text-center">
        <span
          className={
            darkMode
              ? "text-slate-400"
              : "text-slate-600"
          }
        >
          Already have an account?{" "}
        </span>

        <Link
          to="/"
          className="text-indigo-500 font-semibold hover:text-indigo-400"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}