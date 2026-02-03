import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subMonths } from 'date-fns';

function StatusTrendsChart({ data }) {
  const chartData = useMemo(() => {
    const stats = {};
    for (let i = 4; i >= 0; i--) {
      stats[format(subMonths(new Date(), i), 'MMM')] = { Interviewing: 0, Rejected: 0, Offer: 0 };
    }
    data.forEach(app => {
      const month = format(new Date(app.createdAt), 'MMM');
      if (stats[month] && ['Interviewing', 'Rejected', 'Offer'].includes(app.status)) {
        stats[month][app.status]++;
      }
    });
    return Object.entries(stats).map(([name, val]) => ({ name, ...val }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
        <Bar dataKey="Interviewing" stackId="a" fill="#f59e0b" barSize={50} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Rejected" stackId="a" fill="#ef4444" barSize={50} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Offer" stackId="a" fill="#10b981" barSize={50} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default StatusTrendsChart;