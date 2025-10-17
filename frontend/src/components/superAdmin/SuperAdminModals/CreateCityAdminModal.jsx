import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

const CreateCityAdminModal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            key="modal"
            className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-[90%] max-w-lg border border-white/30"
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-full p-2 transform hover:scale-110 transition-all duration-200"
              title="Close"
            >
              <AiOutlineClose size={20} />
            </button>

            {/* Title */}
            {title && (
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-5 text-center tracking-wide">
                {title}
              </h3>
            )}

            {/* Divider line */}
            <div className="h-px bg-gray-300/50 mb-5" />

            {/* Content */}
            <div className="text-gray-700 text-base leading-relaxed">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateCityAdminModal;
