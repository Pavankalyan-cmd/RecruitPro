import React from "react";
import { Box, Typography, Grid, Paper, Container } from "@mui/material";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import WorkIcon from "@mui/icons-material/Work";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import { motion } from "framer-motion";

export default function Integrations() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        background: "linear-gradient(120deg, #f5f7ff 0%, #e9eaff 100%)",
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#5B21B6", letterSpacing: 1 }}
          >
            <span role="img" aria-label="integrations">🌐</span> Integrations
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Seamlessly connect RecruitPro with your favorite HR and payroll systems.
          </Typography>
        </motion.div>
        <Grid container spacing={4} justifyContent="center">
          {/* Dayforce */}
          <Grid item xs={12} sm={6}>
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(91,33,182,0.18)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <Paper elevation={3} sx={{ p: 3, textAlign: "center", borderRadius: 4, boxShadow: "0 4px 24px rgba(91,33,182,0.08)" }}>
                <CloudSyncIcon sx={{ fontSize: 48, color: "#5B21B6", mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  Dayforce
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Sync employee data, job roles, and payroll status.
                </Typography>
                <motion.button
                  whileHover={{ scale: 1.04, background: "linear-gradient(90deg, #4f8cff 0%, #6c47ff 100%)" }}
                  whileTap={{ scale: 0.97 }}
                  className="weight-update-btn"
                  style={{ width: "100%", marginTop: 12 }}
                >
                  Comming soon...
                </motion.button>
              </Paper>
            </motion.div>
          </Grid>

          {/* Workday */}
          <Grid item xs={12} sm={6}>
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(91,33,182,0.18)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <Paper elevation={3} sx={{ p: 3, textAlign: "center", borderRadius: 4, boxShadow: "0 4px 24px rgba(91,33,182,0.08)" }}>
                <WorkIcon sx={{ fontSize: 48, color: "#5B21B6", mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  Workday
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Import job descriptions and automate interview scheduling.
                </Typography>
                <motion.button
                  whileHover={{ scale: 1.04, background: "linear-gradient(90deg, #4f8cff 0%, #6c47ff 100%)" }}
                  whileTap={{ scale: 0.97 }}
                  className="weight-update-btn"
                  style={{ width: "100%", marginTop: 12 }}
                >
                  Comming soon...
                </motion.button>
              </Paper>
            </motion.div>
          </Grid>

          {/* Add More integrations here */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 80, damping: 18 }}
            >
              <Paper elevation={2} sx={{ p: 3, textAlign: "center", borderRadius: 4, boxShadow: "0 4px 24px rgba(91,33,182,0.08)" }}>
                <IntegrationInstructionsIcon
                  sx={{ fontSize: 48, color: "#5B21B6", mb: 1 }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  More integrations coming soon...
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
