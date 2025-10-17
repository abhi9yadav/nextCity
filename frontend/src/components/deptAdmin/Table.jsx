const Table = ({ columns, data }) => {
  return (
    <table className="min-w-full table-auto">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="px-4 py-2 text-left border-b">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            {row.map((cell, i) => (
              <td key={i} className="px-4 py-2 border-b">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
