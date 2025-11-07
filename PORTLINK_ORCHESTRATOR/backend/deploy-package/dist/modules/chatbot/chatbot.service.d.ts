import { Repository } from 'typeorm';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Conflict } from '../conflicts/entities/conflict.entity';
import { ChatMessageDto, WhatIfScenarioDto, ChatbotResponseDto } from './dto/chatbot.dto';
export declare class ChatbotService {
    private shipVisitRepo;
    private scheduleRepo;
    private conflictRepo;
    private readonly logger;
    constructor(shipVisitRepo: Repository<ShipVisit>, scheduleRepo: Repository<Schedule>, conflictRepo: Repository<Conflict>);
    processMessage(dto: ChatMessageDto): Promise<ChatbotResponseDto>;
    private detectIntent;
    private handleScheduleQuery;
    private handleShipStatusQuery;
    private handleBerthAvailability;
    private handleWhatIfIntent;
    private handleConflictDetection;
    private handleKpiQuery;
    private handleOptimizationRequest;
    private handleGeneralQuery;
    runWhatIfScenario(dto: WhatIfScenarioDto): Promise<ChatbotResponseDto>;
    getOptimizationSuggestions(conflictId: string): Promise<ChatbotResponseDto>;
}
