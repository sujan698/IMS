"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Badge,
  Space,
  Typography,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { logout } from "../features/auth/authSlice";
import type { RootState } from "../app/store";
import ThemeToggle from "./ThemeToggle";

const { Header } = Layout;
const { Text } = Typography;

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Navbar = ({ collapsed, setCollapsed }: NavbarProps) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth as { user: { name: string } });

  const handleLogout = () => {
    dispatch(logout());
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="navbar">
      <div className="navbar-container">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="navbar-toggle"
        />

        <div className="navbar-right">
          <Space size={16}>
            <ThemeToggle />

            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="navbar-user">
                <Avatar icon={<UserOutlined />} />
                <Text>{user?.name || "User"}</Text>
              </Space>
            </Dropdown>
          </Space>
        </div>
      </div>
    </Header>
  );
};

export default Navbar;
