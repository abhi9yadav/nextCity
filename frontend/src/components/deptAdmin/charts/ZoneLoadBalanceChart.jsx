import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const ZoneLoadBalanceChart = ({ data }) => {
  const visibleZones = 4;
  const barHeight = 50;
  const containerHeight = visibleZones * barHeight + 80;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Zone Load Balance (Workers vs. Open Complaints)
      </h2>

      <div
        className="overflow-y-auto"
        style={{ maxHeight: `${containerHeight}px` }}
      >
        <ResponsiveContainer width="100%" height={data.length * barHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="zone_name"
              type="category"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip formatter={(value) => [value, ""]} />
            <Legend
              wrapperStyle={{ position: "relative", marginTop: "10px" }}
            />
            <Bar
              dataKey="totalWorkers"
              fill="#3b82f6"
              name="Total Workers"
              radius={[4, 0, 0, 4]}
              barSize={barHeight - 10}
            />
            <Bar
              dataKey="complaints"
              fill="#ef4444"
              name="Open Complaints"
              radius={[4, 0, 0, 4]}
              barSize={barHeight - 10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
