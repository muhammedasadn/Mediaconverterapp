import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { validateImportUrl } from '../security/ssrf-guard';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { validateMediaSignature } from '@universal/conversion-core';

const InspectSchema = z.object({
  url: z.string().url(),
});

const StreamImportSchema = z.object({
  url: z.string().url(),
  targetFormat: z.string().optional(),
});

const MAX_IMPORT_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export const importRoutes: FastifyPluginAsync = async (server) => {
  // 1. Inspect Remote URL (HEAD request metadata probe)
  server.post('/import/inspect', async (request, reply) => {
    const parsed = InspectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_URL', message: 'Valid HTTPS URL is required' },
      });
    }

    const validation = await validateImportUrl(parsed.data.url);
    if (!validation.isValid) {
      return reply.status(400).send({
        success: false,
        error: { code: 'SSRF_BLOCKED', message: validation.reason },
      });
    }

    try {
      const headRes = await fetch(parsed.data.url, { method: 'HEAD', redirect: 'follow' });
      if (!headRes.ok) {
        return reply.status(400).send({
          success: false,
          error: { code: 'FETCH_FAILED', message: `Remote server responded with ${headRes.status}` },
        });
      }

      const contentLength = headRes.headers.get('content-length');
      const contentType = headRes.headers.get('content-type') || 'application/octet-stream';
      const sizeBytes = contentLength ? parseInt(contentLength, 10) : 0;

      // Extract filename from URL or header
      const urlPath = new URL(parsed.data.url).pathname;
      const filename = path.basename(urlPath) || 'imported_media';

      return reply.send({
        success: true,
        data: {
          url: parsed.data.url,
          filename,
          sizeBytes,
          contentType,
          isWithinSizeLimit: sizeBytes <= MAX_IMPORT_SIZE_BYTES,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'INSPECT_ERROR', message: err.message || 'Failed to inspect remote resource' },
      });
    }
  });

  // 2. Stream Import to Scratch Disk with Size & Magic Byte Verification
  server.post('/import/stream', async (request, reply) => {
    const parsed = StreamImportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Valid HTTPS URL is required' },
      });
    }

    const validation = await validateImportUrl(parsed.data.url);
    if (!validation.isValid) {
      return reply.status(400).send({
        success: false,
        error: { code: 'SSRF_BLOCKED', message: validation.reason },
      });
    }

    const uploadDir = process.env.UPLOAD_DIR || '/tmp/universal-media/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileId = randomUUID();
    const urlPath = new URL(parsed.data.url).pathname;
    const originalExt = path.extname(urlPath) || '.bin';
    const safeFilename = `${fileId}${originalExt}`;
    const destinationPath = path.join(uploadDir, safeFilename);

    try {
      const response = await fetch(parsed.data.url, { redirect: 'follow' });
      if (!response.ok || !response.body) {
        return reply.status(400).send({
          success: false,
          error: { code: 'DOWNLOAD_FAILED', message: `Remote server returned ${response.status}` },
        });
      }

      const writeStream = fs.createWriteStream(destinationPath);
      let downloadedBytes = 0;
      let firstChunkVerified = false;

      // Read Web Stream into Node WriteStream with size cap & magic bytes inspection
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        downloadedBytes += value.length;

        // Abort if remote server sends more than 500MB (defeats zip bomb / infinite stream)
        if (downloadedBytes > MAX_IMPORT_SIZE_BYTES) {
          writeStream.destroy();
          fs.unlinkSync(destinationPath);
          return reply.status(413).send({
            success: false,
            error: { code: 'FILE_TOO_LARGE', message: 'Remote file exceeds 500MB limit' },
          });
        }

        // Verify magic bytes on the first chunk
        if (!firstChunkVerified && value.length >= 12) {
          const sig = validateMediaSignature(value);
          if (!sig.isValidMedia) {
            writeStream.destroy();
            fs.unlinkSync(destinationPath);
            return reply.status(400).send({
              success: false,
              error: { code: 'INVALID_MEDIA_TYPE', message: 'Remote file header is not a valid audio, video, or image' },
            });
          }
          firstChunkVerified = true;
        }

        writeStream.write(Buffer.from(value));
      }

      await new Promise((resolve) => writeStream.end(resolve));

      return reply.send({
        success: true,
        data: {
          fileId,
          filename: path.basename(urlPath),
          localPath: destinationPath,
          sizeBytes: downloadedBytes,
        },
      });
    } catch (err: any) {
      if (fs.existsSync(destinationPath)) {
        fs.unlinkSync(destinationPath);
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'STREAM_FAILED', message: err.message || 'Stream fetch failed' },
      });
    }
  });
};
