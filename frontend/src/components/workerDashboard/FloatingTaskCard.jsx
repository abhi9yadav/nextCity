import React from 'react';
import { useTheme } from "../../hooks/useTheme";
import { MapPin, CheckCircle, X } from "lucide-react"; // Removed Navigation

export default function FloatingTaskCard({
  task,
  showCompletion, // Seedha completion modal kholne ke liye
  onClose
}) {
  const { theme } = useTheme();

  return (
    <div className={`absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[420px] ${theme.cardBg} border ${theme.cardBorder} shadow-2xl rounded-2xl p-5 z-[1000] transition-all`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-bold text-lg ${theme.textDefault} pr-4 leading-tight`}>
          {task.title}
        </h3>
        <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-500/20 ${theme.textSubtle} transition-colors`}>
          <X size={18} />
        </button>
      </div>

      {/* Location */}
      <div className={`flex items-start gap-2 mb-5 ${theme.textSubtle}`}>
        <MapPin size={16} className="mt-0.5 shrink-0" />
        <p className="text-sm line-clamp-2">
          {task.location?.address || "Address not provided"}
        </p>
      </div>

      {/* Action Button - Simplified to just Resolve */}
      <div className="flex gap-3">
        <button
          onClick={showCompletion} // Click karte hi Completion Modal khulega
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-[1.02] hover:shadow-xl ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo}`}
        >
          <CheckCircle size={18} /> Resolve Complaint
        </button>
      </div>
    </div>
  );
}