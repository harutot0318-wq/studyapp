"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function SimpleLineChart<T extends { date: string }>({
  data,
  dataKey,
}: {
  data: T[];
  dataKey: keyof T & string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} domain={[0, "dataMax"]} />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke="#111827" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
