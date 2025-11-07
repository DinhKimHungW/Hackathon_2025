import { IsString, IsOptional, IsObject } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  context?: {
    lastIntent?: string;
    relatedEntities?: string[];
    [key: string]: any;
  };
}

export class WhatIfScenarioDto {
  @IsString()
  description: string;

  @IsObject()
  parameters: {
    shipId?: string;
    delay?: number;
    berthChange?: string;
    craneOutage?: {
      assetId: string;
      startTime: string;
      endTime: string;
    };
    [key: string]: any;
  };
}

export class ChatbotResponseDto {
  message: string;
  intent: string;
  suggestions?: string[];
  data?: Record<string, any>;
  actions?: Array<{
    type: 'navigation' | 'execute' | 'display';
    payload: Record<string, any>;
  }>;
}
