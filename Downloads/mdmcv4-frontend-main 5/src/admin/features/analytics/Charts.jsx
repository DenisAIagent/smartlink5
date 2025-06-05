import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6'];

export const LineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
        <XAxis
          dataKey="date"
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#232326',
            border: '1px solid #2A2A2E',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#E74C3C' }}
          itemStyle={{ color: '#fff' }}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="#E74C3C"
          strokeWidth={2}
          dot={{ fill: '#E74C3C', strokeWidth: 2 }}
          activeDot={{ r: 8, fill: '#E74C3C' }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export const BarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
        <XAxis
          dataKey="name"
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#232326',
            border: '1px solid #2A2A2E',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#E74C3C' }}
          itemStyle={{ color: '#fff' }}
        />
        <Bar
          dataKey="value"
          fill="#E74C3C"
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export const PieChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#232326',
            border: '1px solid #2A2A2E',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#E74C3C' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span style={{ color: '#6B7280' }}>{value}</span>
          )}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}; 