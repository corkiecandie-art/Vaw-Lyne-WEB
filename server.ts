/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { 
  runAutoSyncScan, 
  getStoredSyncedReleases, 
  getSyncStatus, 
  addReleaseFromUrl 
} from './src/services/autosync';

dotenv.config();

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

// Ensure local contact submissions data file exists
const CONTACT_FILE = path.join(DATA_DIR, 'contact_submissions.json');
if (!fs.existsSync(CONTACT_FILE)) {
  fs.writeFileSync(CONTACT_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// 3. API: Contact Form Submission (Prepared for Resend API integration)
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields (name, email, subject, message) are required.' });
  }

  try {
    // 1. Save submission locally for persistence / backup
    const fileContent = fs.readFileSync(CONTACT_FILE, 'utf-8');
    let submissions = [];
    try {
      submissions = JSON.parse(fileContent);
    } catch (e) {
      submissions = [];
    }

    const newSubmission = {
      id: `VL-MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      subject,
      message,
      submittedAt: new Date().toISOString()
    };

    submissions.push(newSubmission);
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(submissions, null, 2), 'utf-8');

    // 2. Prepare Resend Integration
    const resendApiKey = process.env.RESEND_API_KEY;
    const hasResend = resendApiKey && resendApiKey.trim() !== '' && !resendApiKey.includes('YOUR_');

    if (hasResend) {
      console.log(`[Server] Resend API Key found. Dispatching email for submission: ${newSubmission.id}`);
      
      const emailPayload = {
        from: 'Vaw Lyne Portal <onboarding@resend.dev>',
        to: 'corkiecandie@gmail.com',
        subject: `[Vaw Lyne Contact] ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #FF4FA3; border-bottom: 2px solid #FF4FA3; padding-bottom: 10px;">New Contact Form Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 6px; line-height: 1.6; color: #333;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #999;">Submitted on ${new Date().toLocaleString()}</p>
          </div>
        `
      };

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error(`[Server] Resend API responded with error:`, errorText);
      } else {
        console.log(`[Server] Email sent successfully via Resend for submission: ${newSubmission.id}`);
      }
    } else {
      console.log(`[Server] (Local Mock Mode) Contact form message received & saved. No Resend API Key configured:`, newSubmission);
    }

    return res.status(200).json({
      success: true,
      message: 'Message delivered and saved successfully.',
      submission: newSubmission
    });

  } catch (error: any) {
    console.error('Contact form endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// ==========================================
// AUTOMATED DISCOVERY & DSP AUTO-SYNC ENDPOINTS
// ==========================================

// 1. Get stored auto-synced releases
app.get('/api/sync/releases', (req, res) => {
  try {
    const releases = getStoredSyncedReleases();
    return res.status(200).json(releases);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch synced releases.' });
  }
});

// 2. Get auto-sync status
app.get('/api/sync/status', (req, res) => {
  try {
    const status = getSyncStatus();
    return res.status(200).json(status);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch sync status.' });
  }
});

// 3. Trigger manual or automated auto-sync scan across Apple Music, YouTube & Odesli
app.post('/api/sync/auto-discover', async (req, res) => {
  try {
    console.log('[Server] Running automated DSP & YouTube discovery scan for Vaw Lyne...');
    const result = await runAutoSyncScan();
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Server] Auto-sync scan error:', err);
    return res.status(500).json({ error: err.message || 'Auto-sync scan failed' });
  }
});

// 4. One-click URL Auto-Enrichment & Publishing Endpoint
app.post('/api/sync/add-link', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Primary streaming URL or YouTube link is required.' });
  }
  try {
    console.log(`[Server] Auto-enriching release from URL: ${url}`);
    const release = await addReleaseFromUrl(url);
    if (!release) {
      return res.status(422).json({ error: 'Could not parse streaming metadata from the provided URL.' });
    }
    return res.status(200).json({
      success: true,
      message: `Release "${release.title}" successfully auto-enriched and published into catalog!`,
      release
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to enrich link' });
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
    
    // Launch initial background DSP & YouTube auto-discovery scan
    setTimeout(() => {
      console.log('[AutoSync Engine] Starting initial background music catalog scan...');
      runAutoSyncScan().then((res) => {
        console.log(`[AutoSync Engine] Boot scan finished: ${res.message}`);
      }).catch((err) => {
        console.error('[AutoSync Engine] Boot scan error:', err);
      });
    }, 3000);

    // Schedule 30-minute continuous background auto-sync poll
    const SYNC_INTERVAL_MS = 30 * 60 * 1000;
    setInterval(() => {
      console.log('[AutoSync Engine] Executing periodic background DSP auto-sync scan...');
      runAutoSyncScan().catch((err) => {
        console.error('[AutoSync Engine] Periodic scan error:', err);
      });
    }, SYNC_INTERVAL_MS);
  });
});
