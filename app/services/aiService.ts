import { httpClient } from "./client";

export interface AiProviderModel {
  id: string;
  label: string;
  tier: string;
}

export interface AiProviderInfo {
  id: string;
  label: string;
  models: AiProviderModel[];
  supportsVision: boolean;
  defaultModel: string;
}

export interface AiConfig {
  id: number;
  userId: number;
  provider: string;
  chatModel?: string | null;
  genModel?: string | null;
  visionModel?: string | null;
  mode: string;
  fallbackEnabled: boolean;
  updatedAt: string;
}

export const aiService = {
  getProviders(): Promise<AiProviderInfo[]> {
    return httpClient.request<AiProviderInfo[]>("/ai/providers", { method: "GET" });
  },

  getConfig(): Promise<AiConfig> {
    return httpClient.request<AiConfig>("/ai/config", { method: "GET" });
  },

  updateConfig(dto: {
    provider?: string;
    chatModel?: string;
    genModel?: string;
    visionModel?: string;
    mode?: string;
    fallbackEnabled?: boolean;
    byokProvider?: string;
    byokKey?: string;
  }): Promise<AiConfig> {
    return httpClient.request<AiConfig>("/ai/config", {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  testConnection(dto: { provider: string; model: string }): Promise<{
    ok: boolean;
    latencyMs: number;
    model: string;
    provider: string;
    error?: string;
  }> {
    return httpClient.request("/ai/config/test", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};
