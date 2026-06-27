import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { authAPI } from "../../api/auth";

export default function DashboardChat() {
  const defaultMessage = [
    {
      id: 1,
      role: "assistant",
      text: "Hi there! I'm Gyaan Saathi, your AI Study Companion. What subjects or assignments are we tackling today?",
    },
  ];

  const userId = localStorage.getItem("user_id");
  const storageKey = `gyaan_saathi_history_${userId}`;

  const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem(storageKey);

    return saved
      ? JSON.parse(saved)
      : defaultMessage;
});

  const [input, setInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isAiThinking]);

  useEffect(() => {
    localStorage.setItem(
  storageKey,
  JSON.stringify(messages)
);
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const currentInput = input;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: currentInput,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    setIsAiThinking(true);

    try {
      const response =
        await authAPI.sendChatMessage(currentInput);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            response.response ||
            "No response received from AI Tutor.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            "Unable to connect to the AI Tutor service.",
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div
      className="
        w-full
        min-h-[700px]
        bg-slate-900/40
        backdrop-blur-xl
        border
        border-slate-800
        rounded-3xl
        flex
        overflow-hidden
      "
    >
      {/* LEFT SIDEBAR */}

      <div
        className="
          hidden
          md:flex
          w-64
          flex-col
          justify-between
          border-r
          border-slate-800/60
          bg-slate-950/50
          p-4
        "
      >
        <div>
          <div className="flex items-center gap-2 mb-6 px-2 py-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Workspace
            </span>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem(storageKey);
              setMessages([
                {
                  id: 1,
                  role: "assistant",
                  text: "Hi there! I'm Gyaan Saathi, your AI Study Companion. What subjects or assignments are we tackling today?",
                },
              ]);
            }}
            className="
              w-full
              rounded-xl
              border
              border-slate-700/50
              bg-slate-800/50
              hover:bg-slate-800
              px-3
              py-2
              text-left
              text-sm
              text-slate-200
              transition
            "
          >
            + New Study Session
          </button>
        </div>

        <div className="text-xs text-slate-500 px-2">
          Connected User
          <br />

          <span className="text-slate-400 font-mono break-all">
            Authenticated Session
          </span>
        </div>
      </div>

      {/* CHAT AREA */}

      <div className="flex-1 flex flex-col">
        {/* CHAT MESSAGES */}

        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none"
                    : "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-bl-none"
                }`}
              >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => (
                        <h1 className="text-2xl font-bold mb-4">{children}</h1>
                      ),
                      h2: ({children}) => (
                        <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
                      ),
                      p: ({children}) => (
                        <p className="mb-3 leading-relaxed">{children}</p>
                      ),
                      ul: ({children}) => (
                        <ul className="list-disc ml-6 mb-3">{children}</ul>
                      ),
                      ol: ({children}) => (
                        <ol className="list-decimal ml-6 mb-3">{children}</ol>
                      ),
                      code: ({children}) => (
                        <code className="bg-slate-900 px-1 rounded">
                          {children}
                        </code>
                      )
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
              </div>
            </div>
          ))}

          {isAiThinking && (
            <div className="flex justify-start">
              <div
                className="
                  bg-slate-800/80
                  border
                  border-slate-700/50
                  text-slate-400
                  px-4
                  py-3
                  rounded-2xl
                  rounded-bl-none
                  flex
                  items-center
                  gap-2
                "
              >
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT BAR */}

        <form
          onSubmit={handleSendMessage}
          className="
            border-t
            border-slate-800/60
            bg-slate-950/20
            backdrop-blur-md
            p-4
            flex
            gap-3
          "
        >
          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder="Ask your AI tutor anything..."
            className="
              flex-1
              bg-slate-950/60
              border
              border-slate-800
              text-slate-200
              placeholder-slate-600
              px-4
              py-3
              rounded-xl
              focus:outline-none
              focus:border-indigo-500
            "
          />

          <button
            type="submit"
            className="
              px-6
              rounded-xl
              bg-gradient-to-r
              from-indigo-500
              to-purple-600
              text-white
              font-semibold
              hover:scale-105
              transition-all
              duration-300
              cursor-pointer
            "
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}