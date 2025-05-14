"use client";

import type React from "react";

import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, theme } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  BankOutlined,
  FileTextOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import type { RootState } from "../app/store";
import type { MenuProps } from "antd";

const { Sider } = Layout;
const { useToken } = theme;

type MenuItem = Required<MenuProps>["items"][number];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: { role: string } }
  );
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token } = useToken();

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group",
    requiredRole?: string
  ): MenuItem {
    // Hide item if user doesn't have required role
    if (requiredRole && user?.role !== requiredRole) {
      return null;
    }

    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  const items: MenuItem[] = [
    getItem("Dashboard", "/", <DashboardOutlined />),

    getItem("Inventory", "inventory", <AppstoreOutlined />, [
      getItem("Items", "/items", <ShoppingOutlined />),
      getItem("Categories", "/categories", <FileTextOutlined />),
    ]),

    getItem("Sales", "sales", <ShoppingCartOutlined />, [
      getItem("Sales Orders", "/sales", <ShoppingCartOutlined />),
      getItem("Invoices", "/invoices", <FileTextOutlined />),
    ]),

    getItem("Purchasing", "purchasing", <ShoppingOutlined />, [
      getItem("Purchase Orders", "/purchases", <ShoppingOutlined />),
    ]),

    getItem("Contacts", "/customer-vendors", <ContactsOutlined />),

    getItem("Reports", "reports", <BarChartOutlined />, [
      getItem("Sales Reports", "/reports/sales", <BarChartOutlined />),
      getItem("Inventory Reports", "/reports/inventory", <BarChartOutlined />),
      getItem("Purchase Reports", "/reports/purchases", <BarChartOutlined />),
    ]),

    getItem("Administration", "admin", <SettingOutlined />, [
      getItem(
        "Users",
        "/users",
        <UserOutlined />,
        undefined,
        undefined,
        "admin"
      ),
      getItem(
        "Roles",
        "/roles",
        <SecurityScanOutlined />,
        undefined,
        undefined,
        "admin"
      ),
      getItem(
        "Organizations",
        "/organizations",
        <BankOutlined />,
        undefined,
        undefined,
        "admin"
      ),
      getItem(
        "Settings",
        "/settings",
        <SettingOutlined />,
        undefined,
        undefined,
        "admin"
      ),
    ]),
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="sidebar"
      theme="dark"
    >
      <div className="sidebar-logo">
        <ShoppingOutlined className="sidebar-logo-icon" />
        {!collapsed && <span>Inventory Pro</span>}
      </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={["/"]}
        selectedKeys={[location.pathname]}
        mode="inline"
        items={items}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;
