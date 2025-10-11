import React from "react";
import { motion } from "framer-motion";

const order = ["Pending", "InProgress", "Closed"];
const colors = {
  active: "bg-blue-600",
  inactive: "bg-gray-300",
};

const StatusTimeline = ({ status }) => {
  const currentIndex = order.indexOf(status);

  return (
    <div className="flex items-center gap-2 mt-3">
      {order.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          {/* Circle (animated fill) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: currentIndex >= i ? 1 : 0.9,
              opacity: currentIndex >= i ? 1 : 0.4,
            }}
            transition={{ duration: 0.3 }}
            className={`w-3.5 h-3.5 rounded-full ${
              currentIndex >= i ? colors.active : colors.inactive
            }`}
          />

          {/* Connector */}
          {i < order.length - 1 && (
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: currentIndex > i ? "2rem" : "2rem",
                backgroundColor:
                  currentIndex > i ? "#2563eb" : "rgb(209 213 219)", // Tailwind blue-600 / gray-300
              }}
              transition={{ duration: 0.3 }}
              className="h-1 rounded-full"
            />
          )}
        </div>
      ))}

      {/* Optional: Label for current status */}
      <span
        className={`ml-3 text-sm font-medium ${
          currentIndex === 2
            ? "text-green-600"
            : currentIndex === 1
            ? "text-blue-600"
            : "text-gray-600"
        }`}
      >
        {status}
      </span>
    </div>
  );
};

export default StatusTimeline;
