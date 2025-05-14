"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout } from "antd";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

const { Content } = AntLayout;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AntLayout className="main-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <AntLayout className="main-content">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="page-content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
