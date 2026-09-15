const config = require('../config/env');
const axios = require('axios');

/**
 * Deterministic Rule-Based Builder (Offline Fallback)
 * Produces structured, runnable workflow graphs for common automation patterns.
 */
function deterministicBuilder(prompt = '') {
  const p = prompt.toLowerCase();
  let name = 'Automated Agent Workflow';
  let description = prompt || 'Generated autonomous operations graph';
  let nodes = [];
  let edges = [];

  if (p.includes('invoice') || p.includes('bill') || p.includes('receipt') || (p.includes('email') && p.includes('slack'))) {
    name = 'Invoice Processing & Notification Pipeline';
    nodes = [
      {
        id: 'node-1',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Gmail: Invoice Received',
          provider: 'gmail',
          action: 'read_mail',
          config: { query: 'subject:Invoice has:attachment', interval: '5m' },
        },
      },
      {
        id: 'node-2',
        type: 'aiAction',
        position: { x: 400, y: 150 },
        data: {
          label: 'AI: Extract Invoice Data',
          provider: 'openrouter',
          action: 'extract_entities',
          config: {
            schema: 'amount, vendor, invoice_number, due_date',
            prompt: 'Extract amount, vendor name, invoice number, and due date from the email text and attachment.',
          },
        },
      },
      {
        id: 'node-3',
        type: 'condition',
        position: { x: 700, y: 150 },
        data: {
          label: 'Condition: Amount > $1,000',
          action: 'evaluate_rule',
          config: { condition: 'amount > 1000' },
        },
      },
      {
        id: 'node-4',
        type: 'integration',
        position: { x: 1000, y: 100 },
        data: {
          label: 'Slack: Alert Finance Channel',
          provider: 'slack',
          action: 'post_message',
          config: {
            channel: '#finance-approvals',
            message: '🚨 High-value invoice detected: ${{amount}} from {{vendor}} (Inv #{{invoice_number}}). Needs review.',
          },
        },
      },
      {
        id: 'node-5',
        type: 'integration',
        position: { x: 1000, y: 240 },
        data: {
          label: 'Google Sheets: Log Transaction',
          provider: 'google-sheets',
          action: 'append_row',
          config: {
            spreadsheetId: 'FINANCE_LEDGER',
            range: 'Invoices!A:E',
            values: ['{{invoice_number}}', '{{vendor}}', '{{amount}}', '{{due_date}}', 'PENDING'],
          },
        },
      },
    ];
    edges = [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, label: 'True' },
      { id: 'e3-5', source: 'node-3', target: 'node-5', animated: true, label: 'Always' },
    ];
  } else if (p.includes('discord') || p.includes('community') || p.includes('ticket')) {
    name = 'Community Support & Discord Alert Router';
    nodes = [
      {
        id: 'node-1',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Webhook: New Support Ticket',
          provider: 'custom',
          action: 'webhook_listener',
          config: { path: '/support-ticket' },
        },
      },
      {
        id: 'node-2',
        type: 'aiAction',
        position: { x: 400, y: 150 },
        data: {
          label: 'AI: Classify Urgency & Sentiment',
          provider: 'gemini',
          action: 'sentiment_analysis',
          config: { categories: 'Critical, High, Medium, Low' },
        },
      },
      {
        id: 'node-3',
        type: 'integration',
        position: { x: 750, y: 150 },
        data: {
          label: 'Discord: Post to #ops-urgent',
          provider: 'discord',
          action: 'send_message',
          config: {
            channelId: 'ops-urgent',
            content: '🔥 Support Ticket [{{urgency}}]: {{summary}} from {{customer_email}}',
          },
        },
      },
    ];
    edges = [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
    ];
  } else if (p.includes('sheet') || p.includes('excel') || p.includes('row') || p.includes('data')) {
    name = 'Automated Data Ingestion & Google Sheet Sync';
    nodes = [
      {
        id: 'node-1',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Trigger: Daily Scheduled Sync',
          action: 'cron_schedule',
          config: { cron: '0 9 * * *' },
        },
      },
      {
        id: 'node-2',
        type: 'aiAction',
        position: { x: 400, y: 150 },
        data: {
          label: 'AI: Summarize Operations KPIs',
          provider: 'openrouter',
          action: 'text_summarization',
          config: { metrics: 'Active users, conversion rate, system errors' },
        },
      },
      {
        id: 'node-3',
        type: 'integration',
        position: { x: 750, y: 150 },
        data: {
          label: 'Google Sheets: Append Metrics',
          provider: 'google-sheets',
          action: 'append_row',
          config: { spreadsheetId: 'KPI_SHEET', range: 'Sheet1!A:C' },
        },
      },
    ];
    edges = [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
    ];
  } else {
    // Default general email -> AI action -> Slack notification workflow
    name = prompt.slice(0, 40) ? `${prompt.slice(0, 40)} Workflow` : 'Smart Operations Flow';
    nodes = [
      {
        id: 'node-1',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Gmail: Inbound Event',
          provider: 'gmail',
          action: 'read_mail',
          config: { filter: 'is:unread' },
        },
      },
      {
        id: 'node-2',
        type: 'aiAction',
        position: { x: 420, y: 150 },
        data: {
          label: 'AI Agent: Analyze Intent',
          provider: 'openrouter',
          action: 'analyze_and_extract',
          config: { instructions: prompt },
        },
      },
      {
        id: 'node-3',
        type: 'integration',
        position: { x: 780, y: 150 },
        data: {
          label: 'Slack: Broadcast Action Result',
          provider: 'slack',
          action: 'post_message',
          config: { channel: '#general', message: 'Agent finished processing: {{result}}' },
        },
      },
    ];
    edges = [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
    ];
  }

  return {
    name,
    description,
    nodes,
    edges,
    tags: ['ai-generated', 'autonomous'],
    generatedBy: 'deterministic-rule-engine',
  };
}

