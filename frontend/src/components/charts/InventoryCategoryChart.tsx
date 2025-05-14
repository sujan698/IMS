"use client";

import { Card, Typography } from "antd";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "../../contexts/ThemeContext";

const { Title } = Typography;

interface InventoryCategoryChartProps {
  categories: string[];
  data: number[];
}

const InventoryCategoryChart = ({
  categories,
  data,
}: InventoryCategoryChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
      background: "transparent",
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#1677ff"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: isDarkMode ? "#a0a0a0" : "#777",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Items",
        style: {
          color: isDarkMode ? "#a0a0a0" : "#777",
        },
      },
      labels: {
        style: {
          colors: isDarkMode ? "#a0a0a0" : "#777",
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} items`,
      },
      theme: isDarkMode ? "dark" : "light",
    },
    grid: {
      borderColor: isDarkMode ? "#303030" : "#f1f1f1",
    },
  };

  const series = [
    {
      name: "Items",
      data,
    },
  ];

  return (
    <Card className="chart-card">
      <div className="chart-card-header">
        <Title level={5}>Inventory by Category</Title>
      </div>
      <div className="chart-container">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={300}
        />
      </div>
    </Card>
  );
};

export default InventoryCategoryChart;
