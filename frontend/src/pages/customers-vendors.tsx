"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../app/store";
import {
  Table,
  Card,
  Button,
  Input,
  Modal,
  Form,
  Typography,
  Dropdown,
  Tabs,
  Row,
  Col,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { RootState } from "../app/store";
import {
  fetchCustomerVendors,
  createCustomerVendor,
  updateCustomerVendor,
  deleteCustomerVendor,
  type CustomerVendor,
} from "../features/customer-vendor/customerVendorsSlice.ts";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

type EntityType = "all" | "customers" | "vendors" | "both";

const CustomerVendors = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { entities, isLoading } = useSelector(
    (state: RootState) => state.customerVendors
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<CustomerVendor | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [entityType, setEntityType] = useState<EntityType>("all");
  const [addEntityType, setAddEntityType] = useState<"customer" | "vendor">(
    "customer"
  );
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCustomerVendors());
  }, [dispatch]);

  useEffect(() => {
    if (currentEntity && isEditModalVisible) {
      form.setFieldsValue({
        name: currentEntity.name,
        contactPerson: currentEntity.contactPerson,
        email: currentEntity.email,
        phone: currentEntity.phone,
        address: currentEntity.address,
        city: currentEntity.city,
        state: currentEntity.state,
        zipCode: currentEntity.zipCode,
        country: currentEntity.country,
        taxId: currentEntity.taxId,
        notes: currentEntity.notes,
        type: currentEntity.type,
      });
    }
  }, [currentEntity, isEditModalVisible, form]);

  // Filter entities based on selected type
  const filteredEntities = entities
    .filter((entity: CustomerVendor) => {
      if (entityType === "all") return true;
      if (entityType === "customers")
        return entity.type === "customer" || entity.type === "both";
      if (entityType === "vendors")
        return entity.type === "vendor" || entity.type === "both";
      if (entityType === "both") return entity.type === "both";
      return true;
    })
    .filter(
      (entity: CustomerVendor) =>
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entity.contactPerson &&
          entity.contactPerson
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );

  const handleAddEntity = () => {
    form.validateFields().then((values) => {
      dispatch(
        createCustomerVendor({
          ...values,
          type: addEntityType,
        })
      )
        .unwrap()
        .then(() => {
          setIsAddModalVisible(false);
          form.resetFields();
        });
    });
  };

  const handleEditEntity = () => {
    form.validateFields().then((values) => {
      if (currentEntity) {
        dispatch(
          updateCustomerVendor({
            id: currentEntity.id,
            data: values,
          })
        )
          .unwrap()
          .then(() => {
            setIsEditModalVisible(false);
            setCurrentEntity(null);
          });
      }
    });
  };

  const handleDeleteEntity = () => {
    if (currentEntity) {
      dispatch(deleteCustomerVendor(currentEntity.id))
        .unwrap()
        .then(() => {
          setIsDeleteModalVisible(false);
          setCurrentEntity(null);
        });
    }
  };

  const showEditModal = (entity: CustomerVendor) => {
    setCurrentEntity(entity);
    setIsEditModalVisible(true);
  };

  const showDeleteModal = (entity: CustomerVendor) => {
    setCurrentEntity(entity);
    setIsDeleteModalVisible(true);
  };

  const getEntityTypeTag = (type: string) => {
    if (type === "customer") {
      return <Tag color="blue">Customer</Tag>;
    } else if (type === "vendor") {
      return <Tag color="green">Vendor</Tag>;
    } else if (type === "both") {
      return <Tag color="purple">Both</Tag>;
    }
    return null;
  };

  const columns: TableColumnsType<CustomerVendor> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <span>
          {text} {getEntityTypeTag(record.type)}
        </span>
      ),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
      render: (text) => text || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => `${record.city || "-"}, ${record.country || "-"}`,
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
      <div className="entity-header">
        <Title level={2} className="entity-title">
          Customers & Vendors
        </Title>
        <Text type="secondary">Manage your business relationships</Text>
      </div>

      <Tabs
        defaultActiveKey="all"
        onChange={(key) => setEntityType(key as EntityType)}
        className="entity-filter-tabs"
      >
        <TabPane tab="All" key="all" />
        <TabPane tab="Customers" key="customers" />
        <TabPane tab="Vendors" key="vendors" />
        <TabPane tab="Both" key="both" />
      </Tabs>

      <div className="entity-actions">
        <Input
          className="entity-search"
          placeholder="Search by name, email, phone..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Tabs
          defaultActiveKey="table"
          onChange={(key) => setViewMode(key as "table" | "card")}
          className="mb-0"
        >
          <TabPane tab="Table" key="table" />
          <TabPane tab="Cards" key="card" />
        </Tabs>
        <Dropdown
          menu={{
            items: [
              {
                key: "customer",
                label: "Add Customer",
                icon: <UserOutlined />,
                onClick: () => {
                  setAddEntityType("customer");
                  setIsAddModalVisible(true);
                },
              },
              {
                key: "vendor",
                label: "Add Vendor",
                icon: <ShopOutlined />,
                onClick: () => {
                  setAddEntityType("vendor");
                  setIsAddModalVisible(true);
                },
              },
            ],
          }}
        >
          <Button type="primary" icon={<PlusOutlined />}>
            Add New
          </Button>
        </Dropdown>
      </div>

      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={filteredEntities}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <div className="entity-grid">
          {isLoading ? (
            <div className="text-center col-span-full">Loading...</div>
          ) : filteredEntities.length === 0 ? (
            <div className="text-center col-span-full">No records found.</div>
          ) : (
            filteredEntities.map((entity: CustomerVendor) => (
              <Card
                key={entity.id}
                title={
                  <span>
                    {entity.name} {getEntityTypeTag(entity.type)}
                  </span>
                }
                extra={
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "edit",
                          label: "Edit",
                          icon: <EditOutlined />,
                          onClick: () => showEditModal(entity),
                        },
                        {
                          key: "delete",
                          label: "Delete",
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => showDeleteModal(entity),
                        },
                      ],
                    }}
                    trigger={["click"]}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                }
              >
                <div className="entity-card-content">
                  {entity.contactPerson && (
                    <div className="entity-card-item">
                      <BankOutlined />
                      <Text>{entity.contactPerson}</Text>
                    </div>
                  )}
                  <div className="entity-card-item">
                    <MailOutlined />
                    <Text>{entity.email}</Text>
                  </div>
                  <div className="entity-card-item">
                    <PhoneOutlined />
                    <Text>{entity.phone}</Text>
                  </div>
                  {(entity.city || entity.country) && (
                    <div className="entity-card-item">
                      <EnvironmentOutlined className="mt-1" />
                      <Text>
                        {[entity.city, entity.country]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Entity Modal */}
      <Modal
        title={`Add New ${
          addEntityType === "customer" ? "Customer" : "Vendor"
        }`}
        open={isAddModalVisible}
        onOk={handleAddEntity}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        okText={`Add ${addEntityType === "customer" ? "Customer" : "Vendor"}`}
        width={600}
      >
        <Form form={form} layout="vertical" className="form-container">
          <Form.Item
            name="name"
            label={addEntityType === "customer" ? "Name" : "Company Name"}
            rules={[
              {
                required: true,
                message: `Please enter ${
                  addEntityType === "customer" ? "name" : "company name"
                }`,
              },
            ]}
          >
            <Input />
          </Form.Item>

          {addEntityType === "vendor" && (
            <Form.Item
              name="contactPerson"
              label="Contact Person"
              rules={[
                { required: true, message: "Please enter contact person" },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="state" label="State/Province">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="zipCode" label="Zip/Postal Code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {addEntityType === "vendor" && (
            <Form.Item name="taxId" label="Tax ID / VAT Number">
              <Input />
            </Form.Item>
          )}

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Entity Modal */}
      <Modal
        title={`Edit ${
          currentEntity?.type === "customer"
            ? "Customer"
            : currentEntity?.type === "vendor"
            ? "Vendor"
            : "Entity"
        }`}
        open={isEditModalVisible}
        onOk={handleEditEntity}
        onCancel={() => {
          setIsEditModalVisible(false);
          setCurrentEntity(null);
        }}
        okText="Save Changes"
        width={600}
      >
        <Form form={form} layout="vertical" className="form-container">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="contactPerson" label="Contact Person">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="state" label="State/Province">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="zipCode" label="Zip/Postal Code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="taxId" label="Tax ID / VAT Number">
            <Input />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="type" label="Type">
            <Tabs>
              <TabPane tab="Customer" key="customer" />
              <TabPane tab="Vendor" key="vendor" />
              <TabPane tab="Both" key="both" />
            </Tabs>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Entity Modal */}
      <Modal
        title="Delete Record"
        open={isDeleteModalVisible}
        onOk={handleDeleteEntity}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setCurrentEntity(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete {currentEntity?.name}? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default CustomerVendors;
