import React, { useState } from "react";
import Sidebar from "../../component/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 80 : 280;

  return (
    <div>
      {/* Sidebar */}
      <div
        style={{
          width: `${sidebarWidth}px`,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          // overflowY: "auto",
          backgroundColor: "#fff",
          transition: "width 0.3s ease",
          zIndex: 1000,
        }}
      >
        <Sidebar
          onToggle={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
        />
      </div>

      {/* Main Content */}
      <main
        style={{
          marginLeft: `${sidebarWidth}px`,
          height: "100vh",
          overflowY: "auto",
          padding: "20px",
          transition: "margin-left 0.3s ease",
          position: "relative",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
