import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MediaCarousel = ({ attachments = [], title = "Attachment" }) => {
  const [index, setIndex] = useState(0);
  if (!attachments.length) return null;

  const urls = attachments.map((a) => (typeof a === "string" ? a : a.url));

  const next = () => setIndex((i) => (i + 1) % urls.length);
  const prev = () => setIndex((i) => (i - 1 + urls.length) % urls.length);

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={urls[index]}
          src={urls[index]}
          alt={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-64 object-cover"
        />
      </AnimatePresence>

      {urls.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
        {index + 1}/{urls.length}
      </div>
    </div>
  );
};

export default MediaCarousel;
