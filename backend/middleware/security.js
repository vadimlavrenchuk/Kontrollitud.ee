/**
 * security.js — Rate limiting + Security alert logging
 *
 * Rate limiters:
 *   - apiLimiter       : 120 req / 15 min  (general API)
 *   - adminLimiter     : 10  req / 15 min  (admin routes)
 *   - authLimiter      :  20 req / 15 min  (login/register)
 *
 * Alerts:
 *   - securityLogger   : middleware that logs 401/403 on admin paths
 *                        and sends email (max 1 email per 5 minutes to avoid spam)
 */

const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

// ─── Email transport (reuses existing Zoho SMTP config) ───────────────────────
const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.eu',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ─── Cooldown to avoid email flood (one alert per 5 minutes max) ──────────────
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;
const alertState = {
    lastSentAt: 0,
    pendingCount: 0,          // attempts buffered during cooldown
    pendingDetails: [],       // details of buffered attempts
};

async function sendSecurityAlert(details) {
    const now = Date.now();
    alertState.pendingCount++;
    alertState.pendingDetails.push(details);

    // Still within cooldown period — buffer and return
    if (now - alertState.lastSentAt < ALERT_COOLDOWN_MS) return;

    alertState.lastSentAt = now;
    const count = alertState.pendingCount;
    const rows = alertState.pendingDetails
        .map(d => `• ${d.time}  ${d.status}  ${d.method} ${d.path}  IP: ${d.ip}  UA: ${d.ua}`)
        .join('\n');

    // Reset buffer
    alertState.pendingCount = 0;
    alertState.pendingDetails = [];

    const subject = `🚨 [Kontrollitud.ee] ${count} подозрительных запрос${count === 1 ? '' : 'а'} к панели управления`;
    const text = `Кто-то пытался получить доступ к защищённым маршрутам.\n\n${rows}\n\nЕсли это не ты — немедленно проверь логи сервера.`;

    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️  SMTP не настроен, email-алерт не отправлен');
            return;
        }
        await mailer.sendMail({
            from: `"Kontrollitud Security" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,   // send alert to yourself
            subject,
            text,
        });
        console.log(`📧 Security alert sent (${count} attempt${count === 1 ? '' : 's'})`);
    } catch (err) {
        console.error('❌ Failed to send security alert email:', err.message);
    }
}

// ─── Security Logger Middleware ───────────────────────────────────────────────
/**
 * Attach AFTER routes. Intercepts responses with 401/403 on /api/admin/* paths
 * and triggers console log + email alert.
 */
function securityLogger(req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
        const status = res.statusCode;

        if ((status === 401 || status === 403) && req.path.startsWith('/api/admin')) {
            const ip =
                req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                req.socket?.remoteAddress ||
                'unknown';
            const ua = req.headers['user-agent'] || 'unknown';
            const time = new Date().toISOString();
            const method = req.method;
            const path = req.originalUrl;

            const msg = `🔐 BLOCKED [${status}] ${method} ${path} — IP: ${ip} — ${time}`;
            console.warn(msg);

            sendSecurityAlert({ time, status, method, path, ip, ua });
        }

        return originalJson(body);
    };

    next();
}

// ─── Rate Limiters ────────────────────────────────────────────────────────────

/** General API — 120 requests per 15 minutes */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    skip: (req) => {
        // Skip rate limiting for Stripe webhooks (they may burst)
        return req.path.startsWith('/api/webhooks/');
    },
});

/** Admin routes — 10 requests per 15 minutes (very strict) */
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many admin requests. Access temporarily blocked.' },
    handler: (req, res, next, options) => {
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress ||
            'unknown';
        const time = new Date().toISOString();

        console.warn(`🚫 RATE LIMIT HIT on admin route — IP: ${ip} — ${req.originalUrl} — ${time}`);
        sendSecurityAlert({
            time,
            status: 429,
            method: req.method,
            path: req.originalUrl,
            ip,
            ua: req.headers['user-agent'] || 'unknown',
        });

        res.status(429).json(options.message);
    },
});

/** Auth / login endpoints — 20 requests per 15 minutes */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please wait before trying again.' },
});

module.exports = { securityLogger, apiLimiter, adminLimiter, authLimiter };
