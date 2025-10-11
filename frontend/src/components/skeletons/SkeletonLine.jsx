import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SkeletonLine({ width = "100%", height = 15 }) {
  return (
    <Skeleton
      width={width}
      height={height}
      style={{ marginBottom: 8, borderRadius: 8 }}
    />
  );
}
