-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('TEXT', 'ARTIFACT', 'LINK', 'IMAGE', 'NOTE');

-- CreateEnum
CREATE TYPE "EdgeStyle" AS ENUM ('SOLID', 'DASHED', 'DOTTED');

-- CreateEnum
CREATE TYPE "NodeShape" AS ENUM ('SPHERE', 'CUBE', 'OCTAHEDRON', 'TORUS');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "posZ" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "size" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "shape" "NodeShape" NOT NULL DEFAULT 'SPHERE',
    "type" "NodeType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "artifactId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "label" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "style" "EdgeStyle" NOT NULL DEFAULT 'SOLID',
    "thickness" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT,
    "js" TEXT,
    "thumbnail" TEXT,
    "prompt" TEXT,
    "model" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Node_projectId_idx" ON "Node"("projectId");

-- CreateIndex
CREATE INDEX "Edge_projectId_idx" ON "Edge"("projectId");

-- CreateIndex
CREATE INDEX "Edge_sourceNodeId_idx" ON "Edge"("sourceNodeId");

-- CreateIndex
CREATE INDEX "Edge_targetNodeId_idx" ON "Edge"("targetNodeId");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
