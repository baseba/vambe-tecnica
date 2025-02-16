"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface CallData {
  id: string;
  transcript: string;
  saleClosed: boolean;
  email: string;
  name: string;
  phone: string;
  date: string;
  vendor: string;
}

interface ConversionRateByVendorProps {
  callData: CallData[];
}

const ConversionRateByVendor: React.FC<ConversionRateByVendorProps> = ({ callData }) => {
  const vendorData = Object.values(
    callData.reduce((acc, call) => {
      if (!call) return acc;
      if (!acc) return acc;
      if (!acc[call.vendor]) {
        acc[call.vendor] = { vendor: call.vendor, total: 0, closed: 0 };
      }
      acc[call.vendor]!.total += 1;
      if (call.saleClosed) acc[call.vendor]!.closed += 1;
      return acc;
    }, {} as Record<string, { vendor: string; total: number; closed: number }>)
  ).map(({ vendor, total, closed }) => ({
    vendor,
    conversionRate: total ? parseFloat(((closed / total) * 100).toFixed(2)) : 0,
    total,
    closed,
    totalLabel:  closed + ' sales ' + ' out of ' + total + ' calls',
  }));

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Conversion Rate by Vendor</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vendorData}>
            <CartesianGrid strokeDasharray="3" />
            <XAxis dataKey="vendor" />
            <YAxis
              label={{
                value: "%",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="conversionRate" fill="#3F2E56">
              <LabelList dataKey="totalLabel" position="middle" fill="#dddddd" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ConversionRateByVendor;