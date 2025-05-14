"use client";

import { useState } from "react";
import { Card, Radio, Typography } from "antd";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "../../contexts/ThemeContext";

const { Title } = Typography;

interface SalesVsPurchasesChartProps {
  salesData: number[];
  purchasesData: number[];
}

const SalesVsPurchasesChart = ({
  salesData,
  purchasesData,
}: SalesVsPurchasesChartProps) => {
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "yearly">(
    "monthly"
  );
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Sample data for different time ranges
  const timeRangeData = {
    weekly: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      sales: [2100, 1800, 2800, 1900, 2400, 3100, 2700],
      purchases: [1700, 1400, 2100, 1600, 1900, 2300, 2000],
    },
    monthly: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      sales: salesData,
      purchases: purchasesData,
    },
    yearly: {
      categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
      sales: [42000, 52000, 48000, 61000, 72000, 85000],
      purchases: [35000, 41000, 36000, 51000, 58000, 69000],
    },
  };

  const currentData = timeRangeData[timeRange];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      background: "transparent",
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#1677ff", "#52c41a"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: currentData.categories,
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
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`,
        style: {
          colors: isDarkMode ? "#a0a0a0" : "#777",
        },
      },
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
      y: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
      theme: isDarkMode ? "dark" : "light",
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: isDarkMode ? "#a0a0a0" : "#777",
      },
    },
    grid: {
      borderColor: isDarkMode ? "#303030" : "#f1f1f1",
    },
  };

  const series = [
    {
      name: "Sales",
      data: currentData.sales,
    },
    {
      name: "Purchases",
      data: currentData.purchases,
    },
  ];

  return (
    <Card className="chart-card">
      <div className="chart-card-header">
        <div className="chart-filters">
          <Radio.Group
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="weekly">Weekly</Radio.Button>
            <Radio.Button value="monthly">Monthly</Radio.Button>
            <Radio.Button value="yearly">Yearly</Radio.Button>
          </Radio.Group>
        </div>
        <Title level={5}>Sales vs Purchases</Title>
      </div>
      <div className="chart-container">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={300}
        />
      </div>
    </Card>
  );
};

export default SalesVsPurchasesChart;
