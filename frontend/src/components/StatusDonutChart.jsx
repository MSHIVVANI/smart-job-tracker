import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Box } from '@mui/material';

const statusColors = {
  Accepted: '#10b981', Offer: '#34d399', Interviewing: '#f59e0b',
  FollowUp: '#8b5cf6', Applied: '#3b82f6', Discovered: '#94a3b8', Rejected: '#ef4444',
};

function StatusDonutChart({ data }) {
  const chartData = useMemo(() => {
    const counts = data.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (!chartData.length) return <Typography align="center" sx={{ mt: 10 }}>No data to display</Typography>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%" cy="45%"
          innerRadius="65%" outerRadius="85%"
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={statusColors[entry.name] || '#CBD5E1'} stroke="none" />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        />
        <Legend verticalAlign="bottom" align="center" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default StatusDonutChart;