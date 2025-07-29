import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import SendIcon from "@mui/icons-material/Send";
import "./AgentChatFullPage.css";
import { getAuth } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import { chatTopMatches } from "../services/services";
import {
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import remarkGfm from "remark-gfm";

export default function AgentChatFullPage() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme] = useState("light");
  const [userName, setUserName] = useState("User");
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [openResumeDialog, setOpenResumeDialog] = useState(false);
  const { jd_id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);



  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user?.displayName) setUserName(user.displayName);
    if (user?.photoURL) setUserPhotoURL(user.photoURL);
  }, []);

  useEffect(() => {
    if (!jd_id || !userName || userName === "User") return;

    const chatKey = `chatHistory-${jd_id}`;
    const stored = localStorage.getItem(chatKey);
    if (stored) {
      setChat(JSON.parse(stored));
    } else {
      const welcome = {
        role: "ai",
        content: `👋 Hello ${userName}, how can I help you with your top matched candidates today?`,
      };
      setChat([welcome]);
    }
  }, [jd_id, userName]);

  // Save chat to localStorage
  useEffect(() => {
    if (!jd_id) return;
    const chatKey = `chatHistory-${jd_id}`;
    localStorage.setItem(chatKey, JSON.stringify(chat));
  }, [chat, jd_id]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Clear chat history on logout
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) {
        clearAllJDChats();
      }
    });
    return () => unsubscribe();
  }, []);

  const clearAllJDChats = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("chatHistory-")) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    const updatedChat = [...chat, userMessage];
    setChat(updatedChat);
    setInput("");
    setLoading(true);

    try {
      const data = await chatTopMatches(jd_id, input);
      const aiMessage = { role: "ai", content: data.response.response };
      setChat((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("API error:", error);
      const fallback = {
        role: "ai",
        content:
          "⚠️ Apologies, something went wrong. Please try again shortly.",
      };
      setChat((prev) => [...prev, fallback]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenResume = (url) => {
    setResumeUrl(url);
    setOpenResumeDialog(true);
  };

  const handleCloseResumeDialog = () => {
    setOpenResumeDialog(false);
    setResumeUrl("");
  };

  return (
    <div className={`expensewise-fullpage-chat ${theme}`}>
      <div className="expensewise-chat-header">
        <button
          className="back-button"
          onClick={() => {
            navigate("/dashboard/job-descriptions");
            clearAllJDChats(); // Optional: clear chats on exit
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
          Back
        </button>
      </div>

      <div className="expensewise-chat-body">
        <div className="expensewise-chat-username">Hey {userName}</div>
        {chat.map((msg, idx) => (
          <div key={idx} className={`expensewise-chat-msg ${msg.role}`}>
            {msg.role === "ai" ? (
              <>
                <div className="expensewise-avatar">
                  <Avatar className="avatar ai-avatar" variant="circular">
                    <SmartToyRoundedIcon fontSize="small" />
                  </Avatar>
                </div>
                <div className="expensewise-bubble ai">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => {
                        const href = props.href || "";
                        if (
                          href.includes("recruitpro.blob.core.windows.net") ||
                          href.includes("recruitprofiles.blob.core.windows.net")
                        ) {
                          return (
                            <span
                              style={{
                                color: "#4f46e5",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={() => handleOpenResume(href)}
                            >
                              {props.children || "View Resume"}
                            </span>
                          );
                        }
                        return (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {props.children || props.href}
                          </a>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </>
            ) : (
              <>
                <div className="expensewise-bubble user">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <div className="expensewise-avataruser">
                  <Avatar
                    className="avatar user-avatar"
                    variant="circular"
                    src={userPhotoURL || undefined}
                    imgProps={{ referrerPolicy: "no-referrer" }}
                  >
                    {!userPhotoURL && <PersonRoundedIcon fontSize="small" />}
                  </Avatar>
                </div>
              </>
            )}
          </div>
        ))}
        {loading && (
          <div className="expensewise-chat-msg ai">
            <div className="expensewise-avatar">
              <Avatar className="avatar ai-avatar" variant="circular">
                <SmartToyRoundedIcon fontSize="small" />
              </Avatar>
            </div>
            <div className="expensewise-bubble ai typing">
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
          placeholder="Ask something about the top matches..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSend} disabled={loading}>
          <SendIcon />
        </button>
      </div>

      {/* Resume Dialog */}
      <Dialog
        open={openResumeDialog}
        onClose={handleCloseResumeDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            color: "#222",
            fontSize: "1.13rem",
            borderRadius: 5,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.08rem",
            color: "white",
            backgroundColor: "#4b32c3",
          }}
        >
          Candidate Resume
        </DialogTitle>
        <DialogContent dividers>
          {resumeUrl ? (
            <iframe
              src={resumeUrl}
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Resume Viewer"
            />
          ) : (
            <p>Resume not available</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseResumeDialog}
            sx={{ color: "#6c47ff", fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
