-- Check existing ship visits and create demo schedules

\c portlink_db

-- Get ship visit IDs
DO $$
DECLARE
    ship_visit_ids UUID[];
    sv_id UUID;
BEGIN
    -- Get all ship visit IDs
    SELECT ARRAY_AGG(id) INTO ship_visit_ids FROM operations.ship_visits LIMIT 5;
    
    -- If we have ship visits, use first one for demo
    IF array_length(ship_visit_ids, 1) > 0 THEN
        sv_id := ship_visit_ids[1];
        
        -- Insert demo schedules
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (sv_id, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'SCHEDULED', 10, 'Vessel Arrival & Berthing', 0, 240, '{"berthId": "B1", "pilotRequired": true, "tugboats": 2}'::jsonb, 'High priority arrival'),
            (sv_id, NOW() + INTERVAL '8 hours', NOW() + INTERVAL '20 hours', 'SCHEDULED', 9, 'Container Unloading', 0, 720, '{"containers": 300, "cranes": 3}'::jsonb, 'Unload containers'),
            (sv_id, NOW() + INTERVAL '24 hours', NOW() + INTERVAL '36 hours', 'SCHEDULED', 8, 'Container Loading', 0, 720, '{"containers": 250, "cranes": 3}'::jsonb, 'Load outbound containers'),
            (sv_id, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'IN_PROGRESS', 10, 'Active Cargo Operations', 45, 480, '{"personnel": 20, "cranes": 2}'::jsonb, 'Currently 45% complete'),
            (sv_id, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours', 'COMPLETED', 8, 'Ship Arrival', 100, 360, '{"pilotRequired": true}'::jsonb, 'Completed successfully'),
            (sv_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 8 hours', 'PENDING', 7, 'Maintenance Check', 0, 480, '{"maintenanceType": "ROUTINE"}'::jsonb, 'Pending approval'),
            (sv_id, NOW() + INTERVAL '48 hours', NOW() + INTERVAL '52 hours', 'SCHEDULED', 6, 'Final Inspection', 0, 240, '{"inspectionType": "CUSTOMS"}'::jsonb, 'Pre-departure inspection'),
            (sv_id, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 4 hours', 'SCHEDULED', 9, 'Vessel Departure', 0, 240, '{"pilotRequired": true, "tugboats": 2}'::jsonb, 'Departure operation');
        
        RAISE NOTICE 'Created 8 demo schedules for ship visit %', sv_id;
    ELSE
        RAISE NOTICE 'No ship visits found. Creating sample ship visits first...';
        
        -- Create sample ship visits
        INSERT INTO operations.ship_visits ("vesselName", "vesselIMO", "voyageNumber", eta, etd, status)
        VALUES
            ('MV Ocean Star', 'IMO9876543', 'VOY001', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 days', 'PLANNED'),
            ('MV Pacific Pearl', 'IMO9876544', 'VOY002', NOW() + INTERVAL '1 day', NOW() + INTERVAL '5 days', 'PLANNED'),
            ('MV Atlantic Queen', 'IMO9876545', 'VOY003', NOW() + INTERVAL '2 days', NOW() + INTERVAL '6 days', 'PLANNED')
        RETURNING id INTO sv_id;
        
        -- Insert demo schedules with newly created ship visit
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (sv_id, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'SCHEDULED', 10, 'Vessel Arrival & Berthing', 0, 240, '{"berthId": "B1", "pilotRequired": true, "tugboats": 2}'::jsonb, 'High priority arrival'),
            (sv_id, NOW() + INTERVAL '8 hours', NOW() + INTERVAL '20 hours', 'SCHEDULED', 9, 'Container Unloading', 0, 720, '{"containers": 300, "cranes": 3}'::jsonb, 'Unload containers'),
            (sv_id, NOW() + INTERVAL '24 hours', NOW() + INTERVAL '36 hours', 'SCHEDULED', 8, 'Container Loading', 0, 720, '{"containers": 250, "cranes": 3}'::jsonb, 'Load outbound containers'),
            (sv_id, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'IN_PROGRESS', 10, 'Active Cargo Operations', 45, 480, '{"personnel": 20, "cranes": 2}'::jsonb, 'Currently 45% complete'),
            (sv_id, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours', 'COMPLETED', 8, 'Ship Arrival', 100, 360, '{"pilotRequired": true}'::jsonb, 'Completed successfully'),
            (sv_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 8 hours', 'PENDING', 7, 'Maintenance Check', 0, 480, '{"maintenanceType": "ROUTINE"}'::jsonb, 'Pending approval'),
            (sv_id, NOW() + INTERVAL '48 hours', NOW() + INTERVAL '52 hours', 'SCHEDULED', 6, 'Final Inspection', 0, 240, '{"inspectionType": "CUSTOMS"}'::jsonb, 'Pre-departure inspection'),
            (sv_id, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 4 hours', 'SCHEDULED', 9, 'Vessel Departure', 0, 240, '{"pilotRequired": true, "tugboats": 2}'::jsonb, 'Departure operation');
        
        RAISE NOTICE 'Created ship visits and 8 demo schedules';
    END IF;
END $$;

-- Display summary
SELECT 
    'Total Schedules' as metric,
    COUNT(*) as value
FROM operations.schedules
UNION ALL
SELECT 
    'Scheduled' as metric,
    COUNT(*) as value
FROM operations.schedules WHERE status = 'SCHEDULED'
UNION ALL
SELECT 
    'In Progress' as metric,
    COUNT(*) as value
FROM operations.schedules WHERE status = 'IN_PROGRESS'
UNION ALL
SELECT 
    'Completed' as metric,
    COUNT(*) as value
FROM operations.schedules WHERE status = 'COMPLETED'
UNION ALL
SELECT 
    'Pending' as metric,
    COUNT(*) as value
FROM operations.schedules WHERE status = 'PENDING';

-- Show sample data
SELECT 
    SUBSTRING(id::text, 1, 8) as id,
    operation,
    status,
    priority,
    "completionPercentage" as progress,
    TO_CHAR("startTime", 'MM-DD HH24:MI') as start_time
FROM operations.schedules
ORDER BY "startTime"
LIMIT 15;
