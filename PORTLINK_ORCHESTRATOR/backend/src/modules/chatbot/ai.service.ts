import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Conflict } from '../conflicts/entities/conflict.entity';
import { Asset } from '../assets/entities/asset.entity';
import { Task } from '../tasks/entities/task.entity';

// GitHub Models API using OpenAI-compatible interface
// You can use GitHub's free AI models like GPT-4o, Phi-3, Llama, etc.
interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  answer: string;
  confidence: number;
  dataUsed: string[];
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly apiEndpoint: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ShipVisit)
    private shipVisitRepo: Repository<ShipVisit>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Conflict)
    private conflictRepo: Repository<Conflict>,
    @InjectRepository(Asset)
    private assetRepo: Repository<Asset>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {
    // GitHub Models API endpoint (OpenAI-compatible)
    this.apiEndpoint = this.configService.get<string>(
      'AI_API_ENDPOINT',
      'https://models.inference.ai.azure.com',
    );
    
    // GitHub Personal Access Token
    this.apiKey = this.configService.get<string>('AI_API_KEY', '');
    
    // Available models: gpt-4o, gpt-4o-mini, Phi-3, Llama, Mistral, Cohere
    this.model = this.configService.get<string>('AI_MODEL', 'gpt-4o-mini');
  }

  /**
   * Process user query with AI using real project data as context
   */
  async processQueryWithAI(
    userMessage: string,
    context?: any,
  ): Promise<AIResponse> {
    try {
      // 1. Gather relevant data from database
      const projectData = await this.gatherProjectData(userMessage);

      // 2. Build context-aware prompt
      const messages = await this.buildPrompt(userMessage, projectData, context);

      // 3. Call AI API
      const aiResponse = await this.callAI(messages);

      return {
        answer: aiResponse,
        confidence: 0.85, // You can implement confidence scoring
        dataUsed: projectData.sources,
      };
    } catch (error) {
      this.logger.error(`AI processing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gather relevant project data based on user query
   */
  private async gatherProjectData(query: string): Promise<any> {
    const lowerQuery = query.toLowerCase();
    const data: any = { sources: [] };

    try {
      // Fetch ship visits
      if (
        lowerQuery.includes('ship') ||
        lowerQuery.includes('tàu') ||
        lowerQuery.includes('vessel')
      ) {
        data.shipVisits = await this.shipVisitRepo.find({
          take: 10,
          order: { eta: 'DESC' },
        });
        data.sources.push('ship_visits');
      }

      // Fetch schedules
      if (
        lowerQuery.includes('schedule') ||
        lowerQuery.includes('lịch') ||
        lowerQuery.includes('kế hoạch')
      ) {
        data.schedules = await this.scheduleRepo.find({
          take: 20,
          order: { startTime: 'DESC' },
          relations: ['shipVisit'],
        });
        data.sources.push('schedules');
      }

      // Fetch conflicts
      if (
        lowerQuery.includes('conflict') ||
        lowerQuery.includes('xung đột') ||
        lowerQuery.includes('problem')
      ) {
        data.conflicts = await this.conflictRepo.find({
          where: { resolved: false },
          take: 10,
          order: { createdAt: 'DESC' },
        });
        data.sources.push('conflicts');
      }

      // Fetch assets
      if (
        lowerQuery.includes('asset') ||
        lowerQuery.includes('thiết bị') ||
        lowerQuery.includes('crane') ||
        lowerQuery.includes('berth')
      ) {
        data.assets = await this.assetRepo.find({
          take: 20,
          order: { name: 'ASC' },
        });
        data.sources.push('assets');
      }

      // Fetch tasks
      if (
        lowerQuery.includes('task') ||
        lowerQuery.includes('công việc') ||
        lowerQuery.includes('nhiệm vụ')
      ) {
        data.tasks = await this.taskRepo.find({
          take: 20,
          order: { createdAt: 'DESC' },
          relations: ['schedule', 'asset'],
        });
        data.sources.push('tasks');
      }

      // If no specific entity mentioned, get summary data
      if (data.sources.length === 0) {
        const [
          shipVisitCount,
          scheduleCount,
          conflictCount,
          assetCount,
          taskCount,
        ] = await Promise.all([
          this.shipVisitRepo.count(),
          this.scheduleRepo.count(),
          this.conflictRepo.count({ where: { resolved: false } }),
          this.assetRepo.count(),
          this.taskRepo.count(),
        ]);

        data.summary = {
          totalShips: shipVisitCount,
          totalSchedules: scheduleCount,
          unresolvedConflicts: conflictCount,
          totalAssets: assetCount,
          totalTasks: taskCount,
        };
        data.sources.push('summary_statistics');
      }

      return data;
    } catch (error) {
      this.logger.error(`Error gathering project data: ${error.message}`);
      return { sources: [] };
    }
  }

  /**
   * Build AI prompt with system context and user query
   */
  private async buildPrompt(
    userMessage: string,
    projectData: any,
    context?: any,
  ): Promise<AIMessage[]> {
    const systemPrompt = `You are an intelligent assistant for PortLink Orchestrator, a port management system.

**Your Role:**
- Help users manage port operations including ship visits, schedules, berths, assets, and tasks
- Provide insights based on REAL project data
- Suggest optimizations and detect conflicts
- Answer in Vietnamese or English based on user's language

**Current Project Data:**
${JSON.stringify(projectData, null, 2)}

**Instructions:**
1. Use the provided project data to answer questions accurately
2. If data is insufficient, acknowledge it and suggest what information is needed
3. Be concise but informative
4. Provide actionable insights when possible
5. Format responses with clear structure (use bullet points, numbers when appropriate)
6. When discussing conflicts or issues, prioritize by severity
7. Always cite which data sources you used from: ${projectData.sources.join(', ')}

**Response Format:**
- Start with a direct answer
- Provide supporting details from the data
- End with actionable recommendations if applicable`;

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add context if provided (e.g., previous conversation)
    if (context?.previousMessages) {
      messages.push(...context.previousMessages.slice(-3)); // Last 3 messages for context
    }

    // Add user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Call AI API (GitHub Models or OpenAI-compatible endpoint)
   */
  private async callAI(messages: AIMessage[]): Promise<string> {
    try {
      // Check if API key is configured
      if (!this.apiKey) {
        return this.getFallbackResponse();
      }

      // Using fetch to call OpenAI-compatible API
      const response = await fetch(`${this.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.95,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error('No response from AI');
    } catch (error) {
      this.logger.error(`AI API call failed: ${error.message}`);
      return this.getFallbackResponse();
    }
  }

  /**
   * Fallback response when AI is not available
   */
  private getFallbackResponse(): string {
    return `Xin lỗi, hệ thống AI tạm thời không khả dụng. Vui lòng thử lại sau hoặc liên hệ quản trị viên để cấu hình AI API key.

Sorry, the AI system is temporarily unavailable. Please try again later or contact the administrator to configure the AI API key.

**To configure:**
1. Get a GitHub Personal Access Token with "Read access to models" permission
2. Add to backend/.env: AI_API_KEY=your_github_token
3. Optional: Set AI_MODEL=gpt-4o-mini (or gpt-4o, phi-3, llama-3, etc.)`;
  }

  /**
   * Analyze conflicts and suggest solutions using AI
   */
  async analyzeConflictWithAI(conflictId: string): Promise<AIResponse> {
    try {
      const conflict = await this.conflictRepo.findOne({
        where: { id: conflictId },
      });

      if (!conflict) {
        throw new Error('Conflict not found');
      }

      const query = `Analyze this conflict and suggest solutions:
- Type: ${conflict.conflictType}
- Severity: ${conflict.severity}
- Description: ${conflict.description}

Provide:
1. Root cause analysis
2. 3-5 practical solutions ranked by feasibility
3. Estimated impact of each solution`;

      return this.processQueryWithAI(query);
    } catch (error) {
      this.logger.error(`Conflict analysis error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate optimization suggestions using AI
   */
  async generateOptimizationSuggestions(): Promise<AIResponse> {
    const query = `Based on current port operations data, provide optimization suggestions for:
1. Resource utilization (berths, cranes, equipment)
2. Schedule efficiency
3. Conflict prevention
4. Task allocation

Focus on actionable recommendations with expected benefits.`;

    return this.processQueryWithAI(query);
  }
}
