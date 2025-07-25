import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Modal,
  Button,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import slickbit from "../../assets/image/slickbit.png";
import TuneIcon from "@mui/icons-material/Tune";
import { motion } from "framer-motion";
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
import { useState } from "react";
const navItems = [
  { label: "Candidates", icon: <PeopleIcon />, path: "candidates" },
  {
    label: "Job Descriptions",
    icon: <DescriptionIcon />,
    path: "job-descriptions",
  },
];

const settingsItems = [
  { label: "Integrations", icon: <SettingsIcon />, path: "integrations" },
  { label: "Scoring Configuration", icon: <TuneIcon/>, path: "score" },
];

export default function Sidebar({ onToggle, collapsed }) {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setLogoutOpen(false);
  };

  return (
    <motion.div
      className={`sidebar-root ${collapsed ? "collapsed" : ""}`}
      initial={{ width: collapsed ? 70 : 260 }}
      animate={{ width: collapsed ? 70 : 260 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      style={{
        boxShadow: "0 4px 24px rgba(80, 80, 180, 0.08)",
        borderRadius: "18px 0 0 18px",
        background: "linear-gradient(120deg, #f5f7ff 0%, #f7f8fd 100%)",
        minHeight: "100vh",
        overflow: "hidden",
        borderRight: "1px solid #EEE",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Header */}
      <motion.div
        className="sidebar-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ justifyContent: collapsed ? "center" : "space-between", alignItems: "center", display: "flex" }}
      >
        {!collapsed && (
          <Box onClick={() => navigate("/dashboard/candidates")} sx={{cursor: "pointer", display: "flex", flexDirection: "row", alignItems: "center", gap: 1}}>
            <img
              src="https://i.postimg.cc/XJG9rkr8/Adobe-Express-file.png"
              alt="RecruitPro Logo"
              className="sidebar-logo"
            />
            <Typography className="sidebar-title" variant="h6">
              RecruitPro
            </Typography>
          </Box>
        )}
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <motion.div whileTap={{ scale: 0.9 }}>
            <IconButton onClick={onToggle} className="sidebar-toggle-btn">
              
              <KeyboardArrowLeftOutlinedIcon
                fontSize="medium"
                style={{
                  transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease"
                }}
              />
            </IconButton>
          </motion.div>
        </Tooltip>
      </motion.div>
      <Divider className="sidebar-divider" />
      {/* Navigation */}
      <Box className="sidebar-section">
        {!collapsed && (
          <Typography className="sidebar-section-title" variant="subtitle2">
            Navigation
          </Typography>
        )}
        <List>
          {navItems.map((item, idx) => (
            <NavLink
              key={item.label}
              to={`/dashboard/${item.path}`}
              className={({ isActive }) =>
                `sidebar-list-link ${isActive ? "active" : ""}`
              }
              style={{ textDecoration: "none" }}
            >
              <motion.li
                whileHover={{ scale: 1.04, backgroundColor: "#f0f4ff" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="sidebar-list-item"
                style={{ listStyle: "none", display: "flex" }}
              >
                <ListItemIcon className="sidebar-list-icon">
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ className: "sidebar-list-text" }}
                  />
                )}
              </motion.li>
            </NavLink>
          ))}
        </List>
      </Box>
      {/* Settings */}
      <Box className="sidebar-section">
        {!collapsed && (
          <Typography className="sidebar-section-title" variant="subtitle2">
            Settings
          </Typography>
        )}
        <List>
          {settingsItems.map((item, idx) => (
            <NavLink
              key={item.label}
              to={`/dashboard/${item.path}`}
              className={({ isActive }) =>
                `sidebar-list-link ${isActive ? "active" : ""}`
              }
              style={{ textDecoration: "none" }}
            >
              <motion.li
                whileHover={{ scale: 1.04, backgroundColor: "#f0f4ff" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="sidebar-list-item"
                style={{ listStyle: "none", display: "flex", alignItems: "center" }}
              >
                <ListItemIcon className="sidebar-list-icon">
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ className: "sidebar-list-text" }}
                  />
                )}
              </motion.li>
            </NavLink>
          ))}
          {/* Logout Button */}
          <motion.li
            whileHover={{ scale: 1.04, backgroundColor: "#ffeaea" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="sidebar-list-item"
            style={{ listStyle: "none", display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={handleLogout}
          >
            <ListItemIcon className="sidebar-list-icon">
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ className: "sidebar-list-text" }}
              />
            )}
          </motion.li>
        </List>
        {/* Logout Confirmation Modal */}
        <Modal open={logoutOpen} onClose={cancelLogout}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            minWidth: 320,
            textAlign: 'center',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Confirm Logout
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Are you sure you want to logout?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="error" onClick={confirmLogout}>
                Yes
              </Button>
              <Button variant="outlined" onClick={cancelLogout}>
                No
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
      {/* Bottom Toggle */}
      {/* <Divider className="sidebar-divider" /> */}
      <Box className="sidebar-bottom">
        {!collapsed && (
          <motion.img
            src={slickbit}
            alt="Slickbit Logo"
            className="sidebar-slickbit-logo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          />
        )}
      </Box>
    </motion.div>
  );
}
