"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
} from "recharts";

// Strictly styled chart wrapper
export function ChartCard({
  title,
  subtitle,
  data,
  kind,
}: {
  title: string;
  subtitle: string;
  data: Array<{ name: string; hours?: number; value?: number }>;
  kind: "line" | "bar" | "pie";
}) {
  const accent = "#CBA365";
  const pieColors = ["#CBA365", "rgba(203,163,101,0.7)", "rgba(203,163,101,0.4)", "rgba(203,163,101,0.2)", "rgba(203,163,101,0.08)"];

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-text-tertiary">{title}</h3>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "line" ? (
            <LineChart data={data} margin={{ left: -32, right: 0, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#505055", fontSize: 10 }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#505055", fontSize: 10 }} />
              <Tooltip cursor={{ stroke: "rgba(255,255,255,0.06)" }} contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.10)", background: "#1A1A1E", color: "#F2F2F3", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", fontSize: "12px", padding: "8px 12px" }} itemStyle={{ color: accent }} />
              <Line type="monotone" dataKey="hours" stroke={accent} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: accent, stroke: "#141416", strokeWidth: 2 }} />
            </LineChart>
          ) : kind === "bar" ? (
            <BarChart data={data} margin={{ left: -32, right: 0, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#505055", fontSize: 10 }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#505055", fontSize: 10 }} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.10)", background: "#1A1A1E", color: "#F2F2F3", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", fontSize: "12px", padding: "8px 12px" }} itemStyle={{ color: accent }} />
              <Bar dataKey="hours" fill={accent} radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <Pie data={data} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="rgba(255,255,255,0.06)" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.10)", background: "#1A1A1E", color: "#F2F2F3", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", fontSize: "12px", padding: "8px 12px" }} itemStyle={{ color: "#F2F2F3" }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
