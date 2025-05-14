"use client";

import { Card, Typography } from "antd";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "../../contexts/ThemeContext";

const { Title } = Typography;

interface TopSellingProductsChartProps {
  products: string[];
  data: number[];
}

const TopSellingProductsChart = ({
  products,
  data,
}: TopSellingProductsChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "pie",
      height: 350,
      toolbar: {
        show: false,
      },
      background: "transparent",
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
    labels: products,
    colors: [
      "#1677ff",
      "#52c41a",
      "#faad14",
      "#ff4d4f",
      "#722ed1",
      "#13c2c2",
      "#eb2f96",
    ],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: isDarkMode ? "#a0a0a0" : "#777",
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(Number(val))}%`,
      style: {
        fontSize: "12px",
        colors: ["#fff"],
      },
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} units`,
      },
      theme: isDarkMode ? "dark" : "light",
    },
  };

  const series = data;

  return (
    <Card className="chart-card">
      <div className="chart-card-header">
        <Title level={5}>Top Selling Products</Title>
      </div>
      <div className="chart-container">
        <ReactApexChart
          options={options}
          series={series}
          type="pie"
          height={300}
        />
      </div>
    </Card>
  );
};

export default TopSellingProductsChart;
