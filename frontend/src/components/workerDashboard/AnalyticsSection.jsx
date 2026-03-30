import React from 'react';
import { useTheme } from '../../hooks/useTheme'; // 1. Import useTheme
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsSection = ({ stats, timeframe, setTimeframe }) => {
  const { theme } = useTheme(); // 2. Get the theme object

  const chartData = [
    { name: 'Pending', value: stats.pendingAssignment || 0 },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Resolved', value: stats.resolved || 0 },
    { name: 'Reopened', value: stats.reopened || 0 },
  ];

  return (
    // 3. Themed main container
    <div className={`p-6 rounded-lg mb-8 ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
      {/* 4. Themed section title */}
      <h2 className={`text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${theme.headingGradientFrom} ${theme.headingGradientTo}`}>
        Complaint Analytics
      </h2>
      <div className={`flex space-x-2 border-b pb-2 mb-4 ${theme.footerBorder}`}>
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            // 5. Themed timeframe buttons
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              timeframe === t
                ? `${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo}`
                : `${theme.textSubtle} ${theme.navButtonHoverBg}`
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            {/* 6. Use theme colors for chart elements */}
            <XAxis dataKey="name" stroke={theme.chartAxisStroke} tick={{ fill: theme.chartAxisStroke }} />
            <YAxis allowDecimals={false} stroke={theme.chartAxisStroke} tick={{ fill: theme.chartAxisStroke }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.tooltipBg,
                borderColor: theme.cardBorder,
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: theme.tooltipText, fontWeight: 'bold' }}
              itemStyle={{ color: theme.chartPrimaryFill }}
            />
            <Bar dataKey="value" fill={theme.chartPrimaryFill} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsSection;