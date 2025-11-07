import { ChatbotService } from './chatbot.service';
import { ChatMessageDto, WhatIfScenarioDto, ChatbotResponseDto } from './dto/chatbot.dto';
export declare class ChatbotController {
    private readonly chatbotService;
    constructor(chatbotService: ChatbotService);
    chat(dto: ChatMessageDto): Promise<ChatbotResponseDto>;
    runWhatIf(dto: WhatIfScenarioDto): Promise<ChatbotResponseDto>;
    detectConflicts(): Promise<ChatbotResponseDto>;
    getOptimizationSuggestions(conflictId: string): Promise<ChatbotResponseDto>;
}
