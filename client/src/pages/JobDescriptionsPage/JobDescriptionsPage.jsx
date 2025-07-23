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

export default function JobDescriptionsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJD, setSelectedJD] = useState(null);
  const [jdViewUrl, setJdViewUrl] = useState(null);
  const [jdModalOpen, setJdModalOpen] = useState(false);
  const [showFullJD, setShowFullJD] = useState(false);

  const hasFetched = useRef(false);

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
    if (!window.confirm("Are you sure you want to delete this JD?")) return;

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
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              className="upload-jd-btn"
            >
              Upload JD
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              />
            </Button>

            <Button
              variant="contained"
              className="submit-jd-btn"
              disabled={!selectedFiles.length || loading}
              onClick={handleUpload}
            >
              {loading ? "Uploading..." : "Submit"}
            </Button>

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

          {/* Count Row */}
          <Box className="candidates-count-row">
            <Typography variant="body2" className="candidates-count">
              Showing <b>{jobs.length}</b> of <b>{jobs.length}</b> Job
              Descriptions
            </Typography>
          </Box>

          {/* JD Cards */}
          <Box className="jd-list">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
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
            ) : jobs.length === 0 ? (
              <Typography variant="body2" sx={{ mt: 2 }}>
                No job descriptions found.
              </Typography>
            ) : (
              jobs.map((job, idx) => (
                <Card key={job.jd_id || idx} className="jd-card" elevation={0}>
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
                        <Typography variant="body2" className="jd-meta-item">
                          {job.location || "Location not specified"}
                        </Typography>
                        <Typography variant="body2" className="jd-meta-item">
                          {job.salary_range || "Salary not specified"}
                        </Typography>
                      </Box>

                      <Typography variant="body2" className="jd-desc">
                        {showFullJD
                          ? job.description
                          : `${job.description.slice(0, 200)}${
                              job.description.length > 200 ? "..." : ""
                            }`}
                      </Typography>

                      {job.description.length > 200 && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            cursor: "pointer",
                            mt: 0.5,
                          }}
                          onClick={() => setShowFullJD(!showFullJD)}
                        >
                          {showFullJD ? "Show less" : "Show more"}
                        </Typography>
                      )}

                      <Box className="jd-req-row">
                        <Typography variant="body2" className="jd-req-label">
                          <p>Key Requirements:</p>
                        </Typography>
                        <Box className="jd-req-tags">
                          {job.required_experience && (
                            <Chip
                              label={job.required_experience}
                              className="jd-req-tag"
                            />
                          )}
                          {job.required_skills?.map((skill, i) => (
                            <Chip
                              key={i}
                              label={skill}
                              className="jd-req-tag"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    <Box className="jd-card-actions">
                      <Tooltip title="View Matches">
                        <Button
                          variant="outlined"
                          className="match-btn"
                          onClick={() => handleViewMatches(job.jd_id)}
                        >
                          Matches
                        </Button>
                      </Tooltip>

                      <Tooltip title="Delete Job Description">
                        <IconButton onClick={() => handleDeleteJD(job.jd_id)}>
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
              ))
            )}
          </Box>
        </>
      )}

      {/* JD Modal */}
      <Modal
        open={jdModalOpen}
        onClose={() => setJdModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
          }}
        >
          {jdViewUrl ? (
            <iframe
              src={jdViewUrl}
              title="JD Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <Typography>Loading job description...</Typography>
          )}
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
