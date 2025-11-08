import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { AIService } from './ai.service';
import {
  ChatMessageDto,
  WhatIfScenarioDto,
  ChatbotResponseDto,
} from './dto/chatbot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('chatbot')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly aiService: AIService,
  ) {}

  @Post('chat')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.OPERATIONS,
    UserRole.DRIVER,
  )
  async chat(@Body() dto: ChatMessageDto): Promise<ChatbotResponseDto> {
    return this.chatbotService.processMessage(dto);
  }

  @Post('what-if')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async runWhatIf(@Body() dto: WhatIfScenarioDto): Promise<ChatbotResponseDto> {
    return this.chatbotService.runWhatIfScenario(dto);
  }

  @Get('detect-conflicts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async detectConflicts(): Promise<ChatbotResponseDto> {
    return this.chatbotService.processMessage({
      message: 'Check for conflicts',
    });
  }

  @Get('optimize/:conflictId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async getOptimizationSuggestions(
    @Param('conflictId') conflictId: string,
  ): Promise<ChatbotResponseDto> {
    return this.chatbotService.getOptimizationSuggestions(conflictId);
  }

  @Get('ai/analyze-conflict/:conflictId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async analyzeConflictWithAI(
    @Param('conflictId') conflictId: string,
  ): Promise<any> {
    const result = await this.aiService.analyzeConflictWithAI(conflictId);
    return {
      message: result.answer,
      confidence: result.confidence,
      dataSources: result.dataUsed,
    };
  }

  @Get('ai/optimize-all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async generateOptimizations(): Promise<any> {
    const result = await this.aiService.generateOptimizationSuggestions();
    return {
      message: result.answer,
      confidence: result.confidence,
      dataSources: result.dataUsed,
    };
  }
}
