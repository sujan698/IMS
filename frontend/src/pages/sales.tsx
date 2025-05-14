/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Tag,
  DatePicker,
  Select,
  InputNumber,
  Space,
  Divider,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import type { RootState } from "../app/store";
import {
  fetchSales,
  createSale,
  updateSale,
  deleteSale,
} from "../features/sales/salesSlice";
import { fetchItems } from "../features/items/itemsSlice";
import { fetchCustomerVendors } from "../features/customer-vendor/customerVendorsSlice";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SaleItem {
  itemId: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

interface SaleFormData {
  customerId: string;
  date: dayjs.Dayjs;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
  status: "pending" | "completed" | "cancelled";
}

interface Sale {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  total: number;
  status: "pending" | "completed" | "cancelled";
}

import { AppDispatch } from "../app/store";

const Sales = () => {
  const dispatch: AppDispatch = useDispatch();
  const { sales, isLoading } = useSelector((state: RootState) => state.sales);
  const { entities: customerVendors } = useSelector(
    (state: RootState) => state.customerVendors
  );
  const { items } = useSelector((state: RootState) => state.items);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [form] = Form.useForm();

  const customers = customerVendors.filter(
    (entity) => entity.type === "customer" || entity.type === "both"
  );

  useEffect(() => {
    dispatch(fetchSales());
    dispatch(fetchItems());
    dispatch(fetchCustomerVendors());
  }, [dispatch]);

  useEffect(() => {
    if (currentSale && isEditModalVisible) {
      form.setFieldsValue({
        ...currentSale,
        date: dayjs(currentSale.date),
      });
    }
  }, [currentSale, isEditModalVisible, form]);

  const calculateTotals = (items: SaleItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    return { subtotal, total: subtotal };
  };

  const handleItemsChange = (items: SaleItem[]) => {
    const updatedItems = items.map((item) => {
      const total =
        (item.quantity || 0) *
        (item.price || 0) *
        (1 - (item.discount || 0) / 100);
      return { ...item, total };
    });

    const { subtotal, total } = calculateTotals(updatedItems);
    form.setFieldsValue({ items: updatedItems, subtotal, total });
  };

  const handleFormSubmit = async (
    handler: (saleData: SaleFormData) => Promise<void>,
    successCallback: () => void
  ) => {
    try {
      const values = await form.validateFields();
      const saleData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      };
      await handler(saleData);
      successCallback();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const renderItemsTable = (isEdit: boolean = false) => (
    <Form.List name="items">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Form.Item
                    {...restField}
                    name={[name, "itemId"]}
                    rules={[{ required: true, message: "Select item" }]}
                  >
                    <Select
                      placeholder="Select item"
                      showSearch
                      optionFilterProp="children"
                      onChange={() => {
                        const itemId = form.getFieldValue([
                          "items",
                          name,
                          "itemId",
                        ]);
                        const selectedItem = items.find(
                          (item) => item.id === itemId
                        );
                        if (selectedItem) {
                          form.setFieldValue(
                            ["items", name, "price"],
                            selectedItem.price
                          );
                          handleItemsChange(form.getFieldValue("items"));
                        }
                      }}
                    >
                      {items.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                      placeholder="Qty"
                      min={1}
                      className="w-full"
                      onChange={() =>
                        handleItemsChange(form.getFieldValue("items"))
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "price"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                      placeholder="Price"
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "discount"]}
                    initialValue={0}
                  >
                    <InputNumber
                      placeholder="Discount %"
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item
                    {...restField}
                    name={[name, "total"]}
                    className="text-right"
                  >
                    <InputNumber disabled className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={1}>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      className="text-danger"
                      onClick={() => {
                        remove(name);
                        setTimeout(
                          () => handleItemsChange(form.getFieldValue("items")),
                          0
                        );
                      }}
                    />
                  )}
                </Col>
              </Row>
            </div>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              Add Item
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );

  const renderTotalsCard = () => (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="space-between">
          <Col>Subtotal ($):</Col>
          <Col>
            <Form.Item name="subtotal" noStyle>
              <InputNumber disabled style={{ width: 120 }} />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="space-between">
          <Col>Tax ($):</Col>
          <Col>
            <Form.Item name="tax" noStyle>
              <InputNumber
                min={0}
                style={{ width: 120 }}
                onChange={(value) => {
                  const subtotal = form.getFieldValue("subtotal") || 0;
                  const discount = form.getFieldValue("discount") || 0;
                  form.setFieldsValue({
                    total: subtotal + (value || 0) - discount,
                  });
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="space-between">
          <Col>Discount ($):</Col>
          <Col>
            <Form.Item name="discount" noStyle>
              <InputNumber
                min={0}
                style={{ width: 120 }}
                onChange={(value) => {
                  const subtotal = form.getFieldValue("subtotal") || 0;
                  const tax = form.getFieldValue("tax") || 0;
                  form.setFieldsValue({ total: subtotal + tax - (value || 0) });
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: "12px 0" }} />
        <Row justify="space-between">
          <Col>
            <strong>Total ($):</strong>
          </Col>
          <Col>
            <Form.Item name="total" noStyle>
              <InputNumber disabled style={{ width: 120 }} />
            </Form.Item>
          </Col>
        </Row>
      </Space>
    </Card>
  );

  const renderCustomerDateFields = () => (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          name="customerId"
          label="Customer"
          rules={[{ required: true, message: "Select customer" }]}
        >
          <Select
            placeholder="Select customer"
            showSearch
            optionFilterProp="children"
          >
            {customers.map((customer) => (
              <Option key={customer.id} value={customer.id}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Select date" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
      </Col>
    </Row>
  );

  const commonModalProps = (isEdit: boolean) => ({
    width: 800,
    onCancel: () => {
      if (isEdit) {
        setIsEditModalVisible(false);
      } else {
        setIsAddModalVisible(false);
      }
      form.resetFields();
      setCurrentSale(null);
    },
    okText: isEdit ? "Save Changes" : "Create Sale",
    onOk: () =>
      handleFormSubmit(
        isEdit
          ? async (data: SaleFormData) => {
              await dispatch(
                updateSale({
                  id: currentSale.id,
                  saleData: { ...data, date: data.date.format("YYYY-MM-DD") },
                })
              );
            }
          : async (data: SaleFormData) => {
              await dispatch(
                createSale({ ...data, date: data.date.format("YYYY-MM-DD") })
              );
            },
        () => {
          if (isEdit) {
            setIsEditModalVisible(false);
          } else {
            setIsAddModalVisible(false);
          }
          form.resetFields();
        }
      ),
  });

  function handleDeleteSale(e: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
  }

  function showEditModal(record: Sale): void {
    setCurrentSale(record);
    setIsEditModalVisible(true);
  }

  function showDeleteModal(record: Sale): void {
    setCurrentSale(record);
    setIsDeleteModalVisible(true);
  }

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Sales</Title>
        <Text type="secondary">Manage sales orders and invoices</Text>
      </div>

      <div className="search-filter-container">
        <Input
          placeholder="Search sales..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          New Sale
        </Button>
      </div>

      <Card>
        <Table
          columns={[
            {
              title: "Sale ID",
              dataIndex: "id",
              key: "id",
              sorter: (a, b) => a.id.localeCompare(b.id),
            },
            {
              title: "Customer",
              dataIndex: "customerName",
              render: (_, record) =>
                customers.find((c) => c.id === record.customerId)?.name ||
                "Unknown",
            },
            {
              title: "Date",
              dataIndex: "date",
              render: (date) => new Date(date).toLocaleDateString(),
              sorter: (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            },
            {
              title: "Total",
              dataIndex: "total",
              render: (total) => `$${total.toFixed(2)}`,
              sorter: (a, b) => a.total - b.total,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (status: string) => {
                const color =
                  status === "completed"
                    ? "success"
                    : status === "pending"
                    ? "warning"
                    : "error";
                return (
                  <Tag color={color}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Tag>
                );
              },
              filters: ["completed", "pending", "cancelled"].map((s) => ({
                text: s,
                value: s,
              })),
            },
            {
              title: "Actions",
              key: "actions",
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
                >
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              ),
            },
          ]}
          dataSource={sales.filter(
            (s) =>
              s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={isEditModalVisible ? "Edit Sale" : "New Sale"}
        open={isEditModalVisible || isAddModalVisible}
        {...commonModalProps(isEditModalVisible)}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs(), status: "pending" }}
        >
          {renderCustomerDateFields()}
          <Divider orientation="left">Items</Divider>
          {renderItemsTable(isEditModalVisible)}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="notes" label="Notes">
                <TextArea rows={3} />
              </Form.Item>
              <Form.Item name="status" label="Status">
                <Select>
                  {["pending", "completed", "cancelled"].map((s) => (
                    <Option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>{renderTotalsCard()}</Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Delete Sale"
        open={isDeleteModalVisible}
        onOk={handleDeleteSale}
        onCancel={() => setIsDeleteModalVisible(false)}
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this sale? This action cannot be
          undone.
        </p>
        {currentSale && (
          <div>
            <p>
              <strong>Sale ID:</strong> {currentSale.id}
            </p>
            <p>
              <strong>Customer:</strong>{" "}
              {customers.find((c) => c.id === currentSale.customerId)?.name ||
                "Unknown"}
            </p>
            <p>
              <strong>Total:</strong> ${currentSale.total?.toFixed(2)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
