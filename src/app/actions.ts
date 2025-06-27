// src/app/actions.ts
'use server';

import {
  generateMotivationalMessage,
  type MotivationalMessageInput,
} from '@/ai/flows/generate-motivational-message';

export async function getMotivationalMessageAction(
  input: MotivationalMessageInput
) {
  try {
    const result = await generateMotivationalMessage(input);
    return result;
  } catch (error) {
    console.error('Error generating motivational message:', error);
    return {
      message: "Keep pushing forward. Every moment of abstinence is a victory.",
      sentiment: 'motivational' as const,
    };
  }
}
