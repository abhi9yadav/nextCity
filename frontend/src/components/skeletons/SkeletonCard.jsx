import React from "react";
import Skeleton from "react-loading-skeleton";

export default function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl bg-white shadow mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton circle width={40} height={40} />
        <Skeleton width={120} height={20} />
      </div>
      <Skeleton height={100} />
      <Skeleton width="80%" height={15} style={{ marginTop: 10 }} />
    </div>
  );
}
