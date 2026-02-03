import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths } from 'date-fns';

function ActivityLineChart({ data }) {
  const chartData = useMemo(() => {
    const monthCounts = {};
    for (let i = 5; i >= 0; i--) {
      monthCounts[format(subMonths(new Date(), i), 'MMM yyyy')] = 0;
    }
    data.forEach(app => {
      const key = format(new Date(app.createdAt), 'MMM yyyy');
      if (monthCounts.hasOwnProperty(key)) monthCounts[key]++;
    });
    return Object.entries(monthCounts).map(([name, count]) => ({ name, count }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default ActivityLineChart;