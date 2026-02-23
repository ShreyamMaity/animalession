import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const createNodeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(["TEXT", "ARTIFACT", "LINK", "IMAGE", "NOTE"]).optional(),
  content: z.string().optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  posZ: z.number().optional(),
  width: z.number().min(100).max(1200).optional(),
  height: z.number().min(60).max(1200).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  size: z.number().min(0.1).max(5).optional(),
  shape: z.enum(["SPHERE", "CUBE", "OCTAHEDRON", "TORUS"]).optional(),
  artifactId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateNodeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["TEXT", "ARTIFACT", "LINK", "IMAGE", "NOTE"]).optional(),
  content: z.string().optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  posZ: z.number().optional(),
  width: z.number().min(100).max(1200).optional(),
  height: z.number().min(60).max(1200).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  size: z.number().min(0.1).max(5).optional(),
  shape: z.enum(["SPHERE", "CUBE", "OCTAHEDRON", "TORUS"]).optional(),
  artifactId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createEdgeSchema = z.object({
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  style: z.enum(["SOLID", "DASHED", "DOTTED"]).optional(),
  thickness: z.number().min(0.1).max(5).optional(),
});

export const updateEdgeSchema = z.object({
  label: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  style: z.enum(["SOLID", "DASHED", "DOTTED"]).optional(),
  thickness: z.number().min(0.1).max(5).optional(),
});

export const createArtifactSchema = z.object({
  title: z.string().min(1).max(200),
  html: z.string().min(1),
  css: z.string().optional(),
  js: z.string().optional(),
  prompt: z.string().optional(),
  model: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  projectId: z.string().optional(),
});

export const generateArtifactSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(5000),
  projectId: z.string().min(1),
  model: z.string().optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  posZ: z.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;
export type CreateEdgeInput = z.infer<typeof createEdgeSchema>;
export type UpdateEdgeInput = z.infer<typeof updateEdgeSchema>;
export type CreateArtifactInput = z.infer<typeof createArtifactSchema>;
export type GenerateArtifactInput = z.infer<typeof generateArtifactSchema>;
