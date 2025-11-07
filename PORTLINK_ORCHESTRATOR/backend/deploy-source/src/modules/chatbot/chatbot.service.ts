import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipVisit, ShipVisitStatus } from '../ship-visits/entities/ship-visit.entity';
import { Schedule, ScheduleStatus } from '../schedules/entities/schedule.entity';
import { Conflict, ConflictType } from '../conflicts/entities/conflict.entity';
import {
  ChatMessageDto,
  WhatIfScenarioDto,
  ChatbotResponseDto,
} from './dto/chatbot.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectRepository(ShipVisit)
    private shipVisitRepo: Repository<ShipVisit>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Conflict)
    private conflictRepo: Repository<Conflict>,
  ) {}

  // ============================================================================
  // MAIN CHAT HANDLER
  // ============================================================================

  async processMessage(dto: ChatMessageDto): Promise<ChatbotResponseDto> {
    const { message, context } = dto;
    const lowerMessage = message.toLowerCase().trim();

    this.logger.log(`Processing message: "${message}"`);

    // Intent detection
    const intent = this.detectIntent(lowerMessage);

    // Route to appropriate handler
    switch (intent) {
      case 'schedule_query':
        return this.handleScheduleQuery(message, context);

      case 'ship_status':
        return this.handleShipStatusQuery(message, context);

      case 'berth_availability':
        return this.handleBerthAvailability(message, context);

      case 'what_if_scenario':
        return this.handleWhatIfIntent(message, context);

      case 'conflict_detection':
        return this.handleConflictDetection();

      case 'kpi_query':
        return this.handleKpiQuery(message, context);

      case 'optimization_request':
        return this.handleOptimizationRequest(message, context);

      default:
        return this.handleGeneralQuery(message, context);
    }
  }

  // ============================================================================
  // INTENT DETECTION
  // ============================================================================

  private detectIntent(message: string): string {
    const patterns = {
      schedule_query: [
        'schedule',
        'lịch',
        'lịch trình',
        'kế hoạch',
        'when',
        'khi nào',
      ],
      ship_status: [
        'ship',
        'vessel',
        'tàu',
        'status',
        'trạng thái',
        'where is',
        'ở đâu',
      ],
      berth_availability: [
        'berth',
        'bến',
        'available',
        'trống',
        'sẵn sàng',
        'dock',
      ],
      what_if_scenario: [
        'what if',
        'điều gì sẽ xảy ra',
        'nếu',
        'delay',
        'trễ',
        'scenario',
        'kịch bản',
      ],
      conflict_detection: [
        'conflict',
        'xung đột',
        'problem',
        'vấn đề',
        'issue',
        'check conflict',
        'kiểm tra xung đột',
      ],
      kpi_query: [
        'kpi',
        'performance',
        'hiệu suất',
        'metric',
        'chỉ số',
        'statistic',
        'thống kê',
      ],
      optimization_request: [
        'optimize',
        'tối ưu',
        'improve',
        'cải thiện',
        'suggest',
        'đề xuất',
        'recommend',
      ],
    };

    for (const [intent, keywords] of Object.entries(patterns)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        return intent;
      }
    }

    return 'general_query';
  }

  // ============================================================================
  // INTENT HANDLERS
  // ============================================================================

  private async handleScheduleQuery(
    message: string,
    context?: any,
  ): Promise<ChatbotResponseDto> {
    const schedules = await this.scheduleRepo.find({
      where: { status: ScheduleStatus.IN_PROGRESS },
      relations: ['shipVisit'],
      take: 5,
      order: { startTime: 'ASC' },
    });

    const scheduleList = schedules
      .map((s, idx) => {
        const shipName = (s.shipVisit as any)?.vesselName || 'Unknown';
        const start = new Date(s.startTime).toLocaleString('vi-VN');
        return `${idx + 1}. ${shipName} - ${s.operation} (${start})`;
      })
      .join('\n');

    return {
      message: `Here are the current schedules in progress:\n\n${scheduleList || 'No schedules found.'}`,
      intent: 'schedule_query',
      suggestions: [
        'Show more schedules',
        'Check for conflicts',
        'What if a ship delays?',
      ],
      data: {
        schedules: schedules.map((s) => ({
          id: s.id,
          operation: s.operation,
          startTime: s.startTime,
          status: s.status,
        })),
      },
    };
  }

  private async handleShipStatusQuery(
    message: string,
    context?: any,
  ): Promise<ChatbotResponseDto> {
    const ships = await this.shipVisitRepo.find({
      where: [{ status: ShipVisitStatus.IN_PROGRESS }, { status: ShipVisitStatus.ARRIVED }],
      take: 10,
      order: { eta: 'ASC' },
    });

    const shipList = ships
      .map((ship, idx) => {
        const eta = new Date(ship.eta).toLocaleString('vi-VN');
        return `${idx + 1}. ${ship.vesselName} (${ship.status}) - ETA: ${eta}`;
      })
      .join('\n');

    return {
      message: `Current ship status:\n\n${shipList || 'No ships in port.'}`,
      intent: 'ship_status',
      suggestions: [
        'Show all ship visits',
        'Check berth availability',
        'Detect conflicts',
      ],
      data: {
        ships: ships.map((s) => ({
          id: s.id,
          name: s.vesselName,
          status: s.status,
          eta: s.eta,
          berthLocation: s.berthLocation,
        })),
      },
    };
  }

  private async handleBerthAvailability(
    message: string,
    context?: any,
  ): Promise<ChatbotResponseDto> {
    // Simplified berth availability check
    const occupiedBerths = await this.shipVisitRepo
      .createQueryBuilder('sv')
      .select('sv.berthLocation')
      .where('sv.status IN (:...statuses)', {
        statuses: ['IN_PROGRESS', 'ARRIVED'],
      })
      .andWhere('sv.berthLocation IS NOT NULL')
      .groupBy('sv.berthLocation')
      .getRawMany();

    const occupied = occupiedBerths.map((b) => b.sv_berthLocation);
    const allBerths = ['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'T-01'];
    const available = allBerths.filter((b) => !occupied.includes(b));

    return {
      message: `Berth availability:\n\n✅ Available: ${available.join(', ') || 'None'}\n🚢 Occupied: ${occupied.join(', ') || 'None'}`,
      intent: 'berth_availability',
      suggestions: [
        'Show ship schedule',
        'Run what-if scenario',
        'Optimize berth allocation',
      ],
      data: {
        availableBerths: available,
        occupiedBerths: occupied,
      },
    };
  }

  private async handleWhatIfIntent(
    message: string,
    context?: any,
  ): Promise<ChatbotResponseDto> {
    return {
      message:
        'I can help you run "What-If" scenarios! Please specify:\n\n' +
        '• Which ship?\n' +
        '• What change? (delay, berth change, crane outage)\n' +
        '• How much/when?\n\n' +
        'Example: "What if MV Ocean Star delays 2 hours?"',
      intent: 'what_if_scenario',
      suggestions: [
        'MV Ocean Star delays 3 hours',
        'Crane CRN-01 maintenance for 2 hours',
        'Change MV Pacific Pearl to Berth B-04',
      ],
    };
  }

  private async handleConflictDetection(): Promise<ChatbotResponseDto> {
    const conflicts = await this.conflictRepo.find({
      where: { resolved: false },
      take: 5,
      order: { createdAt: 'DESC' },
    });

    if (conflicts.length === 0) {
      return {
        message: '✅ No conflicts detected! Everything is running smoothly.',
        intent: 'conflict_detection',
        suggestions: [
          'Show current schedule',
          'Run what-if scenario',
          'Show KPIs',
        ],
      };
    }

    const conflictList = conflicts
      .map((c, idx) => {
        return `${idx + 1}. ${c.conflictType} - ${c.description} (Severity: ${c.severity})`;
      })
      .join('\n');

    return {
      message: `⚠️ Found ${conflicts.length} conflict(s):\n\n${conflictList}`,
      intent: 'conflict_detection',
      suggestions: [
        'Get optimization suggestions',
        'Show affected schedules',
        'Run simulation',
      ],
      data: {
        conflicts: conflicts.map((c) => ({
          id: c.id,
          type: c.conflictType,
          severity: c.severity,
          description: c.description,
        })),
      },
    };
  }

  private async handleKpiQuery(
    message: string,
    context?: any,
  ): Promise<ChatbotResponseDto> {
    // Simplified KPI calculation
    const totalShips = await this.shipVisitRepo.count();
    const activeShips = await this.shipVisitRepo.count({
      where: [{ status: ShipVisitStatus.IN_PROGRESS }, { status: ShipVisitStatus.ARRIVED }],
    });
    const completedToday = await this.shipVisitRepo.count({
      where: { status: ShipVisitStatus.DEPARTED },
    });

    return {
      message:
        `📊 Current KPIs:\n\n` +
        `• Total Ship Visits: ${totalShips}\n` +
        `• Active Ships: ${activeShips}\n` +
        `• Completed Today: ${completedToday}\n` +
        `• Berth Utilization: ${((activeShips / 6) * 100).toFixed(1)}%`,
      intent: 'kpi_query',
      suggestions: [
        'Show detailed performance',
        'Export KPI report',
        'Compare with last month',
      ],
      data: {
        totalShips,
        activeShips,
        completedToday,
        berthUtilization: (activeShips / 6) * 100,
      },
    };
  }

  private async handleOptimizationRequest(
    message: string,
    context?: any,
  ): Promise<ChatbotResponseDto> {
    const conflicts = await this.conflictRepo.find({
      where: { resolved: false },
      take: 3,
    });

    if (conflicts.length === 0) {
      return {
        message:
          '✅ No optimization needed! All schedules are running efficiently.',
        intent: 'optimization_request',
        suggestions: ['Show current schedule', 'Run what-if scenario'],
      };
    }

    const suggestions = conflicts.map((c, idx) => {
      if (c.conflictType === ConflictType.LOCATION_OVERLAP || c.conflictType === ConflictType.TIME_OVERLAP) {
        return `Suggestion ${idx + 1}: Reschedule to avoid overlap`;
      } else if (c.conflictType === ConflictType.RESOURCE_OVERLAP) {
        return `Suggestion ${idx + 1}: Allocate additional resources or delay operation`;
      } else if (c.conflictType === ConflictType.CAPACITY_EXCEEDED) {
        return `Suggestion ${idx + 1}: Distribute load or extend timeframe`;
      }
      return `Suggestion ${idx + 1}: Review conflict details for resolution`;
    });

    return {
      message:
        `💡 Optimization suggestions:\n\n${suggestions.join('\n')}\n\n` +
        `Would you like me to apply any of these suggestions?`,
      intent: 'optimization_request',
      suggestions: [
        'Apply suggestion 1',
        'Show more details',
        'Run simulation first',
      ],
      data: {
        conflicts: conflicts.map((c) => c.id),
        optimizationSuggestions: suggestions,
      },
    };
  }

  private handleGeneralQuery(
    message: string,
    context?: any,
  ): Promise<ChatbotResponseDto> {
    return Promise.resolve({
      message:
        `I'm your PortLink AI Assistant! I can help you with:\n\n` +
        `📅 Schedule management\n` +
        `🚢 Ship status tracking\n` +
        `⚓ Berth availability\n` +
        `⚠️ Conflict detection\n` +
        `🎯 What-if scenarios\n` +
        `📊 Performance KPIs\n` +
        `💡 Optimization suggestions\n\n` +
        `What would you like to know?`,
      intent: 'general_query',
      suggestions: [
        'Show current schedule',
        'Check for conflicts',
        'What if scenarios',
        'Show KPIs',
      ],
    });
  }

  // ============================================================================
  // WHAT-IF SCENARIO EXECUTION
  // ============================================================================

  async runWhatIfScenario(
    dto: WhatIfScenarioDto,
  ): Promise<ChatbotResponseDto> {
    this.logger.log(`Running what-if scenario: ${dto.description}`);

    const { parameters } = dto;

    // Simplified simulation logic
    let impactMessage = '';
    const affectedSchedules: any[] = [];

    if (parameters.delay && parameters.shipId) {
      const ship = await this.shipVisitRepo.findOne({
        where: { id: parameters.shipId },
      });

      if (ship) {
        impactMessage = `If ${ship.vesselName} delays by ${parameters.delay} minutes:\n\n`;
        impactMessage += `• New ETA: ${new Date(new Date(ship.eta).getTime() + parameters.delay * 60000).toLocaleString()}\n`;
        impactMessage += `• Berth ${ship.berthLocation} will be occupied longer\n`;
        impactMessage += `• Potential conflict with next scheduled ship\n`;
        impactMessage += `• Recommend: Notify waiting ships and consider berth reallocation`;
      }
    }

    return {
      message: impactMessage || 'Scenario simulation complete.',
      intent: 'what_if_scenario',
      suggestions: [
        'Apply this scenario',
        'Run another scenario',
        'Check conflicts',
      ],
      data: {
        scenario: dto,
        affectedSchedules,
        estimatedImpact: 'MEDIUM',
      },
    };
  }

  // ============================================================================
  // OPTIMIZATION
  // ============================================================================

  async getOptimizationSuggestions(
    conflictId: string,
  ): Promise<ChatbotResponseDto> {
    const conflict = await this.conflictRepo.findOne({
      where: { id: conflictId },
    });

    if (!conflict) {
      return {
        message: 'Conflict not found.',
        intent: 'optimization_request',
      };
    }

    const suggestions = [
      `Option 1: Reassign to available berth`,
      `Option 2: Delay lower-priority ship by 30 minutes`,
      `Option 3: Request additional crane resources`,
    ];

    return {
      message:
        `Optimization suggestions for conflict "${conflict.description}":\n\n` +
        suggestions.join('\n'),
      intent: 'optimization_request',
      suggestions: suggestions.map((s, i) => `Apply option ${i + 1}`),
      data: {
        conflictId: conflict.id,
        optimizationOptions: suggestions,
      },
    };
  }
}
