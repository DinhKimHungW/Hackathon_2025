export declare class ChatMessageDto {
    message: string;
    context?: {
        lastIntent?: string;
        relatedEntities?: string[];
        [key: string]: any;
    };
}
export declare class WhatIfScenarioDto {
    description: string;
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
export declare class ChatbotResponseDto {
    message: string;
    intent: string;
    suggestions?: string[];
    data?: Record<string, any>;
    actions?: Array<{
        type: 'navigation' | 'execute' | 'display';
        payload: Record<string, any>;
    }>;
}
