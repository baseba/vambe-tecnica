"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

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

interface CallDetailsTableProps {
  callData: CallData[];
}

export default function CallDetailsTable({ callData }: CallDetailsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Phone</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Vendor</TableCell>
          <TableCell>Sale Closed</TableCell>
          <TableCell>Transcript</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {callData.map((call) => (
          <TableRow key={call.id}>
            <TableCell>{call.id}</TableCell>
            <TableCell>{call.date}</TableCell>
            <TableCell>{call.name}</TableCell>
            <TableCell>{call.phone}</TableCell>
            <TableCell>{call.email}</TableCell>
            <TableCell>{call.vendor}</TableCell>
            <TableCell>{call.saleClosed ? "Yes" : "No"}</TableCell>
            <TableCell>{call.transcript.substring(0, 100)}...</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}