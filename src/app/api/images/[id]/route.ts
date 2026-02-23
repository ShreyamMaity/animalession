import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const blob = await db.imageBlob.findUnique({
    where: { id },
  });

  if (!blob) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = Buffer.from(blob.data, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": blob.mimeType,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
