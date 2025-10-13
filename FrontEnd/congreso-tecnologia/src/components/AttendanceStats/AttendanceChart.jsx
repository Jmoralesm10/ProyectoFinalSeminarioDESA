import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './Charts.css';

const AttendanceChart = ({ stats }) => {
  const data = [
    {
      name: 'Asistieron',
      value: stats.total_asistencia_general,
      color: '#27ae60'
    },
    {
      name: 'No Asistieron',
      value: stats.total_usuarios_registrados - stats.total_asistencia_general,
      color: '#e74c3c'
    }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // No mostrar etiquetas para porcentajes muy pequeños
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">
            {data.value} usuarios
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="attendance-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="chart-summary">
        <div className="summary-item">
          <div className="summary-color" style={{ backgroundColor: '#27ae60' }}></div>
          <span>Asistieron: {stats.total_asistencia_general}</span>
        </div>
        <div className="summary-item">
          <div className="summary-color" style={{ backgroundColor: '#e74c3c' }}></div>
          <span>No Asistieron: {stats.total_usuarios_registrados - stats.total_asistencia_general}</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
