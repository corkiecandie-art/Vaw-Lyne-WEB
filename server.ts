/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json());

// Ensure the local data directory exists for persistent submissions list
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Interface for subscriber
interface Subscriber {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

// Helper to save subscribers to JSON database
function saveSubscriber(name: string, email: string): Subscriber {
  const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
  let subscribers: Subscriber[] = [];
  try {
    subscribers = JSON.parse(fileContent);
  } catch (err) {
    subscribers = [];
  }

  const id = `VL-FAN-${Math.floor(1000 + Math.random() * 9000)}`;
  const newSubscriber: Subscriber = {
    id,
    name,
    email,
    joinDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  subscribers.push(newSubscriber);
  fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2), 'utf-8');
  return newSubscriber;
}

// 1. API: Subscribe Fan (Saves locally for persistence)
app.post('/api/subscribe', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields.' });
  }

  try {
    // Save subscriber locally for persistence and viewing
    const newSubscriber = saveSubscriber(name, email);

    return res.status(200).json({
      success: true,
      subscriber: newSubscriber,
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 2. API: Retrieve list of fan subscribers
app.get('/api/subscribers', (req, res) => {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const subscribers = JSON.parse(fileContent);
    return res.status(200).json(subscribers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to read subscribers.' });
  }
});

// Vite middleware for development vs static build in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
});
