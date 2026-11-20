import { describe, expect, test } from 'bun:test';
import {
  buildInteractionsEndpoint,
  buildInteractionsProbePayload,
  getProviderUsageKey,
  INTERACTIONS_API_REVISION,
} from '../src/components/providers/utils';
import { normalizeConfigResponse } from '../src/services/api/transformers';

describe('Interactions API key provider', () => {
  test('normalizes the backend API key config', () => {
    const config = normalizeConfigResponse({
      'api-keys': {
        interactions: [
          {
            name: 'interactions-1',
            'base-url': 'https://generativelanguage.googleapis.com',
            keys: [
              {
                'api-key': 'interactions-secret',
                priority: 8,
                weight: 3,
                prefix: 'native',
                'proxy-url': 'direct',
                headers: { 'X-Custom': 'value' },
                models: [
                  {
                    name: 'gemini-3.1-flash-lite',
                    alias: 'native-flash',
                    thinking: { levels: ['low', 'medium', 'high'] },
                  },
                ],
                'excluded-models': ['gemini-2.5-*'],
                'disable-cooling': true,
                'auth-index': 'gemini-interactions:apikey:1',
              },
            ],
          },
        ],
      },
    });

    expect(config.interactionsApiKeys).toMatchObject([
      {
        apiKey: 'interactions-secret',
        priority: 8,
        weight: 3,
        prefix: 'native',
        baseUrl: 'https://generativelanguage.googleapis.com',
        proxyUrl: 'direct',
        headers: { 'X-Custom': 'value' },
        models: [
          {
            name: 'gemini-3.1-flash-lite',
            alias: 'native-flash',
            thinking: { levels: ['low', 'medium', 'high'] },
          },
        ],
        excludedModels: ['gemini-2.5-*'],
        disableCooling: true,
        authIndex: 'gemini-interactions:apikey:1',
      },
    ]);
  });

  test('builds the native interactions endpoint from supported base URL forms', () => {
    expect(buildInteractionsEndpoint('')).toBe(
      'https://generativelanguage.googleapis.com/v1beta/interactions'
    );
    expect(buildInteractionsEndpoint('https://generativelanguage.googleapis.com')).toBe(
      'https://generativelanguage.googleapis.com/v1beta/interactions'
    );
    expect(buildInteractionsEndpoint('https://example.com/v1beta')).toBe(
      'https://example.com/v1beta/interactions'
    );
    expect(buildInteractionsEndpoint('https://example.com/v1beta/interactions')).toBe(
      'https://example.com/v1beta/interactions'
    );
  });

  test('uses the documented revision and minimal non-streaming probe body', () => {
    expect(INTERACTIONS_API_REVISION).toBe('2026-05-20');
    expect(buildInteractionsProbePayload('gemini-3.6-flash')).toEqual({
      model: 'gemini-3.6-flash',
      input: 'Hi',
    });
  });

  test('maps the UI brand to the backend runtime usage provider', () => {
    expect(getProviderUsageKey('interactions')).toBe('gemini-interactions');
    expect(getProviderUsageKey('gemini')).toBe('gemini');
    expect(getProviderUsageKey('claude')).toBe('claude');
  });
});
