import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DISPATCH_URL = process.env.DISPATCH_API_URL || 'http://localhost:3000/api/intercept';

if (!TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN is missing from .env — please configure it.');
  process.exit(1);
}

if (!/^\d+:[A-Za-z0-9_-]+$/.test(TOKEN)) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN format is invalid. It should look like "123456:ABC-DEF..."');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 Dispatch Telegram connector is live. Waiting for messages...');

interface InterceptResponse {
  channel: string;
  senderId: string;
  tier: 'economy' | 'precision' | 'human_review';
  reason: string;
  scores: {
    riskScore: number;
    complexity: number;
    confidence: number;
    businessValue: number;
    signals: { name: string; confidence: string }[];
    dominantFactor: string;
    classificationBadge: string;
  };
  evidence: {
    requestId: string;
    cacheTier: string;
    benchmarkCost: number;
    customerCharge: number;
    saved: number;
  };
  reply?: string;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) {
    return; // ignore non-text messages (stickers, images, etc.) for this scope
  }

  // Ignore default command triggers
  if (text.startsWith('/')) {
    if (text === '/start') {
      await bot.sendMessage(chatId, "Welcome to the Dispatch Demo Bot! Send me support queries to see intelligent routing and automated response in action.");
    }
    return;
  }

  console.log(`\n📩 Incoming [chat ${chatId}]: "${text}"`);

  // Show typing indicator
  bot.sendChatAction(chatId, 'typing');

  try {
    const res = await fetch(DISPATCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        channel: 'telegram',
        senderId: String(chatId),
        mode: 'execute',
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`❌ Dispatch API error (${res.status}):`, errBody);
      await bot.sendMessage(chatId, "One moment — I'm having trouble processing that right now.");
      return;
    }

    const data = (await res.json()) as InterceptResponse;

    // Live console narration
    console.log(`   → Tier: ${data.tier.toUpperCase()}`);
    console.log(`   → Reason: ${data.reason}`);
    console.log(`   → Risk: ${data.scores.riskScore} | Complexity: ${data.scores.complexity} | Confidence: ${data.scores.confidence}`);
    console.log(`   → Cost: $${data.evidence.customerCharge.toFixed(4)} (saved $${data.evidence.saved.toFixed(4)}, cache: ${data.evidence.cacheTier})`);
    console.log(`   → Request ID: ${data.evidence.requestId || '—'}`);

    if (data.tier === 'human_review') {
      await bot.sendMessage(
        chatId,
        "Thanks for your message — this one needs a closer look from our team, we'll get back to you shortly."
      );
      console.log('   ⚠ Flagged for human review, no auto-reply sent to customer.');
      return;
    }

    if (data.reply) {
      await bot.sendMessage(chatId, data.reply);
      console.log('   ✅ Reply sent to customer.');
    } else {
      console.warn('   ⚠ No reply field in response despite execute mode — check /api/intercept.');
      await bot.sendMessage(chatId, "Got your message — someone will follow up shortly.");
    }
  } catch (err) {
    console.error('❌ Unexpected error calling Dispatch:', err);
    await bot.sendMessage(chatId, "Sorry, something went wrong on our end. We'll follow up shortly.");
  }
});

bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});