/**
 * Generate structured workflow graph using LLM with deterministic fallback.
 */
const generateWorkflowFromPrompt = async (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Valid prompt string is required.');
  }

  // 1. Try OpenRouter if API key configured
  if (config.openrouterApiKey) {
    try {
      const systemPrompt = `You are an expert AI Operations Orchestrator. Output ONLY valid JSON representing a complete visual workflow DAG.
JSON format:
{
  "name": "Short Descriptive Title",
  "description": "Clear overview",
  "tags": ["tag1", "tag2"],
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger | aiAction | integration | condition | transform | output",
      "position": { "x": 100, "y": 150 },
      "data": {
        "label": "Short Title",
        "provider": "gmail | slack | discord | google-sheets | openrouter | gemini | custom",
        "action": "action_name",
        "config": {}
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-1", "target": "node-2", "animated": true }
  ]
}`;

      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: config.openrouterModel || 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate workflow for prompt: "${prompt}"` },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${config.openrouterApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = res.data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.nodes && parsed.edges) {
          parsed.generatedBy = 'openrouter';
          return parsed;
        }
      }
    } catch (err) {
      console.warn('⚠️ OpenRouter generation failed, falling back:', err.message);
    }
  }

  // 2. Try Gemini if API key configured
  if (config.geminiApiKey) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: config.geminiModel || 'gemini-2.0-flash' });

      const promptText = `Generate a valid JSON workflow graph for this prompt: "${prompt}".
Output only JSON matching this schema: { "name": string, "description": string, "tags": string[], "nodes": [{"id": string, "type": string, "position": {"x": number, "y": number}, "data": {"label": string, "provider": string, "action": string, "config": object}}], "edges": [{"id": string, "source": string, "target": string, "animated": boolean}] }`;

      const result = await model.generateContent(promptText);
      const text = result.response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.nodes && parsed.edges) {
        parsed.generatedBy = 'gemini';
        return parsed;
      }
    } catch (err) {
      console.warn('⚠️ Gemini generation failed, falling back:', err.message);
    }
  }

  // 3. Fall back to Deterministic Rule Engine
  return deterministicBuilder(prompt);
};

module.exports = {
  generateWorkflowFromPrompt,
  deterministicBuilder,
};
