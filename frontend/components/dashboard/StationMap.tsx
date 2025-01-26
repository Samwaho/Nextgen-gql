"use client";

import { useQuery } from "@apollo/client";
import { GET_STATIONS } from "@/graphql/station";
import type { Station } from "@/graphql/station";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from "recharts";
import { Loader2, MapPinIcon, BuildingIcon } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  total: number;
}

const COLORS = [
  "#0ea5e9", // sky-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#f43f5e", // rose-500
  "#6366f1", // indigo-500
];

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[300px]">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
    <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading stations...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[300px] text-center">
    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
      <MapPinIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No stations yet</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
      Add stations to see their distribution here
    </p>
  </div>
);

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    payload: ChartData;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <BuildingIcon className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Stations: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Percentage: <span className="font-medium">{Math.round((data.value / data.total) * 100)}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

const CustomLegend = ({ payload }: LegendProps) => {
  if (!payload) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div 
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function StationMap() {
  const { data, loading } = useQuery(GET_STATIONS);

  if (loading) return <LoadingState />;

  const stations = data?.stations || [];
  if (stations.length === 0) return <EmptyState />;
  
  // Group stations by building type
  const stationsByType = stations.reduce((acc: Record<string, number>, station: Station) => {
    const type = station.buildingType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = stations.length;
  const chartData: ChartData[] = Object.entries(stationsByType)
    .map(([name, value]) => ({
      name,
      value: Number(value),
      total
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {total} Total Stations
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Across {Object.keys(stationsByType).length} building types
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Most common: {chartData[0]?.name}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="stroke-white dark:stroke-gray-800 stroke-2"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 