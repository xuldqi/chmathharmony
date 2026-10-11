import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface VoiceRecognitionResult {
  success: boolean;
  text?: string;
  processed?: string;
  error?: string;
}

export interface VoiceRecognitionAvailability {
  available: boolean;
}

export interface VoiceRecognitionPermission {
  granted: boolean;
}

export interface VoiceRecognitionEvent {
  status?: string;
  transcript?: string;
  processed?: string;
  matches?: string[];
  message?: string;
}

export interface VoiceRecognitionPlugin {
  start(options: { language: string; partialResults: boolean; prompt: string }): Promise<VoiceRecognitionResult>;
  stop(): Promise<void>;
  available(): Promise<VoiceRecognitionAvailability>;
  checkPermission(): Promise<VoiceRecognitionPermission>;
  requestPermission(): Promise<VoiceRecognitionPermission>;
  addListener(eventName: string, listenerFunc: (event: VoiceRecognitionEvent) => void): Promise<PluginListenerHandle>;
}

const VoiceRecognition = registerPlugin<VoiceRecognitionPlugin>('VoiceRecognition');

export default VoiceRecognition;