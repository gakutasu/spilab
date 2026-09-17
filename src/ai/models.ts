export interface ModelOption {
  id: string;
  label: string;
  /** Whether `output_config.effort` is accepted by this model. */
  supportsEffort: boolean;
  /** Whether server-side refusal fallbacks should be requested. */
  supportsFallbacks: boolean;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'claude-opus-5', label: 'Claude Opus 5（推奨・正確）', supportsEffort: true, supportsFallbacks: true },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5（速い・安い）', supportsEffort: true, supportsFallbacks: false },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5（最安）', supportsEffort: false, supportsFallbacks: false },
];

export function modelOption(id: string): ModelOption {
  return MODEL_OPTIONS.find((m) => m.id === id) ?? { id, label: id, supportsEffort: true, supportsFallbacks: false };
}
