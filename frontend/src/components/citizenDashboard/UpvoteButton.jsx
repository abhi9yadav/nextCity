import React, { useState } from "react";
import axios from "axios";
import { ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UpvoteButton = ({ complaintId, initialVoted = false, initialCount = 0 }) => {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const handleUpvote = async () => {
    try {
      // Prevent spamming
      if (animating) return;

      setAnimating(true);
      const newVoted = !voted;
      setVoted(newVoted);
      setCount((prev) => (newVoted ? prev + 1 : prev - 1));

      // Send vote/unvote API request
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/${complaintId}/vote`,
        { vote: newVoted }
      );

      console.log("Vote response:", res.data);
      setTimeout(() => setAnimating(false), 400);
    } catch (err) {
      console.error("Upvote failed:", err);
      // Rollback if failed
      setVoted((v) => !v);
      setCount((c) => (voted ? c + 1 : c - 1));
      setAnimating(false);
    }
  };

  return (
    <div className="absolute bottom-6 right-6">
      <button
        onClick={handleUpvote}
        disabled={animating}
        aria-pressed={voted}
        title={voted ? "Remove upvote" : "Upvote this complaint"}
        className={`relative flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-full shadow-md transition-all duration-200 
          ${
            voted
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }
          ${animating ? "opacity-80 cursor-wait" : ""}
        `}
      >
        <ThumbsUp
          size={20}
          className={`transition-transform duration-200 ${
            voted ? "scale-110 text-blue-600" : "text-gray-500"
          }`}
        />
        {count}

        {/* Animated +1 / -1 feedback */}
        <AnimatePresence>
          {animating && (
            <motion.span
              key="voteEffect"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -24 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute -top-2 right-4 text-blue-500 text-xs font-bold"
            >
              {voted ? "+1" : "-1"}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export default UpvoteButton;
