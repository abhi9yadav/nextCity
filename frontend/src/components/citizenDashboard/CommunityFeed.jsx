import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import FeedComplaintCard from "./FeedComplaintCard";
import CardSkeleton from "../skeletons/SkeletonCard";
import PageSkeleton from "../skeletons/PageSkeleton";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/authContext/index";
import { useRef } from "react";

const PAGE_SIZE = 5;

const CommunityFeedPage = () => {
  const { theme } = useTheme();
  const { token } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [direction, setDirection] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);
  const pageRef = useRef(1);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const isMobile = window.innerWidth < 768;

  const fetchComplaints = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/complaints/allcomplaints?page=${pageNum}&limit=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
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
      const data = await fetchComplaints(1);
      setComplaints(data);
      setPage(1);

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setLoading(false);
    };
    loadInitial();
  }, []);

  const loadMoreComplaints = async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoadingMore(true);

    const nextPage = pageRef.current + 1;
    const more = await fetchComplaints(nextPage);

    if (more.length > 0) {
      setComplaints((prev) => {
        const ids = new Set(prev.map((c) => c._id));
        const filtered = more.filter((c) => !ids.has(c._id));
        return [...prev, ...filtered];
      });

       pageRef.current = nextPage;
        setPage(nextPage);

      if (more.length < PAGE_SIZE) {
        setHasMore(false);
      }
    }else {
      setHasMore(false);
    }

    setLoadingMore(false);
    isFetchingRef.current = false;
  };

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

  //  Scroll (Desktop)
    useEffect(() => {
      if (!isMobile) {
        const handleScroll = () => {
          const scrollPosition = window.innerHeight + window.scrollY;
          const threshold = document.body.offsetHeight - 150;

          if (
            scrollPosition >= threshold &&
            !isFetchingRef.current &&
            hasMore
          ) {
            loadMoreComplaints();
          }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }
    }, [isMobile, hasMore]);


  if (loading) return <PageSkeleton count={4} />;

  // 3. Apply theme to "no complaints" message
  if (!complaints.length)
    return <div className={`text-center p-10 ${theme.textSubtle}`}>No complaints yet.</div>;

  if (isMobile) {
    // Mobile: Swipe one card at a time
    const currentComplaint = complaints[currentIndex];
    return (
      // 4. Removed bg-gray-50 to inherit theme from layout
      <div
        {...handlers}
        className="min-h-screen flex justify-center items-center overflow-hidden relative p-4"
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
              {/* 5. Apply theme to the counter badge */}
              <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-sm px-3 py-1 rounded-full border ${theme.sectionBgTranslucent} ${theme.textSubtle} ${theme.cardBorder}`}>
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
    // 6. Removed bg-gray-50 to inherit theme from layout
    <div className="min-h-screen flex justify-center items-start p-4 pt-6">
      <div className="w-full max-w-md space-y-6">
        {complaints.map((complaint) => (
          <FeedComplaintCard
            key={complaint._id}
            complaint={complaint}
          />
        ))}
        {loadingMore && (
          // 7. Apply theme to "loading more" text
          <div className={`text-center py-4 ${theme.textCardDescription}`}>Loading more...</div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeedPage;