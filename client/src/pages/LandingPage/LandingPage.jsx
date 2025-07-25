import React from "react";
import { Button, Typography, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { getIdToken } from "firebase/auth";
import { auth, provider, signInWithPopup } from "../../firebase";
import { motion } from "framer-motion";

const features = [
  "Reduce screening time by 80%",
  "Improve candidate quality scoring",
  "Integrate with existing HR tools",
  "Scale your recruitment process",
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await getIdToken(user);

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard/candidates");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("Google Sign-In failed. Check your Firebase config.");
    }
  };

  return (
    <Box className="landing-root">
      <header className="landing-header">
        <Box className="logo-box">
          <img
            src="https://i.postimg.cc/XJG9rkr8/Adobe-Express-file.png"
            alt="RecruitPro Logo"
            className="logo-img"
          />
          <Typography
            variant="h6"
            className="logo-text"
            sx={{ fontWeight: "bold" }}
          >
            RecruitPro
          </Typography>
        </Box>
      </header>

      <main className="landing-main">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Typography className="platform-badge" variant="caption">
            ✨ AI-Powered Recruitment Platform
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <Typography
            className="main-title"
            variant="h2"
            sx={{ fontWeight: "bold" }}
          >
            Smart Resume Screening
            <br />& Candidate Matching
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <Typography className="main-desc" variant="subtitle1">
            Transform your recruitment process with AI-powered resume analysis,
            intelligent candidate scoring, and seamless integrations.
          </Typography>
        </motion.div>

        <motion.div
          className="cta-buttons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            variant="contained"
            className="start-trial-btn"
            onClick={handleGoogleSignIn}
          >
            Sign In with Google
          </Button>
        </motion.div>

        <motion.div
          className="features-row"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="feature-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="body2">{feature}</Typography>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </Box>
  );
}
