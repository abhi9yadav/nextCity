import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const ComplaintsByStatusChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-96">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Complaints by Status
      </h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={false}
          />{" "}
          {/* Cleaner grid */}
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name, props) => [
              `${value} (${props.payload.percentage}%)`,
              name,
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
