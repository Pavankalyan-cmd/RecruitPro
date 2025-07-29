import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Modal,
  Backdrop,
  Skeleton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {
  getJobDescriptions,
  uploadJobDescriptions,
  deleteJobDescription,
} from "../services/services";
import TopMatchesPage from "../TopMatchesPage/TopMatchesPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./JobDescriptionsPage.css";
import SendIcon from '@mui/icons-material/Send';
import { motion } from "framer-motion";

export default function JobDescriptionsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJD, setSelectedJD] = useState(null);
  const [jdViewUrl, setJdViewUrl] = useState(null);
  const [jdModalOpen, setJdModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedJDs, setExpandedJDs] = useState(new Set());
  

  const hasFetched = useRef(false);
const toggleJDExpansion = (jd_id) => {
  setExpandedJDs((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(jd_id)) {
      newSet.delete(jd_id);
    } else {
      newSet.add(jd_id);
    }
    return newSet;
  });
};
  const fetchJDs = async () => {
    try {
      setLoading(true);
      const data = await getJobDescriptions();
      setJobs(data);
    } catch (err) {
      toast.error("Failed to fetch job descriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchJDs();
    
  }, []);
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const handleUpload = async () => {
    if (!selectedFiles.length)
      return toast.warn("Please select at least one file.");

    try {
      setLoading(true);
      toast.info("Uploading and analyzing job descriptions...");

      await uploadJobDescriptions(selectedFiles);
      toast.success("Job descriptions uploaded successfully!");

      setSelectedFiles([]);
      await fetchJDs();
    } catch (err) {
      toast.error("Failed to upload job descriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJD = async (id) => {
    try {
      await deleteJobDescription(id);
      toast.success("Job description deleted successfully!");
      setJobs((prev) => prev.filter((j) => j.jd_id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete job description.");
    }
  };

  const handleViewMatches = (jd_id) => {
    setSelectedJD(jd_id);
  };

  const handleBackFromMatches = () => {
    setSelectedJD(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 2) {
      toast.warning("You can upload a maximum of 2 PDF files.");
      return;
    }

    const invalidFiles = files.filter(
      (file) => file.type !== "application/pdf"
    );

    if (invalidFiles.length > 0) {
      toast.warning("Only PDF files are allowed.");
      return;
    }

    setSelectedFiles(files);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteOpen(false);
    if (deleteId) {
      await handleDeleteJD(deleteId);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteOpen(false);
    setDeleteId(null);
  };

  return (
    <Box className="jd-root">
      <ToastContainer position="top-right" autoClose={3000} />

      {selectedJD ? (
        <TopMatchesPage jd_id={selectedJD} onBack={handleBackFromMatches} />
      ) : (
        <>
          {/* Header */}
          <Box className="jd-header">
            <Box>
              <Typography variant="h5" className="jd-title">
                <b>Job Descriptions</b>
              </Typography>
              <Typography variant="body2" className="jd-subtitle">
                Create and manage job postings
              </Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Box className="jd-controls">
            <Box className="upload-card">
              <label className="upload-dropzone">
                <CloudUploadIcon className="upload-dropzone-icon" />
                <span className="upload-dropzone-text">
                  Upload JD (PDF Only, Max 2)
                </span>
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
              <Button
                className="modern-submit-btn"
                onClick={handleUpload}
                // disabled={!selectedFiles.length || loading}
                sx={{ color: "#fff", textTransform: "none", fontWeight: "600" }}
                endIcon={
                  <SendIcon style={{ fontSize: "1.10rem", color: "#fff" }} />
                }
              >
                {loading ? "Uploading" : "Submit"}
              </Button>
            </Box>
            {selectedFiles.length > 0 && (
              <Box mt={1} sx={{ maxHeight: 100, overflowY: "auto" }}>
                {selectedFiles.map((file, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    sx={{
                      fontSize: "0.85rem",
                      color: "#555",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 300,
                    }}
                  >
                    📄 {file.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>

          {jobs.length === 0 ? (
            <Box
              className="no-jobs-box"
              sx={{ textAlign: "center", py: 8, color: "#7a7a7a" }}
            >
              <DescriptionOutlinedIcon
                sx={{ fontSize: 64, color: "#bdbfff", mb: 2 }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#4f8cff", mb: 1 }}
              >
                No Job Descriptions Found
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Upload job descriptions to get started!
              </Typography>
            </Box>
          ) : (
            <>
              <Box className="candidates-count-row">
                <Typography variant="body2" className="candidates-count">
                  Showing <b>{jobs.length}</b> of <b>{jobs.length}</b> Job
                  Descriptions
                </Typography>
              </Box>

              {/* JD Cards */}
              <Box className="jd-list">
                {loading
                  ? Array.from({ length: 3 }).map((_, idx) => (
                      <Card key={idx} className="jd-card" elevation={0}>
                        <CardContent className="jd-card-content">
                          <Box className="jd-card-main">
                            <Skeleton variant="text" width="50%" height={28} />
                            <Skeleton variant="text" width="30%" height={20} />
                            <Skeleton
                              variant="text"
                              width="100%"
                              height={60}
                              sx={{ my: 1 }}
                            />
                            <Box
                              className="jd-req-tags"
                              sx={{ display: "flex", gap: 1 }}
                            >
                              <Skeleton
                                variant="rectangular"
                                width={80}
                                height={30}
                              />
                              <Skeleton
                                variant="rectangular"
                                width={80}
                                height={30}
                              />
                              <Skeleton
                                variant="rectangular"
                                width={80}
                                height={30}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  : jobs.map((job, idx) => (
                      <motion.div
                        key={job.jd_id || idx}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                      >
                        <Card
                          key={job.jd_id || idx}
                          className="jd-card"
                          elevation={0}
                        >
                          <CardContent className="jd-card-content">
                            <Box className="jd-card-main">
                              <Box className="jd-card-header">
                                <Typography
                                  variant="subtitle1"
                                  className="jd-job-title"
                                >
                                  <b>{job.jobtitle}</b>
                                </Typography>
                                {job.company && (
                                  <Typography
                                    variant="body2"
                                    className="jd-meta-item"
                                    sx={{ color: "#888" }}
                                  >
                                    {job.company}
                                  </Typography>
                                )}
                              </Box>

                              <Box className="jd-card-meta">
                                <Typography
                                  variant="body2"
                                  className="jd-meta-item"
                                >
                                  {job.location || "Location not specified"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  className="jd-meta-item"
                                >
                                  {job.salary_range || "Salary not specified"}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                className={`jd-desc ${
                                  expandedJDs.has(job.jd_id)
                                    ? "expanded"
                                    : "clamped"
                                }`}
                              >
                                {job.description}
                              </Typography>

                              {job.description.length > 300 && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "primary.main",
                                    cursor: "pointer",
                                    mt: 0.5,
                                  }}
                                  onClick={() => toggleJDExpansion(job.jd_id)}
                                >
                                  {expandedJDs.has(job.jd_id)
                                    ? "Show less"
                                    : "Show more"}
                                </Typography>
                              )}

                              <Box className="jd-req-row">
                                <Typography
                                  variant="body2"
                                  className="jd-req-label"
                                >
                                  <p>Key Requirements:</p>
                                </Typography>
                                <Box className="jd-req-tags">
                                  {job.required_experience && (
                                    <Chip
                                      label={job.required_experience}
                                      className="candidate-tag"
                                    />
                                  )}
                                  {job.required_skills?.map((skill, i) => (
                                    <Chip
                                      key={i}
                                      label={skill}
                                      className="candidate-tag"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </Box>

                            <Box className="jd-card-actions">
                              <Tooltip title="View Matches">
                                <motion.button
                                  className="match-btn"
                                  whileHover={{
                                    scale: 1.04,
                                    background:
                                      "linear-gradient(90deg, #4f8cff 0%, #6c47ff 100%)",
                                  }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleViewMatches(job.jd_id)}
                                  style={{
                                    border: "none",
                                    outline: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    background: "none",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    className="match-btn"
                                    style={{ width: "100%" }}
                                  >
                                    Matches
                                  </Button>
                                </motion.button>
                              </Tooltip>

                              <Tooltip title="Delete Job Description">
                                <IconButton
                                  onClick={() => handleDeleteClick(job.jd_id)}
                                >
                                  <DeleteOutlineOutlinedIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="View JD File">
                                <IconButton
                                  onClick={() => {
                                    if (job.jd_url) {
                                      setJdViewUrl(job.jd_url);
                                      setJdModalOpen(true);
                                    } else {
                                      toast.warn("No JD file available.");
                                    }
                                  }}
                                >
                                  <DescriptionOutlinedIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
              </Box>
            </>
          )}
        </>
      )}

      {/* JD Modal */}

      <Dialog
        open={jdModalOpen}
        onClose={() => setJdModalOpen(false)}
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
          Job Description
        </DialogTitle>

        <DialogContent dividers>
          {jdViewUrl ? (
            <iframe
              src={jdViewUrl}
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="JD Viewer"
            />
          ) : (
            <Typography>Loading job description...</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setJdModalOpen(false)}
            sx={{ color: "#6c47ff", fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={cancelDelete}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            minWidth: 320,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Confirm Delete
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Are you sure you want to delete this job description?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button variant="contained" color="error" onClick={confirmDelete}>
              Yes
            </Button>
            <Button variant="outlined" onClick={cancelDelete}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Backdrop Loader */}
      {loading && (
        <Backdrop
          open={true}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: "#fff" }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Box>
  );
}
