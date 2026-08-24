const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const config = require('../../config/env');

class ProviderService {
  constructor() {
    this.provider = (config.AI?.PROVIDER || 'gemini').toLowerCase();
    this.gemini = null;
    this.openai = null;

    if (config.AI?.API_KEY && !/^(sk-)?placeholder$/i.test(config.AI.API_KEY.trim())) {
      const apiKey = config.AI.API_KEY.trim();
      if (this.provider === 'gemini') {
        try {
          this.gemini = new GoogleGenAI({ apiKey });
        } catch (err) {
          console.warn('Gemini initialization notice:', err.message);
        }
      } else if (this.provider === 'openai') {
        try {
          this.openai = new OpenAI({
            apiKey,
            baseURL: config.AI.BASE_URL,
            timeout: config.AI.TIMEOUT_MS || 30000,
          });
        } catch (err) {
          console.warn('OpenAI initialization notice:', err.message);
        }
      }
    }
  }

  hasLiveProvider() {
    return Boolean(this.gemini || this.openai);
  }

  getProviderName() {
    if (this.gemini) return 'gemini';
    if (this.openai) return 'openai';
    return null;
  }

  _parseJSONContent(text) {
    if (typeof text !== 'string') return text;
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    try {
      return JSON.parse(clean);
    } catch {
      return { raw: clean };
    }
  }

  async callLLM(systemPrompt, userPrompt, responseFormat = 'json_object') {
    if (!this.hasLiveProvider()) {
      return null;
    }

    if (this.gemini) {
      try {
        const model = config.AI.MODEL || 'gemini-3.6-flash';
        const response = await this.gemini.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: responseFormat === 'json_object' ? 'application/json' : 'text/plain',
            temperature: 0.7,
            maxOutputTokens: config.AI.MAX_OUTPUT_TOKENS || 1200,
          },
        });

        const rawText = response.text || '';
        const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
        const parsedContent = responseFormat === 'json_object' ? this._parseJSONContent(rawText) : rawText;

        return {
          content: parsedContent,
          tokensUsed,
          raw: response,
          provider: 'gemini',
        };
      } catch (error) {
        console.warn('Live Gemini LLM provider error, falling back to heuristic engine:', error.message);
        return null;
      }
    }

    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: config.AI.MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
          max_tokens: config.AI.MAX_OUTPUT_TOKENS || 1200,
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        const tokensUsed = response.usage?.total_tokens || 0;

        return {
          content: responseFormat === 'json_object' ? this._parseJSONContent(content) : content,
          tokensUsed,
          raw: response,
          provider: 'openai',
        };
      } catch (error) {
        console.warn('Live OpenAI LLM provider error, falling back to heuristic engine:', error.message);
        return null;
      }
    }

    return null;
  }
}

module.exports = new ProviderService();
