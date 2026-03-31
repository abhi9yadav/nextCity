// --- UI Components ---
const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REOPEN: 'bg-purple-100 text-purple-800',
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-bold rounded-full ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;