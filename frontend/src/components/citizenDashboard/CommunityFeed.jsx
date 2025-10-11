import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import FeedComplaintCard from "./FeedComplaintCard";
import CardSkeleton from "../skeletons/SkeletonCard";
import PageSkeleton from "../skeletons/PageSkeleton";

const PAGE_SIZE = 5;

const CommunityFeedPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [direction, setDirection] = useState(0);
  const [page, setPage] = useState(1);

  const isMobile = window.innerWidth < 768;

  const fetchComplaints = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/complaints/allcomplaints?page=${pageNum}&limit=${PAGE_SIZE}`
      );
      return res.data || [];
    } catch (err) {
      console.error("Error fetching complaints", err);
      return [];
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const initial = await fetchComplaints(1);
      setComplaints(initial);
      setLoading(false);
    };
    loadInitial();
  }, []);

  const loadMoreComplaints = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const more = await fetchComplaints(nextPage);
    if (more.length > 0) {
      setComplaints((prev) => [...prev, ...more]);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const handleUpvote = async (id) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, votes: [...c.votes, "localUser"] } : c
      )
    );

    
  };

  // Mobile swipe handlers
  const handlers = useSwipeable({
    onSwipedUp: async () => {
      if (currentIndex < complaints.length - 1) {
        setDirection(1);
        setCurrentIndex((i) => i + 1);
        if (currentIndex >= complaints.length - 2) await loadMoreComplaints();
      }
    },
    onSwipedDown: () => {
      if (currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex((i) => i - 1);
      }
    },
    trackMouse: true,
  });

  // Desktop: Infinite scroll
  useEffect(() => {
    if (!isMobile) {
      const handleScroll = () => {
        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100
        ) {
          loadMoreComplaints();
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [page, complaints, isMobile]);

  if (loading) return <PageSkeleton count={4} />;
  if (!complaints.length)
    return <div className="text-center text-gray-500 p-10">No complaints yet.</div>;

  if (isMobile) {
    // Mobile: Swipe one card at a time
    const currentComplaint = complaints[currentIndex];
    return (
      <div
        {...handlers}
        className="min-h-screen bg-gray-50 flex justify-center items-center overflow-hidden relative p-4"
      >
        <div className="w-full max-w-md h-[90vh] relative">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentComplaint._id}
              custom={direction}
              initial={{ y: direction > 0 ? 400 : -400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction > 0 ? -400 : 400, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <FeedComplaintCard
                complaint={currentComplaint}
                onUpvote={() => handleUpvote(currentComplaint._id)}
              />
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm bg-white/60 px-3 py-1 rounded-full shadow-sm">
                {currentIndex + 1} / {complaints.length}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Desktop: Scrollable feed
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start p-4 pt-6">
      <div className="w-full max-w-md space-y-6">
        {complaints.map((complaint) => (
          <FeedComplaintCard
            key={complaint._id}
            complaint={complaint}
            onUpvote={() => handleUpvote(complaint._id)}
          />
        ))}
        {loadingMore && (
          <div className="text-center text-gray-400 py-4">Loading more...</div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeedPage;
