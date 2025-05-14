"use client";

import type React from "react";

import { JSX, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../app/store";
import {
  Card,
  Typography,
  Table,
  Spin,
  Empty,
  Button,
  Tooltip,
  Badge,
} from "antd";
import {
  Package,
  Users,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import type { RootState } from "../app/store";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import SalesVsPurchasesChart from "../components/charts/SalesVsPurchasesChart";
import InventoryCategoryChart from "../components/charts/InventoryCategoryChart";
import TopSellingProductsChart from "../components/charts/TopSellingProductsChart";
import RevenueByLocationChart from "../components/charts/RevenueByLocationChart";
import ConnectionStatus from "../components/dashboard/ConnectionStatus";
import websocketService from "../services/websockets";
import ThemeTransitionWrapper from "../components/ThemeTransitionWrapper";

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
  trendValue: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
}): JSX.Element => {
  return (
    <Card className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-title">{title}</div>
        <Icon className="stat-card-icon" size={16} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-description">{description}</div>
      <div className={`stat-card-trend trend-${trend}`}>
        {trend === "up" ? (
          <TrendingUp className="trend-icon" size={12} />
        ) : trend === "down" ? (
          <TrendingDown className="trend-icon" size={12} />
        ) : null}
        {trendValue}
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: { name: string } }
  );
  interface DashboardStats {
    totalItems: number;
    activeUsers: number;
    monthlySales: number;
    monthlyPurchases: number;
    salesByMonth: Array<{ month: string; value: number }>;
    purchasesByMonth: Array<{ month: string; value: number }>;
    inventoryByCategory: { categories: string[]; counts: number[] };
    topSellingProducts: { products: string[]; counts: number[] };
    revenueByLocation: { locations: string[]; amounts: number[] };
    recentSales: Array<{
      id: string;
      customer: string;
      amount: number;
      date: string;
    }>;
    lowStockItems: Array<{
      id: string;
      name: string;
      sku: string;
      quantity: number;
      threshold: number;
    }>;
  }

  const { stats, isLoading, webSocketStatus, lastUpdated } = useSelector(
    (state: RootState) =>
      state.dashboard as unknown as {
        stats: DashboardStats;
        isLoading: boolean;
        webSocketStatus: string;
        lastUpdated: string | null;
      }
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());

    // Initialize WebSocket connection
    websocketService.connect();

    // Clean up on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [dispatch]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    dispatch(fetchDashboardStats()).finally(() => {
      setIsRefreshing(false);
    });
  };

  const formatLastUpdated = (timestamp: string | null): string => {
    if (!timestamp) return "Never";

    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const recentSalesColumns = [
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  const lowStockColumns = [
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Threshold",
      dataIndex: "threshold",
      key: "threshold",
    },
  ];

  if (isLoading && !stats) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ height: "400px" }}
      >
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  if (!stats) {
    return <Empty description="No dashboard data available" />;
  }

  return (
    <ThemeTransitionWrapper>
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <Title level={2} className="dashboard-title">
            Dashboard
          </Title>
          <Text type="secondary">
            Welcome back, {user?.name}! Here's an overview of your inventory.
          </Text>
          <div className="dashboard-last-updated">
            <Text type="secondary">
              Last updated: {formatLastUpdated(lastUpdated)}
              <Tooltip title="Refresh dashboard data">
                <Button
                  type="text"
                  icon={<RefreshCw size={14} />}
                  size="small"
                  className="refresh-button"
                  onClick={handleRefresh}
                  loading={isRefreshing}
                />
              </Tooltip>
            </Text>
            {webSocketStatus === "connected" && (
              <span className="live-indicator">
                <span className="live-dot"></span> Live updates enabled
              </span>
            )}
          </div>
        </div>
        <ConnectionStatus />
      </div>

      <div className="dashboard-stats">
        <StatCard
          title="Total Items"
          value={stats.totalItems.toLocaleString()}
          description="Total items in inventory"
          icon={Package}
          trend="up"
          trendValue="+12.5% from last month"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          description="Users with recent activity"
          icon={Users}
          trend="neutral"
          trendValue="No change from last month"
        />
        <StatCard
          title="Sales This Month"
          value={`$${stats.monthlySales.toLocaleString()}`}
          description="Total sales value this month"
          icon={ShoppingCart}
          trend="up"
          trendValue="+18.2% from last month"
        />
        <StatCard
          title="Purchases This Month"
          value={`$${stats.monthlyPurchases.toLocaleString()}`}
          description="Total purchase value this month"
          icon={ShoppingBag}
          trend="down"
          trendValue="-4.5% from last month"
        />
      </div>

      <div className="dashboard-charts">
        <SalesVsPurchasesChart
          salesData={stats.salesByMonth.map((data) => data.value)}
          purchasesData={stats.purchasesByMonth.map((data) => data.value)}
        />
        <InventoryCategoryChart
          categories={stats.inventoryByCategory.categories}
          data={stats.inventoryByCategory.counts}
        />
      </div>

      <div className="dashboard-charts">
        <TopSellingProductsChart
          products={stats.topSellingProducts.products}
          data={stats.topSellingProducts.counts}
        />
        <RevenueByLocationChart
          locations={stats.revenueByLocation.locations}
          data={stats.revenueByLocation.amounts}
        />
      </div>

      <div className="dashboard-tables">
        <Card
          title="Recent Sales"
          extra={
            webSocketStatus === "connected" && (
              <Badge status="processing" text="Live" />
            )
          }
        >
          <Table
            columns={recentSalesColumns}
            dataSource={stats.recentSales}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        <Card
          title="Low Stock Items"
          extra={
            webSocketStatus === "connected" && (
              <Badge status="processing" text="Live" />
            )
          }
        >
          <Table
            columns={lowStockColumns}
            dataSource={stats.lowStockItems}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    </ThemeTransitionWrapper>
  );
};

export default Dashboard;
