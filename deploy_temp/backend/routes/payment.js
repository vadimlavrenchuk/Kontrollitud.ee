// Payment routes for Stripe integration
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// Initialize Stripe with secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Import Company model (will be passed from server.js)
let Company;

// Initialize the router with Company model
function initializePaymentRoutes(companyModel) {
    Company = companyModel;
    return router;
}

// ===== CREATE CHECKOUT SESSION =====
router.post('/create-checkout-session', verifyToken, async (req, res) => {
    try {
        const { companyId, subscriptionLevel } = req.body;
        
        // Validate subscription level
        if (!['pro', 'enterprise'].includes(subscriptionLevel)) {
            return res.status(400).json({ 
                error: 'Invalid subscription level. Must be "pro" or "enterprise"' 
            });
        }
        
        // Find company
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        // Verify user owns this company
        if (company.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized: You do not own this company' });
        }
        
        // Determine price ID based on subscription level
        let priceId;
        let planName;
        
        if (subscriptionLevel === 'pro') {
            priceId = process.env.STRIPE_PRICE_PRO;
            planName = 'Pro Plan';
        } else if (subscriptionLevel === 'enterprise') {
            priceId = process.env.STRIPE_PRICE_ENTERPRISE;
            planName = 'Enterprise Plan';
        }
        
        if (!priceId) {
            return res.status(500).json({ 
                error: 'Stripe price ID not configured for this plan' 
            });
        }
        
        // Create or retrieve Stripe customer
        let customerId = company.stripeCustomerId;
        
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: company.userEmail,
                metadata: {
                    companyId: companyId,
                    userId: company.userId
                }
            });
            customerId = customer.id;
            
            // Save customer ID to company
            company.stripeCustomerId = customerId;
            await company.save();
        }
        
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled?company_id=${companyId}`,
            metadata: {
                companyId: companyId,
                subscriptionLevel: subscriptionLevel,
                userId: company.userId
            },
            subscription_data: {
                metadata: {
                    companyId: companyId,
                    subscriptionLevel: subscriptionLevel
                }
            }
        });
        
        // Update company status to pending_payment
        company.approvalStatus = 'pending_payment';
        company.stripeSessionId = session.id;
        await company.save();
        
        console.log(`✅ Checkout session created for company: ${company.name} (${planName})`);
        
        res.json({ 
            sessionId: session.id, 
            url: session.url,
            message: 'Checkout session created successfully'
        });
        
    } catch (error) {
        console.error('❌ Stripe checkout error:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
});

// ===== STRIPE WEBHOOK HANDLER =====
router.post('/webhooks/stripe', 
    express.raw({ type: 'application/json' }), 
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
        console.log(`🔔 Stripe webhook received: ${event.type}`);
        
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    await handleCheckoutCompleted(event.data.object);
                    break;
                    
                case 'customer.subscription.created':
                    await handleSubscriptionCreated(event.data.object);
                    break;
                    
                case 'customer.subscription.updated':
                    await handleSubscriptionUpdated(event.data.object);
                    break;
                    
                case 'customer.subscription.deleted':
                    await handleSubscriptionDeleted(event.data.object);
                    break;
                    
                case 'invoice.payment_succeeded':
                    await handleInvoicePaymentSucceeded(event.data.object);
                    break;
                    
                case 'invoice.payment_failed':
                    await handleInvoicePaymentFailed(event.data.object);
                    break;
                    
                default:
                    console.log(`⚠️ Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            console.error('❌ Error processing webhook:', error);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
        
        res.json({ received: true });
});

// ===== WEBHOOK HANDLERS =====

async function handleCheckoutCompleted(session) {
    const companyId = session.metadata.companyId;
    const subscriptionLevel = session.metadata.subscriptionLevel;
    
    console.log(`✅ Processing checkout completion for company: ${companyId}`);
    
    const company = await Company.findById(companyId);
    
    if (!company) {
        console.error(`❌ Company not found: ${companyId}`);
        return;
    }
    
    if (company.approvalStatus === 'pending_payment') {
        // Update company to approved status
        company.approvalStatus = 'approved';
        company.isVerified = true;
        company.subscriptionLevel = subscriptionLevel;
        company.stripeSubscriptionId = session.subscription;
        company.paymentConfirmedAt = new Date();
        
        // Set subscription expiration (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        company.planExpiresAt = expiresAt;
        company.planReminderSent = false;
        
        await company.save();
        
        console.log(`✅ Company approved and activated: ${company.name} (${subscriptionLevel})`);
        
        // TODO: Send confirmation email
        // await sendPaymentConfirmationEmail(company);
    }
}

