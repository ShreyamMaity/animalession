"use client";

import { OrbitControls } from "@react-three/drei";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CAMERA_DEFAULTS } from "@/lib/constants";

export function CameraController() {
  const isDragging = useWorkspaceStore((s) => s.isDragging);

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={CAMERA_DEFAULTS.minDistance}
      maxDistance={CAMERA_DEFAULTS.maxDistance}
      minPolarAngle={CAMERA_DEFAULTS.minPolarAngle}
      maxPolarAngle={CAMERA_DEFAULTS.maxPolarAngle}
      enabled={!isDragging}
      makeDefault
    />
  );
}
