"use client";

import { lazy, Suspense } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

type SplineSceneProps = {
  className?: string;
  scene: string;
};

export function SplineScene({ className, scene }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <span className="loader" />
        </div>
      }
    >
      <Spline className={className} scene={scene} />
    </Suspense>
  );
}
