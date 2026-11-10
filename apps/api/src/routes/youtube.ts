import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { parseYouTubeUrl } from '@universal/conversion-core';

const OEmbedQuerySchema = z.object({
  url: z.string().min(1),
});

export const youtubeRoutes: FastifyPluginAsync = async (server) => {
  server.get('/youtube/oembed', async (request, reply) => {
    const parsed = OEmbedQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Parameter "url" is required.' },
      });
    }

    const parseResult = parseYouTubeUrl(parsed.data.url);
    if (!parseResult.isValid || !parseResult.canonicalUrl) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_YOUTUBE_URL', message: parseResult.reason || 'Not a valid YouTube URL.' },
      });
    }

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        parseResult.canonicalUrl
      )}&format=json`;

      const res = await fetch(oembedUrl);
      if (!res.ok) {
        return reply.status(404).send({
          success: false,
          error: { code: 'VIDEO_NOT_FOUND', message: 'Video not found or is set to private.' },
        });
      }

      const oembedData = (await res.json()) as any;

      return reply.send({
        success: true,
        data: {
          videoId: parseResult.videoId,
          canonicalUrl: parseResult.canonicalUrl,
          title: String(oembedData.title || '').slice(0, 255),
          authorName: String(oembedData.author_name || '').slice(0, 100),
          authorUrl: oembedData.author_url,
          thumbnailUrl: oembedData.thumbnail_url,
          providerName: 'YouTube',
        },
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'OEMBED_FETCH_FAILED', message: err.message || 'Failed to fetch video preview.' },
      });
    }
  });
};