async function handleSubscriptionCreated(subscription) {
    const companyId = subscription.metadata.companyId;
    
    console.log(`📝 Subscription created for company: ${companyId}`);
    
    const company = await Company.findById(companyId);
    if (company) {
        company.stripeSubscriptionId = subscription.id;
        await company.save();
    }
}

async function handleSubscriptionUpdated(subscription) {
    const company = await Company.findOne({ stripeSubscriptionId: subscription.id });
    
    if (!company) {
        console.error(`❌ Company not found for subscription: ${subscription.id}`);
        return;
    }
    
    console.log(`🔄 Subscription updated for company: ${company.name}`);
    
    // Update expiration date based on current period end
    const expiresAt = new Date(subscription.current_period_end * 1000);
    company.planExpiresAt = expiresAt;
    
    // Check if subscription is cancelled
    if (subscription.cancel_at_period_end) {
        console.log(`⚠️ Subscription will cancel at period end: ${company.name}`);
        // TODO: Send cancellation notice email
    }
    
    await company.save();
}

async function handleSubscriptionDeleted(subscription) {
    const company = await Company.findOne({ stripeSubscriptionId: subscription.id });
    
    if (!company) {
        console.error(`❌ Company not found for subscription: ${subscription.id}`);
        return;
    }
    
    console.log(`❌ Subscription deleted for company: ${company.name}`);
    
    // Downgrade to basic plan
    company.subscriptionLevel = 'basic';
    company.isVerified = false;
    company.planExpiresAt = new Date();
    company.planDowngradedAt = new Date();
    
    // Clear premium features
    company.image = null;
    company.instagramUrl = null;
    company.tiktokUrl = null;
    company.youtubeUrl = null;
    company.blogArticleUrl = null;
    
    await company.save();
    
    // TODO: Send downgrade notification email
}

async function handleInvoicePaymentSucceeded(invoice) {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) return;
    
    const company = await Company.findOne({ stripeSubscriptionId: subscriptionId });
    
    if (company) {
        console.log(`✅ Payment succeeded for company: ${company.name}`);
        
        // Extend subscription period
        const expiresAt = new Date(invoice.period_end * 1000);
        company.planExpiresAt = expiresAt;
        company.planReminderSent = false;
        
        await company.save();
        
        // TODO: Send payment receipt email
    }
}

async function handleInvoicePaymentFailed(invoice) {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) return;
    
    const company = await Company.findOne({ stripeSubscriptionId: subscriptionId });
    
    if (company) {
        console.log(`❌ Payment failed for company: ${company.name}`);
        
        // TODO: Send payment failed notification email
    }
}

// ===== GET SUBSCRIPTION STATUS =====
router.get('/subscription-status/:companyId', verifyToken, async (req, res) => {
    try {
        const { companyId } = req.params;
        
        const company = await Company.findById(companyId);
        
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        // Verify user owns this company
        if (company.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        let subscriptionDetails = null;
        
        // Get subscription details from Stripe if exists
        if (company.stripeSubscriptionId) {
            try {
                const subscription = await stripe.subscriptions.retrieve(
                    company.stripeSubscriptionId
                );
                
                subscriptionDetails = {
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end
                };
            } catch (error) {
                console.error('Error fetching subscription from Stripe:', error);
            }
        }
        
        res.json({
            subscriptionLevel: company.subscriptionLevel,
            approvalStatus: company.approvalStatus,
            isVerified: company.isVerified,
            planExpiresAt: company.planExpiresAt,
            stripeSubscription: subscriptionDetails
        });
        
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

// ===== CANCEL SUBSCRIPTION =====
router.post('/cancel-subscription/:companyId', verifyToken, async (req, res) => {
    try {
        const { companyId } = req.params;
        
        const company = await Company.findById(companyId);
        
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        // Verify user owns this company
        if (company.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!company.stripeSubscriptionId) {
            return res.status(400).json({ error: 'No active subscription found' });
        }
        
        // Cancel subscription at period end (don't cancel immediately)
        const subscription = await stripe.subscriptions.update(
            company.stripeSubscriptionId,
            { cancel_at_period_end: true }
        );
        
        console.log(`🚫 Subscription cancelled for company: ${company.name} (ends at ${new Date(subscription.current_period_end * 1000)})`);
        
        res.json({ 
            message: 'Subscription will be cancelled at the end of the billing period',
            endsAt: new Date(subscription.current_period_end * 1000)
        });
        
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

module.exports = { initializePaymentRoutes };
