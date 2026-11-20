import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { getOrCreateVisitorToken } from "@/lib/visitor-token";
import { consumeRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 128 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

function isValidImageSignature(type: string, bytes: Uint8Array) {
  if (type === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary upload is not configured.");
    return Response.json({ error: "Design uploads are temporarily unavailable." }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_SIZE) {
    return Response.json({ error: "Use an image smaller than 4 MB." }, { status: 413 });
  }

  try {
    const visitorToken = await getOrCreateVisitorToken();
    const rateLimit = await consumeRateLimit(visitorToken, "upload", 6, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Upload limit reached. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }
  } catch (error) {
    console.error("Could not verify upload limits:", error);
    return Response.json({ error: "Design uploads are temporarily unavailable." }, { status: 503 });
  }

  let formData: FormData;
  try {
    const reader = request.body?.getReader();
    if (!reader) {
      return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > MAX_REQUEST_SIZE) {
        await reader.cancel();
        return Response.json({ error: "Use an image smaller than 4 MB." }, { status: 413 });
      }
      chunks.push(value);
    }

    const body = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const boundedRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body,
    });
    formData = await boundedRequest.formData();
  } catch {
    return Response.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE || !allowedTypes.has(file.type)) {
    return Response.json({ error: "Use a PNG, JPG, or WebP image smaller than 4 MB." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isValidImageSignature(file.type, bytes)) {
    return Response.json({ error: "The uploaded file is not a valid supported image." }, { status: 400 });
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "heuristicstudio/designs",
          resource_type: "image",
          allowed_formats: ["png", "jpg", "jpeg", "webp"],
          overwrite: false,
          unique_filename: true,
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else if (!uploadResult) {
            reject(new Error("Cloudinary returned no upload result."));
          } else {
            resolve(uploadResult);
          }
        }
      );
      Readable.from([bytes]).pipe(uploadStream);
    });

    return Response.json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return Response.json({ error: "We could not store your design. Please try again." }, { status: 502 });
  }
}
