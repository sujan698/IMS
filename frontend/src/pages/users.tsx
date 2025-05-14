/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Card,
  Button,
  Input,
  Modal,
  Form,
  Typography,
  Dropdown,
  Switch,
  Select,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { RootState, AppDispatch } from "../app/store";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../features/users/usersSlice";
import { fetchRoles } from "../features/roles/rolesSlice";

const { Title, Text } = Typography;
const { Option } = Select;

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const Users = () => {
  const dispatch: AppDispatch = useDispatch();
  const { users, isLoading } = useSelector((state: RootState) => state.users);
  const { roles } = useSelector((state: RootState) => state.roles);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && isEditModalVisible) {
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        isActive: currentUser.isActive,
      });
    }
  }, [currentUser, isEditModalVisible, form]);

  const handleAddUser = () => {
    form.validateFields().then((values: UserFormData) => {
      dispatch(createUser(values))
        .unwrap()
        .then(() => {
          setIsAddModalVisible(false);
          form.resetFields();
        });
    });
  };

  const handleEditUser = () => {
    form.validateFields().then((values: UserFormData) => {
      if (!currentUser) return;

      if (!values.password) {
        delete values.password;
      }

      dispatch(updateUser({ id: currentUser.id, userData: values }))
        .unwrap()
        .then(() => {
          setIsEditModalVisible(false);
          setCurrentUser(null);
          form.resetFields();
        });
    });
  };

  const handleDeleteUser = () => {
    if (currentUser) {
      dispatch(deleteUser(currentUser.id))
        .unwrap()
        .then(() => {
          setIsDeleteModalVisible(false);
          setCurrentUser(null);
        });
    }
  };

  const showEditModal = (user: User) => {
    setCurrentUser(user);
    setIsEditModalVisible(true);
  };

  const showDeleteModal = (user: User) => {
    setCurrentUser(user);
    setIsDeleteModalVisible(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: TableColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: roles.map((role) => ({ text: role.name, value: role.name })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Switch
          checked={isActive}
          size="small"
          disabled
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit",
                icon: <EditOutlined />,
                onClick: () => showEditModal(record),
              },
              {
                key: "delete",
                label: "Delete",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => showDeleteModal(record),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Users</Title>
        <Text type="secondary">Manage system users and permissions</Text>
      </div>

      <div
        className="search-filter-container"
        style={{ marginBottom: 16, display: "flex", gap: 10 }}
      >
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 250 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add User
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={isAddModalVisible}
        onOk={handleAddUser}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        okText="Add User"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter user name" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select placeholder="Select a role">
                  {roles.map((role) => (
                    <Option key={role.id} value={role.name}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onOk={handleEditUser}
        onCancel={() => {
          setIsEditModalVisible(false);
          setCurrentUser(null);
          form.resetFields();
        }}
        okText="Save Changes"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter user name" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: false }]}
            help="Leave blank to keep current password"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Leave blank to keep current password"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select placeholder="Select a role">
                  {roles.map((role) => (
                    <Option key={role.id} value={role.name}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        title="Delete User"
        open={isDeleteModalVisible}
        onOk={handleDeleteUser}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setCurrentUser(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete {currentUser?.name}? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Users;
