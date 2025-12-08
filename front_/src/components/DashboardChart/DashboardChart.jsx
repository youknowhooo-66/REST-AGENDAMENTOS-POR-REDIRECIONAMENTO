import React, { useContext, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-[var(--border)]">
        <p className="font-bold text-text">{`${label}`}</p>
        <p className="text-sm text-primary">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const DashboardChart = ({ data, dataKeyX = "name", dataKeyY = "bookings", nameKey = "Bookings" }) => {
  const { theme } = useTheme();
  const [colors, setColors] = useState({
    tick: '#6b7280',
    grid: '#e5e7eb',
    bar: '#0891b2'
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      tick: style.getPropertyValue('--text-muted').trim(),
      grid: style.getPropertyValue('--border').trim(),
      bar: style.getPropertyValue('--primary').trim()
    });
  }, [theme]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey={dataKeyX} tick={{ fill: colors.tick }} tickLine={{ stroke: colors.tick }} />
        <YAxis tick={{ fill: colors.tick }} tickLine={{ stroke: colors.tick }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--primary), 0.1)' }} />
        <Legend iconType="circle" />
        <Bar dataKey={dataKeyY} name={nameKey} fill={colors.bar} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DashboardChart;
