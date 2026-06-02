"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityData = {
  name: string;
  hours: number;
};

export function ActivityChart({ data }: { data: ActivityData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] w-full flex items-center justify-center text-[13px] text-text-tertiary border border-dashed border-border rounded-lg">
        No activity data available for this period.
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -32, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="hoursGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#CBA365" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#CBA365" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.04)" />
          
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#505055", fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#505055", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "#1A1A1E",
              color: "#F2F2F3",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              fontSize: "13px",
              padding: "10px 14px"
            }}
            itemStyle={{ color: "#F2F2F3", fontWeight: 500 }}
            labelStyle={{ color: "#8A8A8F", marginBottom: "4px" }}
          />
          <Area
            type="monotone"
            dataKey="hours"
            name="Hours"
            fill="url(#hoursGradient)"
            stroke="#CBA365"
            strokeWidth={2}
            activeDot={{ r: 4, fill: "#CBA365", stroke: "#141416", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
