"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Upload } from "lucide-react"

interface CallData {
  id: string
  transcript: string
  saleClosed: boolean
}

export default function Dashboard() {
  const [callData, setCallData] = useState<CallData[]>([])

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    Papa.parse<string[]>(file, {
      complete: (result: Papa.ParseResult<string[]>) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log("Parsed CSV data:", result.data) // Log the parsed data for debugging
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const rows = result.data as string[][]
        const parsedData: CallData[] = rows
          .slice(1) // Remove header row if present
          .filter((row: string[]) => row.length >= 2) // Ensure row has at least 2 elements
          .map((row: string[], index: number) => {
            if (typeof row[0] === "undefined" || typeof row[1] === "undefined") {
              console.warn(`Skipping row ${index + 1} due to missing data:`, row)
              return null
            }
            return {
              id: `call-${index + 1}`,
              transcript: row[0] || "",
              saleClosed: row[1].toLowerCase() === "true",
            }
          })
          .filter((item: CallData | null): item is CallData => item !== null)
        console.log("Processed data:", parsedData) // Log the processed data
        setCallData(parsedData)
      },
      header: false,
      error: (error: Papa.ParseError) => {
        console.error("Error parsing CSV:", error)
      },
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const closedSales = callData.filter((call) => call.saleClosed).length
  const openSales = callData.length - closedSales

  const chartData = [
    { name: "Closed Sales", value: closedSales },
    { name: "Open Sales", value: openSales },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Business Call Dashboard</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    <Bar dataKey="value" fill="#8884d8" />
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
                    <p className="text-3xl font-bold">{callData.length}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Closed Sales</h3>
                    <p className="text-3xl font-bold">{closedSales}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Open Sales</h3>
                    <p className="text-3xl font-bold">{openSales}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Conversion Rate</h3>
                    <p className="text-3xl font-bold">{((closedSales / callData.length) * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Transcript</TableHead>
                    <TableHead>Sale Closed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callData.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>{call.id}</TableCell>
                      <TableCell>{call.transcript.substring(0, 100)}...</TableCell>
                      <TableCell>{call.saleClosed ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

