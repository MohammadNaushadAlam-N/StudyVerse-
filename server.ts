/**
 * StudyVerse 10 — Express Full-Stack Server
 * 
 * Provides:
 * - Server-side proxy routes for Gemini Study Buddy (/api/study-buddy/*)
 * - Safe API key handling (GEMINI_API_KEY remains server-side only)
 * - Vite middlewares in development mode
 * - Static asset serving in production
 * - Port 3000 binding as required by AI Studio environment
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { studyBuddyService, TeachingLanguage } from './src/server/studyBuddyService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createServer() {
  const app = express();
  const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000;

  app.use(express.json());

  // ==========================================================================
  // Study Buddy API Routes (Server-Side Proxy — API Key Never Exposed)
  // ==========================================================================

  // Health and service status check (zero secret exposure)
  app.get('/api/study-buddy/health', (_req: Request, res: Response) => {
    const status = studyBuddyService.getStatus();
    res.json({
      status: 'ok',
      service: 'StudyVerse 10 Gemini Study Buddy',
      ...status,
    });
  });

  // Concept Explanation endpoint (5-part teaching template)
  app.post('/api/study-buddy/explain', async (req: Request, res: Response) => {
    try {
      const {
        chapterId = 'ch01',
        conceptId,
        topicQuery,
        language = 'simpleEnglish',
        clientId = req.ip || 'anonymous_cadet',
      } = req.body;

      const result = await studyBuddyService.explainConcept({
        chapterId,
        conceptId,
        topicQuery,
        language: language as TeachingLanguage,
        clientId,
      });

      res.json(result);
    } catch (err: any) {
      if (err.message && err.message.includes('Rate limit exceeded')) {
        res.status(429).json({ error: err.message, status: 'rate_limited' });
      } else {
        res.status(500).json({ error: 'Internal Study Buddy error', message: err.message });
      }
    }
  });

  // Progressive Hint endpoint (Levels 1, 2, 3)
  app.post('/api/study-buddy/hint', async (req: Request, res: Response) => {
    try {
      const {
        chapterId = 'ch01',
        conceptId,
        topicQuery,
        language = 'simpleEnglish',
        clientId = req.ip || 'anonymous_cadet',
        hintLevel = 1,
      } = req.body;

      const result = await studyBuddyService.getHint({
        chapterId,
        conceptId,
        topicQuery,
        language: language as TeachingLanguage,
        clientId,
        hintLevel: hintLevel as 1 | 2 | 3,
      });

      res.json(result);
    } catch (err: any) {
      if (err.message && err.message.includes('Rate limit exceeded')) {
        res.status(429).json({ error: err.message, status: 'rate_limited' });
      } else {
        res.status(500).json({ error: 'Internal hint error', message: err.message });
      }
    }
  });

  // Interactive Tutor Chat endpoint
  app.post('/api/study-buddy/chat', async (req: Request, res: Response) => {
    try {
      const {
        chapterId = 'ch01',
        conceptId,
        topicQuery,
        language = 'simpleEnglish',
        clientId = req.ip || 'anonymous_cadet',
      } = req.body;

      const result = await studyBuddyService.explainConcept({
        chapterId,
        conceptId,
        topicQuery,
        language: language as TeachingLanguage,
        clientId,
        mode: 'chat',
      });

      res.json(result);
    } catch (err: any) {
      if (err.message && err.message.includes('Rate limit exceeded')) {
        res.status(429).json({ error: err.message, status: 'rate_limited' });
      } else {
        res.status(500).json({ error: 'Internal chat error', message: err.message });
      }
    }
  });

  // ==========================================================================
  // Vite Integration (Dev) / Static Serving (Prod)
  // ==========================================================================
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  return { app, PORT };
}

// Start server if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.env.RUN_SERVER === 'true') {
  createServer()
    .then(({ app, PORT }) => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[StudyVerse 10] Server running at http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('[StudyVerse 10] Server initialization failed:', err);
    });
}
