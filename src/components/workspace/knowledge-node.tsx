"use client";

import { useRef, useState, useCallback } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodes } from "@/hooks/use-nodes";
import { useEdges } from "@/hooks/use-edges";
import type { Node } from "@/types";
import * as THREE from "three";

interface KnowledgeNodeProps {
  node: Node;
  projectId: string;
}

export function KnowledgeNode({ node, projectId }: KnowledgeNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera, raycaster, pointer } = useThree();

  const {
    selectedNodeId,
    interactionMode,
    connectSourceId,
    setSelectedNodeId,
    setHoveredNodeId,
    setIsDragging,
    setDragNodeId,
    setConnectSourceId,
    setEditingNodeId,
    setFullscreenArtifactId,
  } = useWorkspaceStore();

  const { mutate: mutateNodes } = useNodes(projectId);
  const { mutate: mutateEdges } = useEdges(projectId);

  const isSelected = selectedNodeId === node.id;
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffset = useRef(new THREE.Vector3());
  const isDraggingRef = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const scale = hovered || isSelected ? 1.15 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(scale, scale, scale),
      delta * 8
    );
    if (isSelected) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (interactionMode === "connect") {
        e.stopPropagation();
        if (!connectSourceId) {
          setConnectSourceId(node.id);
        } else if (connectSourceId !== node.id) {
          fetch(`/api/projects/${projectId}/edges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceNodeId: connectSourceId,
              targetNodeId: node.id,
            }),
          }).then(() => {
            mutateEdges();
            setConnectSourceId(null);
          });
        }
        return;
      }

      if (interactionMode !== "select") return;

      e.stopPropagation();
      setSelectedNodeId(node.id);

      const intersection = new THREE.Vector3();
      dragPlane.current.set(
        new THREE.Vector3(0, 1, 0),
        -node.posY
      );
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(dragPlane.current, intersection);
      dragOffset.current.copy(intersection).sub(
        new THREE.Vector3(node.posX, node.posY, node.posZ)
      );

      isDraggingRef.current = true;
      setIsDragging(true);
      setDragNodeId(node.id);

      const onPointerMove = (ev: PointerEvent) => {
        if (!isDraggingRef.current || !meshRef.current) return;
        const ndc = new THREE.Vector2(
          (ev.clientX / window.innerWidth) * 2 - 1,
          -(ev.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(ndc, camera);
        const pt = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane.current, pt);
        if (pt) {
          const newPos = pt.sub(dragOffset.current);
          meshRef.current.position.set(newPos.x, node.posY, newPos.z);
        }
      };

      const onPointerUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
        setDragNodeId(null);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);

        if (meshRef.current) {
          const pos = meshRef.current.position;
          fetch(`/api/projects/${projectId}/nodes/${node.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              posX: pos.x,
              posY: pos.y,
              posZ: pos.z,
            }),
          }).then(() => mutateNodes());
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [
      interactionMode,
      connectSourceId,
      node,
      projectId,
      camera,
      raycaster,
      pointer,
      setSelectedNodeId,
      setIsDragging,
      setDragNodeId,
      setConnectSourceId,
      mutateNodes,
      mutateEdges,
    ]
  );

  const handleDoubleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (node.artifactId) {
        setFullscreenArtifactId(node.artifactId);
      } else {
        setEditingNodeId(node.id);
      }
    },
    [node.id, node.artifactId, setEditingNodeId, setFullscreenArtifactId]
  );

  const nodeColor = new THREE.Color(node.color);

  const geometry = (() => {
    switch (node.shape) {
      case "CUBE":
        return <boxGeometry args={[node.size, node.size, node.size]} />;
      case "OCTAHEDRON":
        return <octahedronGeometry args={[node.size * 0.6]} />;
      case "TORUS":
        return (
          <torusGeometry args={[node.size * 0.5, node.size * 0.2, 16, 32]} />
        );
      default:
        return <sphereGeometry args={[node.size * 0.5, 32, 32]} />;
    }
  })();

  return (
    <group position={[node.posX, node.posY, node.posZ]}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredNodeId(node.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredNodeId(null);
          document.body.style.cursor = "auto";
        }}
      >
        {geometry}
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered || isSelected ? 0.6 : 0.3}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {isSelected && (
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[node.size * 0.7, 0.02, 16, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      )}

      <Html
        position={[0, node.size * 0.5 + 0.6, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
      >
        <div className="text-white text-xs font-medium px-2 py-0.5 bg-black/60 rounded whitespace-nowrap backdrop-blur-sm">
          {node.title}
        </div>
      </Html>
    </group>
  );
}
