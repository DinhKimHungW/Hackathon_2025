export declare enum KPICategory {
    EFFICIENCY = "EFFICIENCY",
    UTILIZATION = "UTILIZATION",
    PERFORMANCE = "PERFORMANCE",
    COST = "COST",
    QUALITY = "QUALITY"
}
export declare class KPI {
    id: string;
    kpiName: string;
    category: KPICategory;
    entityType: string;
    entityId: string;
    value: number;
    unit: string;
    calculatedAt: Date;
    periodStart: Date;
    periodEnd: Date;
    metadata: Record<string, any>;
    notes: string;
    createdAt: Date;
}
