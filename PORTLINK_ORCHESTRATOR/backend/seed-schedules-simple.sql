-- PortLink Orchestrator - Simple Schedules Demo Data
-- Insert demo schedule data with valid UUIDs

\c portlink_db

-- Insert 20 demo schedules with varied statuses and times
INSERT INTO operations.schedules (
    "shipVisitId", 
    "startTime", 
    "endTime", 
    status, 
    priority, 
    operation, 
    "completionPercentage",
    "estimatedDuration",
    resources,
    notes
) VALUES
    -- Scheduled - upcoming in next few hours
    (
        NULL,
        NOW() + INTERVAL '2 hours',
        NOW() + INTERVAL '6 hours',
        'SCHEDULED',
        10,
        'Morning Berth Preparation',
        0,
        240,
        '{"berthId": "B1", "crewSize": 5}'::jsonb,
        'Prepare berth for incoming vessel'
    ),
    (
        NULL,
        NOW() + INTERVAL '4 hours',
        NOW() + INTERVAL '10 hours',
        'SCHEDULED',
        9,
        'Container Unloading Operation',
        0,
        360,
        '{"containers": 200, "cranes": 2}'::jsonb,
        'High priority container operation'
    ),
    (
        NULL,
        NOW() + INTERVAL '8 hours',
        NOW() + INTERVAL '20 hours',
        'SCHEDULED',
        8,
        'Bulk Cargo Loading',
        0,
        720,
        '{"tonnage": 5000, "cranes": 3}'::jsonb,
        'Bulk cargo loading for MV Pacific'
    ),
    
    -- IN_PROGRESS - currently active
    (
        NULL,
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '6 hours',
        'IN_PROGRESS',
        10,
        'Active Container Transfer',
        45.5,
        480,
        '{"containers": 150, "cranes": 2, "personnel": 12}'::jsonb,
        'Currently 45% complete'
    ),
    (
        NULL,
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '5 hours',
        'IN_PROGRESS',
        9,
        'Ship Berthing Operations',
        30.0,
        360,
        '{"pilotRequired": true, "tugboats": 2}'::jsonb,
        'Berthing in progress'
    ),
    (
        NULL,
        NOW() - INTERVAL '3 hours',
        NOW() + INTERVAL '3 hours',
        'IN_PROGRESS',
        8,
        'Cargo Inspection',
        75.0,
        360,
        '{"customsTeam": 3, "inspectionType": "FULL"}'::jsonb,
        'Near completion'
    ),
    
    -- PENDING - awaiting approval/resources
    (
        NULL,
        NOW() + INTERVAL '12 hours',
        NOW() + INTERVAL '18 hours',
        'PENDING',
        7,
        'Maintenance Check',
        0,
        360,
        '{"equipmentList": ["CRANE-01", "CRANE-02"]}'::jsonb,
        'Awaiting maintenance crew availability'
    ),
    (
        NULL,
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '1 day 8 hours',
        'PENDING',
        6,
        'Container Loading Phase 2',
        0,
        480,
        '{"containers": 300, "requiresSpecialHandling": true}'::jsonb,
        'Pending equipment allocation'
    ),
    
    -- COMPLETED - recently finished
    (
        NULL,
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '6 hours',
        'COMPLETED',
        8,
        'Morning Vessel Arrival',
        100,
        360,
        '{"pilotRequired": true, "tugboats": 2}'::jsonb,
        'Completed successfully on schedule'
    ),
    (
        NULL,
        NOW() - INTERVAL '24 hours',
        NOW() - INTERVAL '18 hours',
        'COMPLETED',
        7,
        'Equipment Inspection',
        100,
        360,
        '{"inspectionType": "SAFETY", "equipmentCount": 5}'::jsonb,
        'All equipment passed inspection'
    ),
    (
        NULL,
        NOW() - INTERVAL '8 hours',
        NOW() - INTERVAL '4 hours',
        'COMPLETED',
        9,
        'Emergency Cargo Transfer',
        100,
        240,
        '{"urgency": "HIGH", "containers": 50}'::jsonb,
        'Completed ahead of schedule'
    ),
    
    -- CANCELLED - cancelled operations
    (
        NULL,
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '2 days 4 hours',
        'CANCELLED',
        5,
        'Postponed Maintenance',
        0,
        240,
        '{"reason": "WEATHER"}'::jsonb,
        'Cancelled due to weather conditions'
    ),
    
    -- More SCHEDULED for timeline variety
    (
        NULL,
        NOW() + INTERVAL '16 hours',
        NOW() + INTERVAL '24 hours',
        'SCHEDULED',
        7,
        'Night Shift Operations',
        0,
        480,
        '{"shift": "NIGHT", "personnel": 15}'::jsonb,
        'Night crew cargo operations'
    ),
    (
        NULL,
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '1 day 12 hours',
        'SCHEDULED',
        8,
        'Container Discharge',
        0,
        720,
        '{"containers": 400, "cranes": 4}'::jsonb,
        'Large container operation'
    ),
    (
        NULL,
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '2 days 6 hours',
        'SCHEDULED',
        6,
        'General Cargo Handling',
        0,
        360,
        '{"cargoType": "GENERAL", "tonnage": 3000}'::jsonb,
        'Mixed cargo operations'
    ),
    (
        NULL,
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '3 days 8 hours',
        'SCHEDULED',
        5,
        'Weekly Equipment Check',
        0,
        480,
        '{"maintenanceType": "PREVENTIVE"}'::jsonb,
        'Routine weekly maintenance'
    ),
    (
        NULL,
        NOW() + INTERVAL '4 days',
        NOW() + INTERVAL '4 days 10 hours',
        'SCHEDULED',
        9,
        'VIP Vessel Arrival',
        0,
        600,
        '{"vipStatus": true, "protocol": true}'::jsonb,
        'Special handling required'
    ),
    (
        NULL,
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '5 days 6 hours',
        'SCHEDULED',
        7,
        'Hazmat Cargo Operation',
        0,
        360,
        '{"cargoType": "HAZMAT", "specialTeam": true}'::jsonb,
        'Requires certified hazmat team'
    ),
    (
        NULL,
        NOW() + INTERVAL '6 days',
        NOW() + INTERVAL '6 days 4 hours',
        'SCHEDULED',
        6,
        'Berth Maintenance',
        0,
        240,
        '{"berthId": "B3", "maintenanceType": "INSPECTION"}'::jsonb,
        'Scheduled berth inspection'
    ),
    (
        NULL,
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '7 days 3 hours',
        'SCHEDULED',
        5,
        'Safety Drill',
        0,
        180,
        '{"drillType": "EVACUATION", "allCrew": true}'::jsonb,
        'Monthly safety drill'
    );

-- Display summary
SELECT 
    'Demo Schedules Created' as info,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled
FROM operations.schedules;

-- Show recent schedules
SELECT 
    LEFT(id::text, 8) as id_short,
    operation,
    status,
    priority,
    TO_CHAR("startTime", 'YYYY-MM-DD HH24:MI') as start,
    TO_CHAR("endTime", 'YYYY-MM-DD HH24:MI') as end,
    "completionPercentage" as progress
FROM operations.schedules
ORDER BY "createdAt" DESC
LIMIT 10;
