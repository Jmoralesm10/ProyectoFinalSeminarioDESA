import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Charts.css';

const PopularActivitiesChart = ({ activities }) => {
  // Preparar datos para el gráfico
  const chartData = activities.map((activity, index) => ({
    name: activity.nombre_actividad.length > 20 
      ? activity.nombre_actividad.substring(0, 20) + '...' 
      : activity.nombre_actividad,
    fullName: activity.nombre_actividad,
    asistentes: activity.total_asistentes,
    color: `hsl(${(index * 60) % 360}, 70%, 50%)` // Colores dinámicos
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.fullName}</p>
          <p className="tooltip-value">
            {data.asistentes} asistentes
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { fill, payload, ...rest } = props;
    return <Bar {...rest} fill={payload.color} />;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="no-activities">
        <div className="no-activities-icon">📊</div>
        <p>No hay datos de actividades disponibles</p>
      </div>
    );
  }

  return (
    <div className="popular-activities-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis 
            dataKey="name" 
            stroke="#6c757d"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6c757d"
            fontSize={12}
            label={{ value: 'Asistentes', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="asistentes" 
            shape={<CustomBar />}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="activities-summary">
        <h4>Top {activities.length} Actividades</h4>
        <div className="activities-list">
          {activities.slice(0, 3).map((activity, index) => (
            <div key={activity.id_actividad} className="activity-item">
              <div className="activity-rank">#{index + 1}</div>
              <div className="activity-info">
                <div className="activity-name">{activity.nombre_actividad}</div>
                <div className="activity-count">{activity.total_asistentes} asistentes</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularActivitiesChart;
