import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import {  MdOutlineDone, MdSync } from "react-icons/md";
import { FiList } from "react-icons/fi";

const TableControls = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  complaints,
}) => {
  const { theme } = useTheme();

  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });



  // 🔥 Counts
  const counts = {
    All: complaints.length,
    IN_PROGRESS: complaints.filter(c => c.status === "IN_PROGRESS").length,
    RESOLVED: complaints.filter(c => c.status === "RESOLVED").length,
    REOPEN: complaints.filter(c => c.status === "REOPEN").length,
  };

  const tabs = [
    { label: "All", value: "All", icon: <FiList /> },
    { label: "In Progress", value: "IN_PROGRESS", icon: <MdSync /> },
    { label: "Resolved", value: "RESOLVED", icon: <MdOutlineDone /> },
    { label: "Reopened", value: "REOPEN", icon: <MdSync /> },
  ];

  // 🔥 FIXED SLIDER POSITION
  useEffect(() => {
    const activeTab = tabRefs.current[statusFilter];
    const container = containerRef.current;

    if (activeTab && container) {
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setSliderStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [statusFilter]);

  const inputClasses = `p-2 border rounded-md bg-transparent ${theme.cardBorder} ${theme.textDefault}`;

  return (
    <div className="mb-6">

      {/* 🔥 Tabs */}
      <div
        ref={containerRef}
        className="relative flex gap-2 mb-4 overflow-x-auto no-scrollbar"
      >
        {/* 🔥 Slider */}
        <div
          className={`absolute bottom-0 h-[3px] rounded-full transition-all duration-300 
          bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo}`}
          style={{
            left: sliderStyle.left,
            width: sliderStyle.width,
          }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.value}
            ref={(el) => (tabRefs.current[tab.value] = el)}
            onClick={() => setStatusFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 relative z-10
              ${
                statusFilter === tab.value
                  ? `${theme.buttonPrimaryText}`
                  : `${theme.textSubtle} ${theme.navButtonHoverBg}`
              }`}
          >
            <span className="text-lg">{tab.icon}</span>

            {tab.label}

            <span
              className={`ml-1 px-2 py-0.5 text-xs rounded-full 
              ${
                statusFilter === tab.value
                  ? "bg-white/20"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* 🔍 Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">

        <h2 className={`text-xl font-bold ${theme.textDefault}`}>
          Your Tasks
        </h2>

        <input
          type="text"
          placeholder="Search complaints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${inputClasses} w-full md:w-64 focus:ring-2 focus:ring-blue-500`}
        />

      </div>
    </div>
  );
};

export default TableControls;