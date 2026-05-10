import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MonthlyLineChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="chart-loading">
        <div className="spinner"></div>
        <p>Loading chart...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No data available for chart</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    month: item.month,
    income: parseFloat(item.income),
    expenses: parseFloat(item.expenses),
    net: parseFloat(item.net),
  }));

  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={renderTooltip} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#00C49F"
            strokeWidth={3}
            dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#FF8042"
            strokeWidth={3}
            dot={{ fill: '#FF8042', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#0088FE"
            strokeWidth={3}
            dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Net"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyLineChart;
