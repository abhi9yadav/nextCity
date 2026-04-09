import React, { useState, useEffect } from 'react';
import { MapPin, ThumbsUp, MessageCircle, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/authContext';
import { useTheme } from '../../hooks/useTheme';

const CitizenComplaintCard = ({ complaint }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();

  const {
    title,
    description,
    status,
    createdAt,
    attachments = [],
    location,
    votes = [], // Backend array of user IDs
    _id,
  } = complaint;

  // --- States ---
  const [currentMedia, setCurrentMedia] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(votes.length);
  const [isVoting, setIsVoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // User ID normalize (Firebase uid or MongoDB _id)
  const userId = currentUser?.uid || currentUser?._id;

  // 🔥 FIX: Refresh hone par ya complaint change hone par upvote status check karo
  useEffect(() => {
    if (userId && votes && Array.isArray(votes)) {
      // Check if user ID exists in the votes array
      const alreadyVoted = votes.some(id => String(id) === String(userId));
      setHasUpvoted(alreadyVoted);
      setUpvotesCount(votes.length);
    }
  }, [votes, userId]);

  const themedStatusStyles = {
    OPEN: `${theme.statusOpenBg || 'bg-blue-500/20'} ${theme.statusOpenText || 'text-blue-400'}`,
    IN_PROGRESS: `${theme.statusInProgressBg || 'bg-orange-500/20'} ${theme.statusInProgressText || 'text-orange-400'}`,
    CLOSED: `${theme.statusClosedBg || 'bg-gray-500/20'} ${theme.statusClosedText || 'text-gray-400'}`,
    RESOLVED: `bg-green-500/20 text-green-400`,
  };

  const nextMedia = () => setCurrentMedia((prev) => (prev + 1) % attachments.length);
  const prevMedia = () => setCurrentMedia((prev) => (prev - 1 + attachments.length) % attachments.length);

  // --- Upvote Logic ---
  const handleUpvote = async () => {
    // Agar user logged in nahi hai, ya voting process mein hai, ya pehle hi vote kar chuka hai
    if (!currentUser || isVoting || hasUpvoted) return;

    setIsVoting(true);

    // 🚀 Optimistic Update (UI pe turant dikhao)
    const prevCount = upvotesCount;
    setHasUpvoted(true);
    setUpvotesCount(prevCount + 1);

    try {
      const idToken = currentUser.accessToken;
      const res = await axios.post(
        `http://localhost:5000/api/v1/complaints/${_id}/vote`, 
        {}, 
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      // Backend response se sync karo
      if (res.data?.votes) {
        // Agar backend pura array bhej raha hai:
        const updatedVotes = Array.isArray(res.data.votes) ? res.data.votes : [];
        setUpvotesCount(updatedVotes.length || res.data.votes); // count handling
      }
    } catch (err) {
      console.error('Error upvoting:', err);
      // Fail hone par purani state wapas lao
      setHasUpvoted(false);
      setUpvotesCount(prevCount);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/complaints/${_id}`;
    const shareData = {
      title: `Citizen Complaint: ${title}`,
      text: `Check out this complaint: ${title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className={`rounded-2xl overflow-hidden transition-all max-w-md mx-auto relative border ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow} ${theme.cardHoverShadow}`}>
      
      {/* Media Carousel */}
      {attachments.length > 0 && (
        <div className={`relative w-full h-64 ${theme.sectionBgTranslucent}`}>
          <AnimatePresence mode='wait'>
            <motion.img
              key={currentMedia}
              src={attachments[currentMedia]?.url || attachments[currentMedia]}
              alt="Complaint"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-64 object-cover"
            />
          </AnimatePresence>

          {attachments.length > 1 && (
            <>
              <button onClick={prevMedia} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 backdrop-blur-sm"><ChevronLeft size={20} /></button>
              <button onClick={nextMedia} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 backdrop-blur-sm"><ChevronRight size={20} /></button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <h3 className={`font-semibold text-lg leading-snug ${theme.textDefault}`}>
            {title}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border border-current ${themedStatusStyles[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {status}
          </span>
        </div>

        <p className={`text-sm mt-3 ${theme.textSubtle} ${descExpanded ? '' : 'line-clamp-3'}`}>
          {description}
        </p>
        
        {description?.length > 120 && (
          <button onClick={() => setDescExpanded(!descExpanded)} className={`text-xs font-semibold mt-1 ${theme.primaryAccentText}`}>
            {descExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}

        {location?.address && (
          <div className={`flex items-start gap-1.5 mt-4 ${theme.textCardDescription}`}>
            <MapPin size={14} className="mt-0.5" />
            <p className="text-xs">{location.address}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className={`flex items-center justify-between mt-5 border-t pt-4 ${theme.cardBorder}`}>
          
          <button 
            onClick={handleUpvote} 
            disabled={isVoting}
            className={`flex cursor-pointer items-center gap-1.5 font-medium transition-all ${
              hasUpvoted 
                ? `${theme.primaryAccentText} font-bold scale-105` 
                : `${theme.textSubtle} hover:${theme.primaryAccentText}`
            }`}
          >
            <ThumbsUp 
              size={19} 
              className={hasUpvoted ? "fill-current" : ""} 
              strokeWidth={hasUpvoted ? 2.5 : 1.5} 
            /> 
            {upvotesCount}
          </button>

          <button className={`flex items-center cursor-pointer gap-1.5 font-medium ${theme.textSubtle} hover:${theme.primaryAccentText}`}>
            <MessageCircle size={18} /> 0
          </button>
          
          <button onClick={handleShare} className={`flex items-center cursor-pointer gap-1.5 font-medium ${theme.textSubtle} hover:${theme.primaryAccentText}`}>
            <Share2 size={18} /> Share
          </button>
          
          <span className={`text-[10px] ${theme.textCardDescription}`}>
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CitizenComplaintCard;