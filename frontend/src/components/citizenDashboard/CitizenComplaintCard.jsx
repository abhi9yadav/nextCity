import React from "react";

const CitizenComplaintCard = ({ complaint, onClick }) => {
  const {
    _id,
    title,
    concernedDepartment,
    status,
    createdAt,
    attachments = [],
    votes = [],
    location,
  } = complaint;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border p-3 cursor-pointer hover:shadow-lg transition transform hover:-translate-y-0.5"
    >
      <img
        src={attachments[0]?.url || "https://cdn-icons-png.flaticon.com/512/2698/2698508.png"}
        alt={title}
        className="w-full h-36 object-cover rounded-md mb-2"
      />

      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{concernedDepartment}</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100">{status}</span>
      </div>

      <div className="flex justify-between items-center mt-3 text-xs text-gray-600">
        <span>ID: {_id?.toString().slice(-6)}</span>
        <span>{createdAt ? new Date(createdAt).toLocaleDateString("en-IN") : "—"}</span>
      </div>
    </div>
  );
};

export default CitizenComplaintCard;
