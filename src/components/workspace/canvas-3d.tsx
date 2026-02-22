"use client";

import { Canvas } from "@react-three/fiber";
import { Scene } from "./scene";
import { CameraController } from "./camera-controller";
import { PostProcessing } from "./post-processing";
import { CAMERA_DEFAULTS, WORKSPACE_COLORS } from "@/lib/constants";
import type { Node, Edge } from "@/types";

interface Canvas3DProps {
  nodes: Node[];
  edges: Edge[];
  projectId: string;
}

export function Canvas3D({ nodes, edges, projectId }: Canvas3DProps) {
  return (
    <Canvas
      camera={{
        position: CAMERA_DEFAULTS.position,
        fov: CAMERA_DEFAULTS.fov,
        near: CAMERA_DEFAULTS.near,
        far: CAMERA_DEFAULTS.far,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{ background: WORKSPACE_COLORS.background }}
      onPointerMissed={() => {}}
    >
      <CameraController />
      <Scene nodes={nodes} edges={edges} projectId={projectId} />
      <PostProcessing />
    </Canvas>
  );
}
