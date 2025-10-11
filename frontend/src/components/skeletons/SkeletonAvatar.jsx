import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SkeletonAvatar() {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md w-full max-w-sm mx-auto">
      <Skeleton circle width={100} height={100} />
      <Skeleton width={140} height={20} style={{ marginTop: 10 }} />
      <Skeleton width={180} height={15} style={{ marginTop: 6 }} />
      <Skeleton width="90%" height={12} style={{ marginTop: 8 }} />
    </div>
  );
}
