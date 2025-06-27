// src/ai/flows/generate-motivational-message.ts
'use server';

/**
 * @fileOverview Generates personalized motivational messages based on user progress.
 *
 * - generateMotivationalMessage - A function that generates a motivational message.
 * - MotivationalMessageInput - The input type for the generateMotivationalMessage function.
 * - MotivationalMessageOutput - The return type for the generateMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalMessageInputSchema = z.object({
  elapsedTime: z
    .number()
    .describe('The elapsed time in seconds since the last instance.'),
  successRate: z
    .number()
    .describe(
      'The user\'s success rate, as a decimal between 0 and 1 (inclusive).' // Corrected description
    ),
  failureCount: z.number().describe('The number of past failures.'),
  overallTrend: z
    .string()
    .describe(
      'A description of the overall trend in the user\'s habit-breaking progress.'
    ),
});
export type MotivationalMessageInput = z.infer<
  typeof MotivationalMessageInputSchema
>;

const MotivationalMessageOutputSchema = z.object({
  message: z.string().describe('The personalized motivational message.'),
  sentiment: z
    .enum(['motivational', 'cautionary', 'celebratory'])
    .describe(
      'The sentiment of the message, indicating whether it is motivational, cautionary, or celebratory.'
    ),
});
export type MotivationalMessageOutput = z.infer<
  typeof MotivationalMessageOutputSchema
>;

export async function generateMotivationalMessage(
  input: MotivationalMessageInput
): Promise<MotivationalMessageOutput> {
  return generateMotivationalMessageFlow(input);
}

const motivationalMessagePrompt = ai.definePrompt({
  name: 'motivationalMessagePrompt',
  input: {schema: MotivationalMessageInputSchema},
  output: {schema: MotivationalMessageOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized motivational messages to users who are trying to break a habit.

  Based on the user's progress, you will generate a message that is either motivational, cautionary, or celebratory.

  Here's the information about the user's progress:
  - Elapsed Time: {{elapsedTime}} seconds
  - Success Rate: {{successRate}}
  - Failure Count: {{failureCount}}
  - Overall Trend: {{overallTrend}}

  Consider the following when determining the sentiment of the message:
  - If the elapsed time is short and the failure count is high, the message should be cautionary.
  - If the elapsed time is long and the success rate is high, the message should be celebratory.
  - Otherwise, the message should be motivational.`,
});

const generateMotivationalMessageFlow = ai.defineFlow(
  {
    name: 'generateMotivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await motivationalMessagePrompt(input);
    return output!;
  }
);
