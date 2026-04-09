import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsSection = ({ stats, timeframe, setTimeframe }) => {
  const { theme } = useTheme();

  const chartData = [
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Resolved', value: stats.resolved || 0 },
    { name: 'Reopened', value: stats.reopened || 0 },
  ];

  return (
    <div className={`p-6 rounded-lg mb-8 ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
      <h2 className={`text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${theme.headingGradientFrom} ${theme.headingGradientTo}`}>
        Complaint Analytics
      </h2>

      <div className={`flex space-x-2 border-b pb-2 mb-4 ${theme.footerBorder}`}>
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
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
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke={theme.chartAxisStroke || "#999"}
              tick={{ fill: theme.chartAxisStroke || "#999" }}
            />
            <YAxis
              allowDecimals={false}
              stroke={theme.chartAxisStroke || "#999"}
              tick={{ fill: theme.chartAxisStroke || "#999" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.tooltipBg || "#fff",
                borderColor: theme.cardBorder || "#ccc",
                borderRadius: '0.5rem',
              }}
            />
            <Bar
              dataKey="value"
              fill={theme.chartPrimaryFill || "#6366f1"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsSection;