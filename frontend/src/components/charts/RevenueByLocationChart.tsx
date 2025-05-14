"use client";

import { Card, Typography } from "antd";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "../../contexts/ThemeContext";

const { Title } = Typography;

interface RevenueByLocationChartProps {
  locations: string[];
  data: number[];
}

const RevenueByLocationChart = ({
  locations,
  data,
}: RevenueByLocationChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 350,
      toolbar: {
        show: false,
      },
      background: "transparent",
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
    labels: locations,
    colors: ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: isDarkMode ? "#a0a0a0" : "#777",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Revenue",
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                return `$${sum.toLocaleString()}`;
              },
              color: isDarkMode ? "#a0a0a0" : "#777",
            },
          },
        },
      },
    },
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
        formatter: (val) => `$${val.toLocaleString()}`,
      },
      theme: isDarkMode ? "dark" : "light",
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
  };

  const series = data;

  return (
    <Card className="chart-card">
      <div className="chart-card-header">
        <Title level={5}>Revenue by Location</Title>
      </div>
      <div className="chart-container">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={300}
        />
      </div>
    </Card>
  );
};

export default RevenueByLocationChart;
