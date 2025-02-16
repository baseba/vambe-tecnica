"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Upload } from "lucide-react";
import type { ParseResult } from "papaparse";
import CallDetailsTable from "~/components/CallsDetailsTable";
import ConversionRateByVendor from "~/components/ConversionRateByVendor";
import SalesByMonth from "~/components/SalesByMonth";

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

export default function Dashboard() {
  const [callData, setCallData] = useState<CallData[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    //DONT REMOVE NEXT LINE
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    Papa.parse<string[]>(file, {
      header: false,
      complete: (result: Papa.ParseResult<string[]>) => {
        //DONT REMOVE NEXT LINE
        //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const rows = result.data;
        if (Array.isArray(rows)) {
          const parsedData: CallData[] = rows
            .slice(1) // skip header row
            .filter(
              (row): row is string[] => Array.isArray(row) && row.length >= 7,
            )
            .map((row, index) => {
              const saleClosedStr = row[5];
              const transcript = row[6];
              const email = row[1];
              const name = row[0];
              const phone = row[2];
              const date = row[3];
              const vendor = row[4];

              if (
                typeof saleClosedStr !== "string" ||
                typeof transcript !== "string" ||
                typeof email !== "string" ||
                typeof name !== "string" ||
                typeof phone !== "string" ||
                typeof date !== "string" ||
                typeof vendor !== "string"
              ) {
                console.warn(
                  `Skipping row ${index + 1} due to invalid data:`,
                  row,
                );
                return null;
              }

              const saleClosed = saleClosedStr.toLowerCase() === "1";
              const dateFormated = new Date(date);

              return {
                id: `call-${index + 1}`,
                transcript,
                saleClosed,
                email,
                name,
                phone,
                date: dateFormated.toDateString(),
                vendor,
              };
            })
            .filter((item): item is CallData => item !== null);

          setCallData(parsedData);
        } else {
          console.error("Parsed data is not an array.");
        }
      },
      error: (error: Error, file: File) => {
        console.error("Error parsing CSV file:", error, file);
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const closedSales = callData.filter((call) => call.saleClosed).length;
  const openSales = callData.length - closedSales;

  const chartData = [
    { name: "Closed Sales", value: closedSales },
    { name: "Open Sales", value: openSales },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Business Call Dashboard</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the CSV file here...</p>
            ) : (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p>Drag and drop a CSV file here, or click to select a file</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {callData.length > 0 && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#401F3E" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Total Calls</h3>
                    <p className="w-36 rounded-lg bg-[#3F2E56] p-2 text-3xl font-bold text-slate-200">
                      {callData.length}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Closed Sales</h3>
                    <p className="w-36 rounded-lg bg-[#453F78] p-2 text-3xl font-bold text-slate-200">
                      {closedSales}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Open Sales</h3>
                    <p className="w-36 rounded-lg bg-[#759AAB] p-2 text-3xl font-bold text-slate-900">
                      {openSales}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Conversion Rate</h3>
                    <p className="w-36 rounded-lg bg-[#FAF2A1] p-2 text-3xl font-bold text-slate-900">
                      {((closedSales / callData.length) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <ConversionRateByVendor callData={callData} />
          <SalesByMonth callData={callData} />

          <Card>
            <CardHeader>
              <CardTitle>Call Details</CardTitle>
            </CardHeader>

            <CardContent>
              <CallDetailsTable callData={callData} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
