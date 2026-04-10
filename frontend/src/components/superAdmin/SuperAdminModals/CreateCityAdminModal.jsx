import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

const CreateCityAdminModal = ({
  isOpen,
  onClose,
  title,
  children,
  loading,
  loadingText = "Processing...",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm">
          <motion.div className="relative bg-white rounded-3xl p-8 w-[90%] max-w-lg">
            <button
              onClick={!loading ? onClose : undefined}
              className="absolute top-4 right-4"
            >
              <AiOutlineClose size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>

            {children}

            {/* LOADING */}
            {loading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl">
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>{loadingText}</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateCityAdminModal;
