import React from 'react';
import { useTheme } from '../../hooks/useTheme'; // 1. Import useTheme
import StatusBadge from './StatusBadge';

const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ComplaintsTable = ({
  complaints,
  handleOpenModal,
  sortConfig,
  requestSort,
}) => {
  const { theme } = useTheme(); // 2. Get the theme object

  const SortableHeader = ({ label, field }) => {
    const isSorted = sortConfig.key === field;
    const iconPath =
      sortConfig.direction === 'ascending'
        ? 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
        : 'M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z';

    return (
      <th className="p-3 cursor-pointer" onClick={() => requestSort(field)}>
        <div className="flex items-center">
          {label}
          {isSorted && <Icon path={iconPath} className="w-4 h-4 ml-1" />}
        </div>
      </th>
    );
  };

  return (
    // 3. Wrap table in a themed container
    <div className={`rounded-lg overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            {/* 4. Themed table header */}
            <tr className={`border-b ${theme.sectionBgTranslucent} ${theme.footerBorder} ${theme.textSubtle}`}>
              <th className="p-3">Complaint ID</th>
              <th className="p-3">Title</th>
              <SortableHeader label="Created At" field="createdAt" />
              <SortableHeader label="Status" field="status" />
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className={theme.textDefault}>
            {complaints.length > 0 ? (
              complaints.map((c) => (
                // 5. Themed table rows
                <tr key={c._id} className={`border-b ${theme.footerBorder} hover:${theme.navButtonHoverBg}`}>
                  <td className="p-3 font-mono text-sm">{c._id}</td>
                  <td className="p-3">{c.title}</td>
                  <td className={`p-3 text-sm ${theme.textSubtle}`}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-3">
                    {/* 6. Themed action button */}
                    <button
                      onClick={() => handleOpenModal(c)}
                      disabled={c.status === 'RESOLVED'}
                      className={`font-semibold py-1 px-3 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} ${theme.buttonPrimaryHoverBgFrom} ${theme.buttonPrimaryHoverBgTo}`}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* 7. Themed "no data" message */}
                <td colSpan="5" className={`text-center p-10 ${theme.textSubtle}`}>
                  No tasks match your current filters.
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