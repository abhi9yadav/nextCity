import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import StatusBadge from './StatusBadge';
import { ArrowUpDown, ChevronRight } from 'lucide-react';

const ComplaintsTable = ({
  complaints,
  handleOpenModal,
  sortConfig,
  requestSort,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // 🔥 FIX 1: Pass the entire object 'c' into the route state
  const handleRowClick = (c) => {
    navigate(`complaints/${c._id}`, { state: { complaintData: c } });
  };

  const SortableHeader = ({ label, field }) => {
    const isSorted = sortConfig?.key === field;

    return (
      <th
        className="p-4 font-semibold text-sm cursor-pointer select-none hover:bg-gray-50/50 transition-colors"
        onClick={() => requestSort(field)}
      >
        <div className="flex items-center gap-2">
          {label}
          <ArrowUpDown 
            size={14} 
            className={`${isSorted ? 'text-indigo-600' : 'text-gray-400'}`} 
          />
        </div>
      </th>
    );
  };

  return (
    <div
      className={`rounded-xl overflow-hidden border ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">

          {/* HEADER */}
          <thead>
            <tr className={`border-b border-gray-100 ${theme.sectionBgTranslucent} text-gray-600`}>
              <th className="p-4 font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Title</th>
              <SortableHeader label="Created" field="createdAt" />
              <SortableHeader label="Status" field="status" />
              <th className="p-4 font-semibold text-sm text-right">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className={`divide-y divide-gray-100 ${theme.textDefault}`}>
            {complaints.length > 0 ? (
              complaints.map((c) => (
                <tr
                  key={c._id}
                  // 🔥 FIX 2: Send 'c', not 'c._id'
                  onClick={() => handleRowClick(c)}
                  className="group cursor-pointer hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                >
                  {/* Truncated ID for cleaner look */}
                  <td className="p-4 text-sm font-mono text-gray-500">
                    #{c._id.slice(-6).toUpperCase()}
                  </td>

                  <td className="p-4 font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {c.title}
                  </td>

                  <td className="p-4 text-sm text-gray-600">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }).format(new Date(c.createdAt))}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={c.status} />
                  </td>

                  <td className="p-4 flex items-center justify-end gap-3">
                    {/* Quick Update Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents the row click from firing
                        handleOpenModal(c);
                      }}
                      disabled={c.status === 'RESOLVED'}
                      className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold
                        ${
                          c.status === 'RESOLVED'
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 hover:scale-[1.02]'
                        }`}
                    >
                      {c.status === "RESOLVED" ? "Completed" : "Quick Update"}
                    </button>
                    
                    {/* Arrow to indicate navigation */}
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="font-medium text-gray-900 mb-1">No complaints found</p>
                    <p className="text-sm">There are no records to display at this time.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ComplaintsTable;