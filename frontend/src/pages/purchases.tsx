/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import type { TableColumnsType } from "antd";
import type { RootState } from "../app/store";
import {
  fetchPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../features/purchases/purchasesSlice";
import { fetchItems } from "../features/items/itemsSlice";
import { fetchCustomerVendors } from "../features/customer-vendor/customerVendorsSlice";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface PurchaseItem {
  itemId: string;
  quantity: number;
  price: number;
  total: number;
}

interface PurchaseFormData {
  vendorId: string;
  date: dayjs.Dayjs;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  status: "pending" | "received" | "cancelled";
}

const Purchases = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { purchases, isLoading } = useSelector(
    (state: RootState) => state.purchases
  );
  const { entities: customerVendors } = useSelector(
    (state: RootState) => state.customerVendors
  );
  const { items } = useSelector((state: RootState) => state.items);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<any>(null);
  const [form] = Form.useForm();

  const vendors = customerVendors.filter(
    (entity: any) => entity.type === "vendor" || entity.type === "both"
  );

  useEffect(() => {
    dispatch(fetchPurchases());
    dispatch(fetchItems());
    dispatch(fetchCustomerVendors());
  }, [dispatch]);

  useEffect(() => {
    if (currentPurchase && isEditModalVisible) {
      form.setFieldsValue({
        ...currentPurchase,
        date: dayjs(currentPurchase.date),
      });
    }
  }, [currentPurchase, isEditModalVisible, form]);

  const calculateTotals = (items: PurchaseItem[]) => ({
    subtotal: items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    ),
    total: 0, // Will be calculated with tax in the form
  });

  const handleItemsChange = () => {
    const items = form.getFieldValue("items") || [];
    const subtotal = items.reduce(
      (sum: number, item: PurchaseItem) =>
        sum + (item.quantity || 0) * (item.price || 0),
      0
    );
    const tax = form.getFieldValue("tax") || 0;
    form.setFieldsValue({
      subtotal,
      total: subtotal + tax,
    });
  };

  const handleFormSubmit = async (isEdit: boolean) => {
    try {
      const values = await form.validateFields();
      const purchaseData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        items: values.items.map((item: PurchaseItem) => ({
          ...item,
          total: item.quantity * item.price,
        })),
      };

      if (isEdit && currentPurchase) {
        await dispatch(
          updatePurchase({ id: currentPurchase.id, purchaseData })
        ).unwrap();
      } else {
        await dispatch(createPurchase(purchaseData)).unwrap();
      }

      setIsAddModalVisible(false);
      setIsEditModalVisible(false);
      setCurrentPurchase(null);
      form.resetFields();
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const getStatusTag = (status: "received" | "pending" | "cancelled") => {
    const statusMap = {
      received: { color: "success", text: "Received" },
      pending: { color: "warning", text: "Pending" },
      cancelled: { color: "error", text: "Cancelled" },
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  const columns: TableColumnsType<any> = [
    { title: "Purchase ID", dataIndex: "id", key: "id" },
    {
      title: "Vendor",
      key: "vendorName",
      render: (_, record) =>
        vendors.find((v: any) => v.id === record.vendorId)?.name || "Unknown",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => dayjs(date).format("MMM D, YYYY"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
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
      render: getStatusTag,
      filters: Object.entries({
        received: "Received",
        pending: "Pending",
        cancelled: "Cancelled",
      }).map(([value, text]) => ({ text, value })),
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
                onClick: () => {
                  setCurrentPurchase(record);
                  setIsEditModalVisible(true);
                },
              },
              {
                key: "delete",
                label: "Delete",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  setCurrentPurchase(record);
                  setIsDeleteModalVisible(true);
                },
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <Title level={3} className="!mb-1">
          Purchases
        </Title>
        <Text type="secondary">
          Manage purchase orders and vendor transactions
        </Text>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search purchases..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          New Purchase
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={purchases.filter(
            (p) =>
              p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.vendorName?.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Purchase Form Modal */}
      <Modal
        title={`${currentPurchase ? "Edit" : "New"} Purchase`}
        open={isAddModalVisible || isEditModalVisible}
        onOk={() => handleFormSubmit(!!currentPurchase)}
        onCancel={() => {
          setIsAddModalVisible(false);
          setIsEditModalVisible(false);
          setCurrentPurchase(null);
          form.resetFields();
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs(), status: "pending", items: [{}] }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vendorId"
                label="Vendor"
                rules={[{ required: true }]}
              >
                <Select showSearch optionFilterProp="children">
                  {vendors.map((vendor: any) => (
                    <Option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Items</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="mb-4">
                    <Row gutter={8} align="middle">
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, "itemId"]}
                          rules={[{ required: true }]}
                        >
                          <Select
                            placeholder="Item"
                            showSearch
                            onChange={(itemId) => {
                              const item = items.find(
                                (i: any) => i.id === itemId
                              );
                              form.setFieldValue(
                                ["items", name, "price"],
                                item?.cost || 0
                              );
                              handleItemsChange();
                            }}
                          >
                            {items.map((item: any) => (
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
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={1}
                            placeholder="Qty"
                            className="w-full"
                            onChange={handleItemsChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "price"]}
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={0}
                            step={0.01}
                            placeholder="Price"
                            className="w-full"
                            addonBefore="$"
                            onChange={handleItemsChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item {...restField} name={[name, "total"]}>
                          <InputNumber
                            disabled
                            className="w-full"
                            value={
                              form.getFieldValue(["items", name, "quantity"]) *
                              form.getFieldValue(["items", name, "price"])
                            }
                            addonBefore="$"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => {
                              remove(name);
                              handleItemsChange();
                            }}
                            className="text-red-500"
                          />
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Item
                </Button>
              </>
            )}
          </Form.List>

          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <Form.Item name="notes" label="Notes">
                <TextArea rows={3} />
              </Form.Item>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="received">Received</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Card>
                <Space direction="vertical" className="w-full">
                  <Row justify="space-between">
                    <Col>Subtotal:</Col>
                    <Col>
                      <Form.Item name="subtotal" noStyle>
                        <InputNumber
                          disabled
                          value={form.getFieldValue("subtotal")}
                          addonBefore="$"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>Tax:</Col>
                    <Col>
                      <Form.Item name="tax" noStyle>
                        <InputNumber
                          min={0}
                          addonBefore="$"
                          onChange={(value) => {
                            form.setFieldsValue({
                              total:
                                (form.getFieldValue("subtotal") || 0) +
                                (value || 0),
                            });
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider className="my-2" />
                  <Row justify="space-between">
                    <Col>
                      <strong>Total:</strong>
                    </Col>
                    <Col>
                      <Form.Item name="total" noStyle>
                        <InputNumber
                          disabled
                          value={form.getFieldValue("total")}
                          addonBefore="$"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={async () => {
          if (currentPurchase) {
            await dispatch(deletePurchase(currentPurchase.id));
            setIsDeleteModalVisible(false);
          }
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this purchase?</p>
        {currentPurchase && (
          <div className="mt-4">
            <p>
              <strong>ID:</strong> {currentPurchase.id}
            </p>
            <p>
              <strong>Vendor:</strong>{" "}
              {
                vendors.find((v: any) => v.id === currentPurchase.vendorId)
                  ?.name
              }
            </p>
            <p>
              <strong>Total:</strong> ${currentPurchase.total?.toFixed(2)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchases;
