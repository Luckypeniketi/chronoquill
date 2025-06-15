import OpenAI from 'openai';
import { format } from 'date-fns';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskSuggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  suggestedDueDate?: Date;
  reasoning: string;
}

export interface DocumentationUpdate {
  summary: string;
  changes: string[];
  screenshots: string[];
}

export class AIService {
  // Suggest task priority and category
  static async analyzeTask(task: string): Promise<TaskSuggestion> {
    const prompt = `Analyze this task and provide suggestions:
    Task: ${task}
    Provide a JSON response with:
    - priority (high/medium/low)
    - category
    - suggested due date (if applicable)
    - reasoning for the suggestions`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Generate release notes
  static async generateReleaseNotes(changes: string[]): Promise<string> {
    const prompt = `Generate a professional release note for these changes:
    ${changes.join('\n')}
    Format it in a clear, user-friendly way.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || '';
  }

  // Update documentation
  static async updateDocumentation(
    currentDocs: string,
    changes: string[],
    screenshots: string[]
  ): Promise<DocumentationUpdate> {
    const prompt = `Update the documentation based on these changes:
    Current Documentation:
    ${currentDocs}
    
    Changes:
    ${changes.join('\n')}
    
    Available Screenshots:
    ${screenshots.join('\n')}
    
    Provide a JSON response with:
    - summary of changes
    - list of documentation updates needed
    - which screenshots to include`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Suggest task organization
  static async suggestTaskOrganization(tasks: string[]): Promise<string[]> {
    const prompt = `Suggest an optimal order for these tasks:
    ${tasks.join('\n')}
    Consider dependencies, priority, and time sensitivity.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return (response.choices[0].message.content || '').split('\n');
  }
} 