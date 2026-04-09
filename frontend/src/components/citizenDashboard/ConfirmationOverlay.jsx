import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ConfirmationOverlay = ({ type, onConfirm, onCancel, loading, theme }) => {
  const isDelete = type === "delete";
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${theme.cardBg} p-8 rounded-xl border ${isDelete ? 'border-red-500' : 'border-orange-500'} text-center max-w-sm`}>
        <h3 className={`text-lg font-bold ${isDelete ? 'text-red-400' : 'text-orange-400'}`}>
          {isDelete ? "Confirm Delete?" : "Reopen Complaint?"}
        </h3>
        <p className="text-sm mt-2 opacity-70">This action cannot be undone easily.</p>
        <div className="flex gap-4 mt-6 justify-center">
          <button onClick={onCancel} className="px-4 py-2 cursor-pointer opacity-60">Cancel</button>
          <button onClick={onConfirm} className={`px-6 py-2 cursor-pointer rounded-md text-white ${isDelete ? 'bg-red-600' : 'bg-orange-600'}`}>
            {loading ? <Loader2 className="animate-spin inline mr-2" size={16} /> : "Confirm"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmationOverlay;