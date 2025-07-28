import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import SendIcon from "@mui/icons-material/Send";
import "./AgentChatFullPage.css";
import { getAuth } from "firebase/auth";



export default function AgentChatFullPage() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userName, setUserName] = useState("User");

  const chatEndRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("chatTheme");
    if (savedTheme) setTheme(savedTheme);
  }, []);
  useEffect(() => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user?.displayName) {
        setUserName(user.displayName);
      }
    }, []);


  useEffect(() => {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      setChat(JSON.parse(stored));
    } else {
      const welcomeMessage = {
        role: "ai",
        content: `👋 Hello ${userName}, how can I help you with your expenses today?`,
      };
      setChat([welcomeMessage]);
    }
  }, [userName]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);


  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedChat = [...chat, userMessage];

    setChat(updatedChat);
    setInput("");
    setLoading(true);

    // try {
    //   const data = await sendAgentQuery({
    //     query: input,
    //     chat_history: updatedChat,
    //   });

    //   const aiMessage = { role: "ai", content: data.response };
    //   setChat((prev) => [...prev, aiMessage]);
    // } catch (error) {
    //   console.error("API error:", error);
    //   const fallback = {
    //     role: "ai",
    //     content: "⚠️ Sorry, I couldn't process that. Please try again.",
    //   };
    //   setChat((prev) => [...prev, fallback]);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };



  return (
    <div className={`expensewise-fullpage-chat ${theme}`}>
      <div className="expensewise-chat-body">
        <div className="expensewise-chat-username">Hey {userName}</div>
        {chat.map((msg, idx) => (
          <div key={idx} className={`expensewise-chat-msg ${msg.role}`}>
            {msg.role === "ai" ? (
              <>
                <div className="expensewise-avatar">🤖</div>
                <div className="expensewise-bubble ai">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </>
            ) : (
              <>
                <div className="expensewise-bubble user">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <div className="expensewise-avataruser">🧑</div>
              </>
            )}
          </div>
        ))}
        {loading && (
          <div className="expensewise-chat-msg ai">
            <div className="expensewise-avatar">🤖</div>
            <div className="expensewise-bubble typing">
              Typing<span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="expensewise-chat-footer">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSend} disabled={loading}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
