"use client";

import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS, type MpesaTransaction } from "@/graphql/transactions";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from "recharts";
import { Loader2, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

interface ChartDataPoint {
  date: string;
  amount: number;
  count: number;
}

const EmptyChart = () => (
  <div className="h-[350px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/50 rounded-lg">
    <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-full mb-4">
      <TrendingUpIcon className="h-6 w-6 text-fuchsia-500 dark:text-fuchsia-400" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
    <p className="text-sm text-muted-foreground max-w-[300px]">
      Start recording transactions to see your revenue analytics here.
    </p>
  </div>
);

const LoadingChart = () => (
  <div className="h-[350px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      <span className="text-sm text-muted-foreground">Loading data...</span>
    </div>
  </div>
);

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">
          Amount: <span className="font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            KES {payload[0].value.toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Transactions: <span className="font-medium text-fuchsia-500 dark:text-fuchsia-400">
            {payload[0].payload.count}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function Overview() {
  const { data, loading } = useQuery(GET_TRANSACTIONS);

  if (loading) return <LoadingChart />;

  // Process transactions data for the chart
  const chartData = data?.mpesaTransactions?.reduce((acc: ChartDataPoint[], transaction: MpesaTransaction) => {
    const date = new Date(transaction.createdAt).toLocaleDateString();
    const existingDay = acc.find((item) => item.date === date);
    
    if (existingDay) {
      existingDay.amount += transaction.amount;
      existingDay.count += 1;
    } else {
      acc.push({
        date,
        amount: transaction.amount,
        count: 1,
      });
    }
    return acc;
  }, []) || [];

  // Sort data by date
  chartData.sort((a: ChartDataPoint, b: ChartDataPoint) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate trend
  const trend = chartData.length >= 2 
    ? ((chartData[chartData.length - 1]?.amount || 0) - (chartData[0]?.amount || 0)) 
    : 0;

  if (chartData.length === 0) return <EmptyChart />;

  return (
    <div className="space-y-4">
      {trend !== 0 && (
        <div className="flex items-center gap-2 px-2">
          {trend > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                <TrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Trending up</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-rose-100 dark:bg-rose-900/20 rounded-full">
                <TrendingDownIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Trending down</span>
            </div>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `KES ${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#gradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 6, 
              style: { fill: '#d946ef', strokeWidth: 0 }
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 