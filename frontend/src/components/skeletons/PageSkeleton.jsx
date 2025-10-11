import React from "react";
import SkeletonCard from "../skeletons/SkeletonCard";

export default function PageSkeleton({ count = 3 }) {
  return (
    <div className="p-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
