import React from 'react';
import { useTheme } from '../../hooks/useTheme'; // 1. Import useTheme

// A small helper component for individual stat cards
const StatCard = ({ title, value, borderColorClass }) => {
  const { theme } = useTheme(); // Each card can access the theme

  return (
    // Applied theme for bg, shadow, border, and the specific status border color
    <div className={`p-6 rounded-lg border-l-4 ${theme.cardBg} ${theme.cardShadow} ${theme.cardBorder} ${borderColorClass}`}>
      <h2 className={theme.textSubtle}>{title}</h2>
      <p className={`text-3xl font-bold ${theme.textDefault}`}>{value}</p>
    </div>
  );
};


const StatsGrid = ({ stats }) => {
  const { theme } = useTheme(); // Get theme for the mapping

  // Map stats to their titles and theme border properties
  const statCards = [
    { title: 'Pending Assignment', value: stats.pendingAssignment || 0, borderColor: theme.statusPendingBorder },
    { title: 'In Progress', value: stats.inProgress || 0, borderColor: theme.statusInProgressBorder },
    { title: 'Reopened', value: stats.reopened || 0, borderColor: theme.statusReopenedBorder },
    { title: 'Resolved', value: stats.resolved || 0, borderColor: theme.statusResolvedBorder },
    { title: 'Total Assigned', value: stats.totalAssigned || 0, borderColor: theme.statusTotalBorder },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map(card => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          borderColorClass={card.borderColor}
        />
      ))}
    </div>
  );
};

export default StatsGrid;