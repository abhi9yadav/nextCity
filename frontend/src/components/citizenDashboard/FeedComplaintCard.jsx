import React, { useState } from 'react';
import axios from 'axios';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/authContext';
import { useTheme } from '../../hooks/useTheme'; // 1. Import useTheme

const CitizenComplaintCard = ({ complaint }) => {
  const { theme } = useTheme(); // 2. Get the theme object
  const { currentUser } = useAuth();
  
  // Create a new status style map using the theme
  const themedStatusStyles = {
    OPEN: `${theme.statusOpenBg} ${theme.statusOpenText}`,
    IN_PROGRESS: `${theme.statusInProgressBg} ${theme.statusInProgressText}`,
    CLOSED: `${theme.statusClosedBg} ${theme.statusClosedText}`,
  };

  const {
    title,
    description,
    status,
    createdAt,
    attachments,
    location,
    votes,
    _id,
  } = complaint;

  const [currentMedia, setCurrentMedia] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [upvotes, setUpvotes] = useState(votes.length);

  // ... (rest of your logic remains the same)
  const nextMedia = () => setCurrentMedia((prev) => (prev + 1) % attachments.length);
  const prevMedia = () => setCurrentMedia((prev) => (prev - 1 + attachments.length) % attachments.length);
  const handleUpvote = async () => {
    const idToken = currentUser.accessToken;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/complaints/${_id}/vote`, {}, 
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      if (res.data?.votes) {
        setUpvotes(res.data.votes.length);
      }
    } catch (err) {
      console.error('Error upvoting complaint:', err);
    }
  };


  return (
    // 3. Themed main card container
    <div className={`rounded-2xl overflow-hidden transition-all max-w-md mx-auto relative ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow} ${theme.cardHoverShadow}`}>
      {/* --- Media Carousel --- */}
      {attachments.length > 0 && (
        <div className={`relative w-full h-64 ${theme.sectionBgTranslucent}`}>
          <AnimatePresence>
            <motion.img
              key={attachments[currentMedia]?.url || currentMedia}
              src={attachments[currentMedia]?.url || attachments[currentMedia]}
              alt="Complaint media"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-64 object-cover"
            />
          </AnimatePresence>

          {attachments.length > 1 && (
            <>
              <button onClick={prevMedia} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60">
                <ChevronLeft size={22} />
              </button>
              <button onClick={nextMedia} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60">
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
          <h3 className={`font-semibold text-lg line-clamp-2 ${theme.textDefault}`}>
            {title}
          </h3>
          {/* 4. Use the new themed status styles */}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${themedStatusStyles[status] || ''}`}>
            {status}
          </span>
        </div>

        <p className={`text-sm mt-1 ${theme.textSubtle} ${descExpanded ? 'line-clamp-none' : 'line-clamp-3'}`}>
          {description}
        </p>
        {description?.length > 120 && (
          <button onClick={() => setDescExpanded(!descExpanded)} className={`text-xs font-semibold mt-1 ${theme.primaryAccentText}`}>
            {descExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}

        {location?.address && (
          <p className={`text-xs mt-2 ${theme.textCardDescription}`}>📍 {location.address}</p>
        )}

        {/* --- Footer Actions --- */}
        <div className={`flex items-center justify-between mt-3 border-t pt-2 ${theme.footerBorder}`}>
          {/* 5. Themed action buttons */}
          <button onClick={handleUpvote} className={`flex items-center gap-1 transition ${theme.textSubtle} hover:${theme.primaryAccentText}`}>
            <ThumbsUp size={16} /> {upvotes}
          </button>
          <button className={`flex items-center gap-1 transition ${theme.textSubtle} hover:${theme.primaryAccentText}`}>
            <MessageCircle size={16} /> 0
          </button>
          <button className={`flex items-center gap-1 transition ${theme.textSubtle} hover:${theme.primaryAccentText}`}>
            <Share2 size={16} /> Share
          </button>
          <span className={`text-xs ${theme.textCardDescription}`}>
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CitizenComplaintCard;