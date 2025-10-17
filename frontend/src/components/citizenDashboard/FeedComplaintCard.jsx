import React, { useState } from "react";
import { ThumbsUp, MessageCircle, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusStyles = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  CLOSED: "bg-green-100 text-green-800",
};

const CitizenComplaintCard = ({ complaint, onUpvote }) => {
  const {
    title,
    description,
    status = "OPEN",
    createdAt,
    attachments = [],
    location,
    votes = [],
  } = complaint;

  const [currentMedia, setCurrentMedia] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  const nextMedia = () => setCurrentMedia((prev) => (prev + 1) % attachments.length);
  const prevMedia = () =>
    setCurrentMedia((prev) => (prev - 1 + attachments.length) % attachments.length);

  const upvoteCount = votes.length;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all max-w-md mx-auto relative">
      {/* --- Media Carousel --- */}
      {attachments.length > 0 && (
        <div className="relative w-full h-64 bg-gray-100">
          <AnimatePresence>
            <motion.img
              key={attachments[currentMedia]?.url || currentMedia}
              src={attachments[currentMedia]?.url || attachments[currentMedia]}
              alt="Complaint media"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-64 object-cover"
            />
          </AnimatePresence>

          {attachments.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-1"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={nextMedia}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-1"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded">
            {currentMedia + 1}/{attachments.length}
          </div>
        </div>
      )}

      {/* --- Content --- */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">{title}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
            {status}
          </span>
        </div>

        <p
          className={`text-gray-600 text-sm mt-1 ${
            descExpanded ? "line-clamp-none" : "line-clamp-3"
          }`}
        >
          {description}
        </p>
        {description?.length > 120 && (
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="text-blue-600 text-xs font-semibold mt-1"
          >
            {descExpanded ? "Show Less" : "Read More"}
          </button>
        )}

        {/* --- Location --- */}
        {location?.address && (
          <p className="text-xs text-gray-500 mt-2">📍 {location.address}</p>
        )}

        {/* --- Footer Actions --- */}
        <div className="flex items-center justify-between mt-3 border-t border-gray-100 pt-2">
          <button
            onClick={onUpvote}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition cursor-pointer"
          >
            <ThumbsUp size={16} /> {upvoteCount}
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
            <MessageCircle size={16} /> 0
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
            <Share2 size={16} /> Share
          </button>
          <span className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CitizenComplaintCard;
