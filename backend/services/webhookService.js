// services/webhookService.js - Système de Webhooks
const crypto = require('crypto');
const SmartLink = require('../models/SmartLink');

class WebhookService {
  constructor() {
    this.webhooks = new Map();
  }

  // Enregistrer un webhook
  async registerWebhook(userId, webhookData) {
    const webhook = {
      id: this.generateId(),
      userId,
      url: webhookData.url,
      events: webhookData.events, // ['link_created', 'platform_clicked', 'view_tracked']
      secret: webhookData.secret || this.generateSecret(),
      active: true,
      createdAt: new Date()
    };

    // Sauvegarder en base
    await this.saveWebhook(webhook);
    return webhook;
  }

  // Déclencher les webhooks
  async triggerWebhooks(event, data) {
    const webhooks = await this.getActiveWebhooks(event);
    
    for (const webhook of webhooks) {
      try {
        await this.sendWebhook(webhook, event, data);
      } catch (error) {
        console.error(`Webhook failed for ${webhook.id}:`, error);
        await this.logWebhookError(webhook.id, error);
      }
    }
  }

  async sendWebhook(webhook, event, data) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhook_id: webhook.id
    };

    const signature = this.generateSignature(payload, webhook.secret);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SmartLink-Signature': signature,
        'X-SmartLink-Event': event,
        'User-Agent': 'SmartLink-Webhooks/1.0'
      },
      body: JSON.stringify(payload),
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await this.logWebhookSuccess(webhook.id, event);
  }

  generateSignature(payload, secret) {
    const data = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateId() {
    return 'wh_' + Math.random().toString(36).substr(2, 9);
  }

  async saveWebhook(webhook) {
    // Implementation depends on your database choice
    // For now, store in memory
    this.webhooks.set(webhook.id, webhook);
  }

  async getActiveWebhooks(event) {
    // Return webhooks that listen to this event
    return Array.from(this.webhooks.values()).filter(
      webhook => webhook.active && webhook.events.includes(event)
    );
  }

  async logWebhookError(webhookId, error) {
    console.error(`Webhook ${webhookId} error:`, error);
  }

  async logWebhookSuccess(webhookId, event) {
    console.log(`Webhook ${webhookId} successfully sent event: ${event}`);
  }
}

module.exports = { WebhookService };