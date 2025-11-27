import React, { useContext, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThemeContext } from '../../contexts/ThemeContext';

const processData = (appointments) => {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeklyData = daysOfWeek.map(day => ({ name: day, preenchidas: 0 }));

  appointments.forEach(appointment => {
    const date = new Date(appointment.date);
    const dayIndex = date.getDay();
    weeklyData[dayIndex].preenchidas += 1;
  });

  return weeklyData;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border">
        <p className="font-bold text-text">{`${label}`}</p>
        <p className="text-sm text-primary">{`Vagas: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const DashboardChart = ({ data }) => {
  const { theme } = useContext(ThemeContext);
  const [colors, setColors] = useState({
    tick: '#6b7280',
    grid: '#e5e7eb',
    bar: '#0891b2'
  });

  useEffect(() => {
    // Recharts doesn't always play nice with CSS variables, so we get them from the computed style
    const style = getComputedStyle(document.documentElement);
    setColors({
      tick: style.getPropertyValue('--text-muted').trim(),
      grid: style.getPropertyValue('--border').trim(),
      bar: style.getPropertyValue('--primary').trim()
    });
  }, [theme]);

  const chartData = processData(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="name" tick={{ fill: colors.tick }} tickLine={{ stroke: colors.tick }} />
        <YAxis tick={{ fill: colors.tick }} tickLine={{ stroke: colors.tick }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--primary), 0.1)' }} />
        <Legend iconType="circle" />
        <Bar dataKey="preenchidas" name="Vagas Preenchidas" fill={colors.bar} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DashboardChart;
