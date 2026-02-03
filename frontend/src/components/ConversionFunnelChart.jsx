import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, CartesianGrid } from 'recharts';

function ConversionFunnelChart({ data }) {
  const funnelData = useMemo(() => {
    const total = data.length;
    const applied = data.filter(a => a.status !== 'Discovered').length;
    const interviewing = data.filter(a => ['Interviewing', 'FollowUp', 'Offer', 'Accepted'].includes(a.status)).length;
    const offers = data.filter(a => ['Offer', 'Accepted'].includes(a.status)).length;

    return [
      { name: 'Total Sourced', value: total, fill: '#94a3b8' },
      { name: 'Applications', value: applied, fill: '#3b82f6' },
      { name: 'Interviews', value: interviewing, fill: '#f59e0b' },
      { name: 'Offers', value: offers, fill: '#10b981' },
    ].reverse(); // Reverse so it looks like a funnel top-to-bottom
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        layout="vertical" 
        data={funnelData} 
        margin={{ left: 20, right: 60, top: 20, bottom: 20 }}
      >
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} style={{ fontWeight: 600 }} />
        <Tooltip cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={50}>
          {funnelData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
          <LabelList dataKey="value" position="right" style={{ fontWeight: 800, fill: '#1e293b', fontSize: '1.1rem' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ConversionFunnelChart;