import React, { useState } from 'react';
import './AttendanceTable.css';

const AttendanceTable = ({ activities }) => {
  const [sortField, setSortField] = useState('total_asistentes');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedActivities = [...activities].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="no-data-table">
        <div className="no-data-icon">📊</div>
        <p>No hay datos de actividades disponibles</p>
      </div>
    );
  }

  return (
    <div className="attendance-table-container">
      <div className="table-header">
        <h4>Ranking de Actividades por Asistencia</h4>
        <p>Total de {activities.length} actividades registradas</p>
      </div>
      
      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th className="rank-column">Rank</th>
              <th 
                className="sortable"
                onClick={() => handleSort('nombre_actividad')}
              >
                Actividad {getSortIcon('nombre_actividad')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('total_asistentes')}
              >
                Asistentes {getSortIcon('total_asistentes')}
              </th>
              <th>Popularidad</th>
            </tr>
          </thead>
          <tbody>
            {sortedActivities.map((activity, index) => {
              const maxAttendance = Math.max(...activities.map(a => a.total_asistentes));
              const popularityPercentage = maxAttendance > 0 
                ? Math.round((activity.total_asistentes / maxAttendance) * 100) 
                : 0;
              
              return (
                <tr key={activity.id_actividad}>
                  <td className="rank-cell">
                    <span className="rank-icon">
                      {getRankIcon(index)}
                    </span>
                  </td>
                  <td className="activity-name-cell">
                    <div className="activity-name">
                      {activity.nombre_actividad}
                    </div>
                    <div className="activity-id">
                      ID: {activity.id_actividad}
                    </div>
                  </td>
                  <td className="attendance-cell">
                    <div className="attendance-number">
                      {activity.total_asistentes}
                    </div>
                    <div className="attendance-label">
                      asistentes
                    </div>
                  </td>
                  <td className="popularity-cell">
                    <div className="popularity-bar">
                      <div 
                        className="popularity-fill"
                        style={{ width: `${popularityPercentage}%` }}
                      ></div>
                    </div>
                    <div className="popularity-percentage">
                      {popularityPercentage}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        <div className="table-stats">
          <div className="stat-item">
            <span className="stat-label">Total de Actividades:</span>
            <span className="stat-value">{activities.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total de Asistentes:</span>
            <span className="stat-value">
              {activities.reduce((sum, activity) => sum + activity.total_asistentes, 0)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Promedio por Actividad:</span>
            <span className="stat-value">
              {Math.round(activities.reduce((sum, activity) => sum + activity.total_asistentes, 0) / activities.length)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
