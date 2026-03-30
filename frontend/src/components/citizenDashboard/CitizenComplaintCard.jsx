import React from "react";
import { useTheme } from "../../hooks/useTheme"; // 1. Import the theme hook

const CitizenComplaintCard = ({ complaint, onClick }) => {
  const { theme } = useTheme(); // 2. Get the theme object

  const {
    _id,
    title,
    concernedDepartment,
    status,
    createdAt,
    attachments = [],
  } = complaint;

  return (
    // 3. Apply theme styles to the main card container
    <div
      onClick={onClick}
      className={`rounded-lg p-3 cursor-pointer transition transform hover:-translate-y-0.5 
        ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow} 
        ${theme.cardHoverBorder} ${theme.cardHoverShadow}`}
    >
      <img
        src={attachments[0]?.url || "https://cdn-icons-png.flaticon.com/512/2698/2698508.png"}
        alt={title}
        className="w-full h-36 object-cover rounded-md mb-3"
      />

      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* 4. Apply theme styles to text */}
          <h4 className={`font-semibold text-sm line-clamp-1 ${theme.textDefault}`}>{title}</h4>
          <p className={`text-xs line-clamp-1 mt-1 ${theme.textSubtle}`}>{concernedDepartment}</p>
        </div>
        {/* 5. Apply theme styles to the status badge */}
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${theme.aiButtonBg} ${theme.primaryAccentTextSubtle} ${theme.aiButtonBorder}`}>
          {status}
        </span>
      </div>

      <div className={`flex justify-between items-center mt-3 text-xs ${theme.textCardDescription}`}>
        <span>ID: {_id?.toString().slice(-6)}</span>
        <span>{createdAt ? new Date(createdAt).toLocaleDateString("en-IN") : "—"}</span>
      </div>
    </div>
  );
};

export default CitizenComplaintCard;