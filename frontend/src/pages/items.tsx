"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Table,
  Modal,
  Form,
  Dropdown,
  Menu,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "../features/items/itemsSlice";

// Define the item type to help with type checking
interface ItemType {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
}

const Items = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.items);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ItemType | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddItem = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(createItem(values)).unwrap();
      setIsAddModalVisible(false);
      message.success("Item added successfully");
    } catch (error) {
      message.error(`Failed to add item: ${error}`);
    }
  };

  const handleEditItem = async () => {
    try {
      const values = await form.validateFields();
      if (currentItem) {
        await dispatch(updateItem({ id: currentItem.id, ...values })).unwrap();
        setIsEditModalVisible(false);
        setCurrentItem(null);
        message.success("Item updated successfully");
      }
    } catch (error) {
      message.error(`Failed to update item: ${error}`);
    }
  };

  const handleDeleteItem = async () => {
    try {
      if (currentItem) {
        await dispatch(deleteItem(currentItem.id)).unwrap();
        setIsDeleteModalVisible(false);
        setCurrentItem(null);
        message.success("Item deleted successfully");
      }
    } catch (error) {
      message.error(`Failed to delete item: ${error}`);
    }
  };

  const columns: ColumnsType<ItemType> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text: number) => `$${text.toFixed(2)}`,
      align: "right",
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      render: (text: number) => `$${text.toFixed(2)}`,
      align: "right",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, item: ItemType) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => {
                  setCurrentItem(item);
                  form.setFieldsValue(item);
                  setIsEditModalVisible(true);
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setCurrentItem(item);
                  setIsDeleteModalVisible(true);
                }}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
      align: "right",
    },
  ];

  const filteredItems = items.filter(
    (item: ItemType) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Items</h2>
          <p className="text-gray-500">Manage your inventory items</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button icon={<FilterOutlined />}>Filter</Button>
      </div>

      <Table
        dataSource={filteredItems}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        bordered
      />

      <Modal
        title="Add New Item"
        open={isAddModalVisible}
        onOk={handleAddItem}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Add"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="cost" label="Cost" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Item"
        open={isEditModalVisible}
        onOk={handleEditItem}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Save Changes"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="cost" label="Cost" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Delete Item"
        open={isDeleteModalVisible}
        onOk={handleDeleteItem}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        okType="danger"
      >
        <p>
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default Items;
