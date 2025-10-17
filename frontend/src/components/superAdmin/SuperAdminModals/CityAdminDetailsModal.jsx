import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

const CityAdminDetailsModal = ({ selectedAdmin, setSelectedAdmin }) => {
  return (
    <AnimatePresence>
      {selectedAdmin && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }} // faster overlay fade
        >
          <motion.div
            key="modal"
            className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] md:w-[450px] relative overflow-hidden"
            initial={{ y: 120, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 120, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.6 }} // faster spring
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                City Admin Details
              </h2>
              <button
                onClick={() => setSelectedAdmin(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl transition"
              >
                <AiOutlineClose />
              </button>
            </div>

            {/* Body */}
            <div className="mt-5 space-y-4 text-gray-700">
              <div>
                <span className="font-semibold text-gray-800">Name:</span>{" "}
                {selectedAdmin.name}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Email:</span>{" "}
                {selectedAdmin.email}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Phone:</span>{" "}
                {selectedAdmin.phone || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-800">City:</span>{" "}
                {selectedAdmin.city_name}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Status:</span>{" "}
                <span
                  className={`${
                    selectedAdmin.isActive
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }`}
                >
                  {selectedAdmin.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setSelectedAdmin(null)}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-xl hover:scale-105 transform transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CityAdminDetailsModal;
