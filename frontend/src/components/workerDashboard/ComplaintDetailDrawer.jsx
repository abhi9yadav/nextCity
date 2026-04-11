import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import StatusBadge from "./StatusBadge";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  ThumbsUp, 
  MapPin, 
  User, 
  Paperclip, 
  Video,
  Loader2,
  X
} from "lucide-react";

const ComplaintDetailPage = () => {
  const { theme } = useTheme();
  const [previewImage, setPreviewImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); 

  const complaint = location.state?.complaintData;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && previewImage) {
        setPreviewImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  if (!complaint) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme.appBg}`}>
        <p className={`mb-4 ${theme.textSubtle}`}>Complaint data not found or session expired.</p>
        <button 
          onClick={() => navigate(-1)} 
          className={`px-4 py-2 rounded-lg font-medium transition-all ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo}`}
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // API Call Here
    } catch (error) {
      console.error("Failed to update complaint:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen pb-12 ${theme.appBg}`}
    >
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-40 ${theme.navBg} backdrop-blur-md border-b ${theme.navBorder} shadow-sm`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack} 
              className={`flex items-center gap-2 text-sm font-medium ${theme.textSubtle} hover:${theme.textDefault} transition-colors focus:outline-none rounded-md px-2 py-1 -ml-2`}
            >
              <ArrowLeft size={18} />
              Back to Complaints
            </button>
            <div className={`h-4 w-px border-l ${theme.navBorder} hidden sm:block`}></div>
            <span className={`text-sm font-mono ${theme.textSubtle} opacity-70 hidden sm:block`}>
              #{complaint._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main Content Container - Changed to max-w-4xl for a beautiful single-column layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* 1. MAIN INFO & DESCRIPTION CARD */}
        <div className={`p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow}`}>
          
          {/* Meta Top */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${theme.cardBorder} ${theme.sectionBgTranslucent} ${theme.primaryAccentText}`}>
              <ThumbsUp size={14} />
              <span>{complaint.votes?.length || 0} Upvotes</span>
            </div>
            <span className={`text-sm font-medium ${theme.textSubtle}`}>
              Reported {formatDate(complaint.createdAt || Date.now())}
            </span>
          </div>
          
          {/* Title */}
          <h1 className={`text-3xl font-bold leading-tight mb-8 ${theme.textDefault}`}>
            {complaint.title}
          </h1>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Reported By */}
            <div className={`p-4 rounded-xl border ${theme.cardBorder} ${theme.sectionBgTranslucent} flex items-start gap-3`}>
              <div className={`p-2 rounded-lg border ${theme.cardBorder} ${theme.cardBg}`}>
                <User size={20} className={theme.primaryAccentText} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${theme.textSubtle} mb-0.5`}>
                  Reported By
                </p>
                <p className={`font-medium ${theme.textDefault}`}>
                  {complaint.createdBy?.name || "Anonymous Citizen"}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className={`p-4 rounded-xl border ${theme.cardBorder} ${theme.sectionBgTranslucent} flex items-start gap-3`}>
              <div className={`p-2 rounded-lg border ${theme.cardBorder} ${theme.cardBg}`}>
                <MapPin size={20} className={theme.primaryAccentText} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${theme.textSubtle} mb-0.5`}>
                  Location
                </p>
                <a
                  href={`http://googleusercontent.com/maps.google.com/7{encodeURIComponent(complaint.location?.address || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium ${theme.linkTextAccent} ${theme.linkHoverTextAccent} hover:underline line-clamp-2 transition-colors`}
                >
                  {complaint.location?.address || "Location not provided"}
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className={`text-lg font-semibold mb-4 border-b ${theme.cardBorder} pb-2 ${theme.textDefault}`}>
              Description
            </h2>
            <p className={`text-base leading-relaxed ${theme.textSubtle} whitespace-pre-wrap`}>
              {complaint.description}
            </p>
          </div>
        </div>

        {/* 2. ATTACHMENTS SECTION (If any) */}
        {complaint.attachments?.length > 0 && (
          <div className={`p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow}`}>
            <div className={`flex items-center gap-2 mb-4 border-b ${theme.cardBorder} pb-3`}>
              <Paperclip size={20} className={theme.primaryAccentText} />
              <h2 className={`text-lg font-semibold ${theme.textDefault}`}>
                Attached Evidence ({complaint.attachments.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {complaint.attachments.map((file, i) => (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={i} 
                  className={`relative group overflow-hidden rounded-xl border ${theme.cardBorder} ${theme.sectionBgTranslucent} aspect-square cursor-pointer`}
                  onClick={() => file.type === "image" && setPreviewImage(file.url)}
                >
                  {file.type === "image" ? (
                    <>
                      <img src={file.url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full hover:opacity-80 transition-opacity">
                      <Video className={`mb-2 ${theme.primaryAccentText}`} size={28} />
                      <span className={`text-sm font-medium ${theme.textSubtle}`}>Watch Video</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MANAGE COMPLAINT SECTION */}
        <div className={`p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow}`}>
          <h3 className={`text-lg font-semibold ${theme.textDefault} mb-2`}>
            Manage Complaint Status
          </h3>
          <p className={`text-sm ${theme.textSubtle} opacity-80 mb-6`}>
            Update the status of this complaint to notify the citizen of your progress.
          </p>
          <button
            onClick={handleUpdate}
            disabled={complaint.status === "RESOLVED" || isUpdating}
            className={`w-full sm:w-auto min-w-[200px] py-3 px-6 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex justify-center items-center gap-2 
              ${complaint.status === "RESOLVED"
                ? "opacity-50 cursor-not-allowed bg-gray-500/20 text-gray-400"
                : `bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} ${theme.buttonPrimaryText} hover:scale-[1.02] hover:shadow-lg`
            }`}
          >
            {isUpdating && <Loader2 size={16} className="animate-spin" />}
            {complaint.status === "RESOLVED" ? "Resolved & Closed" : isUpdating ? "Processing..." : "Update Status"}
          </button>
        </div>

        {/* 4. ACTIVITY TIMELINE SECTION (SCROLLABLE) */}
        {complaint.history?.length > 0 && (
          <div className={`p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow}`}>
            <h3 className={`text-lg font-semibold ${theme.textDefault} mb-6 border-b ${theme.cardBorder} pb-3`}>
              Activity Timeline
            </h3>

            {/* 🔥 Yahan Scrollable wrapper lagaya hai (max-h-[400px] aur overflow-y-auto) */}
            <div className="max-h-[400px] overflow-y-auto pr-4 pl-2 -ml-2 custom-scrollbar">
              <div className={`relative border-l-2 border-opacity-30 ${theme.cardBorder} ml-2 space-y-8 py-2`}>
                {complaint.history.slice().reverse().map((h, i) => (
                  <div key={i} className="relative pl-6">
                    
                    {/* Timeline Node */}
                    <span className={`absolute -left-[10px] top-1 h-[18px] w-[18px] rounded-full border-[3px] ${theme.cardBg} bg-current ${theme.primaryAccentText}`} />

                    <div className="flex flex-col gap-0.5 mb-2">
                      <p className={`text-sm font-bold ${theme.textDefault}`}>
                        {h.by?.name || "System"}
                      </p>
                      <time className={`text-xs font-medium ${theme.textSubtle} opacity-70`}>
                        {formatDate(h.timeStamp)}
                      </time>
                    </div>

                    <div className={`text-sm ${theme.textSubtle}`}>
                      {h.action === "status_changed" && (
                        <span>
                          Status changed from <span className={`font-medium px-1.5 py-0.5 rounded ${theme.sectionBgTranslucent}`}>{h.from}</span> to <span className={`font-medium px-1.5 py-0.5 rounded border border-opacity-30 ${theme.cardBorder} ${theme.primaryAccentText}`}>{h.to}</span>
                        </span>
                      )}
                      {h.action === "comment" && "Left a comment"}
                      {h.action === "resolved_proof" && "Uploaded resolution proof"}
                    </div>

                    {h.note && (
                      <div className={`mt-3 p-3 rounded-lg text-sm border ${theme.cardBorder} ${theme.sectionBgTranslucent} ${theme.textDefault}`}>
                        {h.note}
                      </div>
                    )}

                    {h.attachments?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {h.attachments.map((a, idx) => (
                          <div key={idx} className={`relative w-16 h-16 rounded-lg overflow-hidden border ${theme.cardBorder}`}>
                            <img
                              src={a.url}
                              alt="Proof"
                              onClick={() => setPreviewImage(a.url)}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Image Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[3000] p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/25 transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={previewImage} 
              alt="Fullscreen evidence preview" 
              className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComplaintDetailPage;