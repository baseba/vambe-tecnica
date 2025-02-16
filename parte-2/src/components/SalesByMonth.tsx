"use client";

// filepath: /home/sebastian/prueba-tecnica/parte-2/src/components/SalesByMonth.tsx
import React, { useMemo } from "react";
import {
    ComposedChart,
    Line,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export interface CallData {
  id: string;
  transcript: string;
  saleClosed: boolean;
  email: string;
  name: string;
  phone: string;
  date: string;
  vendor: string;
}

interface SalesByMonthProps {
  callData: CallData[];
}

const SalesByMonth: React.FC<SalesByMonthProps> = ({ callData }) => {
  // Prepare monthly aggregated data with total and per vendor counts.
  const { monthlyData, vendorList } = useMemo(() => {
    type MonthData = {
      key: string;
      month: string;
      total: number;
      [vendor: string]: number | string;
    };

    const salesMap: Record<string, MonthData> = {};
    const vendorSet = new Set<string>();

    callData.forEach((call) => {
      if (call.saleClosed) {
        const dateObj = new Date(call.date);
        const key = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        if (!salesMap[key]) {
          const formattedMonth = new Intl.DateTimeFormat("en-US", {
            month: "short",
            year: "numeric",
          }).format(dateObj);
          salesMap[key] = { key, month: formattedMonth, total: 0 };
        }
        salesMap[key].total += 1;
        // Increment count per vendor.
        vendorSet.add(call.vendor);
        salesMap[key][call.vendor] = (salesMap[key][call.vendor] as number | undefined ?? 0) + 1;
      }
    });

    const monthlyData = Object.values(salesMap).sort((a, b) =>
      a.key.localeCompare(b.key)
    );
    const vendorList = Array.from(vendorSet).sort();
    return { monthlyData, vendorList };
  }, [callData]);

  // Pre-defined colors for vendor bars.
  const vendorColors = [
    "#ff7300",
    "#387908",
    "#0088FE",
    "#d0ed57",
    "#a28dd0",
    "#d04747",
    "#47d0b2",
  ];

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Render a stacked bar for each vendor */}
            {vendorList.map((vendor, index) => (
              <Bar
                key={vendor}
                dataKey={vendor}
                name={vendor}
                fill={vendorColors[index % vendorColors.length]}
                stackId="vendorStack"
                barSize={20}
              />
            ))}
            {/* Thick line for Total Sales */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              strokeWidth={3}
              activeDot={{ r: 8 }}
              name="Total Sales"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesByMonth;