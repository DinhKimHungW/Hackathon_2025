-- PortLink Orchestrator - Demo Data Seeding Script
-- This script creates comprehensive demo data for Dashboard and Ship Visits

\c portlink_db

-- Clear existing demo data (optional - comment out if you want to keep existing data)
-- DELETE FROM operations.tasks;
-- DELETE FROM operations.schedules;
-- DELETE FROM operations.ship_visits;
-- DELETE FROM operations.assets;

-- ============================================
-- PART 1: SHIP VISITS DATA
-- ============================================

-- Insert Ship Visits (various statuses)
INSERT INTO operations.ship_visits 
  ("vesselName", "vesselIMO", "vesselType", "vesselFlag", "voyageNumber", eta, etd, ata, atd, status, "berthNumber", "cargoType", "cargoWeight", "cargoUnits", purpose, notes, "createdAt", "updatedAt")
VALUES
  -- Active/In Progress Ships
  ('MV Ocean Star', 'IMO9876543', 'CONTAINER', 'Panama', 'VOY001-2025', 
   NOW() - INTERVAL '2 hours', NOW() + INTERVAL '2 days', NOW() - INTERVAL '1 hour', NULL, 
   'IN_PROGRESS', 'B-01', 'CONTAINERS', 15000, 350, 'LOAD_UNLOAD', 
   'High priority vessel - scheduled unloading operations', NOW() - INTERVAL '3 hours', NOW()),
   
  ('MV Pacific Pearl', 'IMO9876544', 'CONTAINER', 'Singapore', 'VOY002-2025', 
   NOW() - INTERVAL '4 hours', NOW() + INTERVAL '1 day', NOW() - INTERVAL '3 hours', NULL, 
   'IN_PROGRESS', 'B-02', 'CONTAINERS', 12500, 280, 'LOAD_UNLOAD', 
   'Regular service vessel', NOW() - INTERVAL '5 hours', NOW()),
   
  -- Arrived Ships (ready for operations)
  ('MV Atlantic Queen', 'IMO9876545', 'BULK_CARRIER', 'Liberia', 'VOY003-2025', 
   NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '3 days', NOW() - INTERVAL '15 minutes', NULL, 
   'ARRIVED', 'B-03', 'BULK', 25000, 1000, 'UNLOAD', 
   'Bulk grain cargo - requires special handling', NOW() - INTERVAL '1 hour', NOW()),
   
  -- Planned Ships (upcoming arrivals)
  ('MV Baltic Breeze', 'IMO9876546', 'CONTAINER', 'Germany', 'VOY004-2025', 
   NOW() + INTERVAL '6 hours', NOW() + INTERVAL '4 days', NULL, NULL, 
   'PLANNED', 'B-04', 'CONTAINERS', 18000, 420, 'LOAD_UNLOAD', 
   'Expected arrival this afternoon', NOW(), NOW()),
   
  ('MV Indian Express', 'IMO9876547', 'CONTAINER', 'India', 'VOY005-2025', 
   NOW() + INTERVAL '18 hours', NOW() + INTERVAL '5 days', NULL, NULL, 
   'PLANNED', 'B-05', 'CONTAINERS', 14000, 320, 'LOAD', 
   'Export containers ready at terminal', NOW(), NOW()),
   
  ('MV Mediterranean Dream', 'IMO9876548', 'RO_RO', 'Italy', 'VOY006-2025', 
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', NULL, NULL, 
   'PLANNED', NULL, 'VEHICLES', 8000, 150, 'LOAD_UNLOAD', 
   'Vehicle carrier - berth to be assigned', NOW(), NOW()),
   
  -- Completed/Departed Ships (for historical data)
  ('MV Nordic Trader', 'IMO9876549', 'CONTAINER', 'Norway', 'VOY007-2025', 
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 hours', 
   'DEPARTED', 'B-01', 'CONTAINERS', 16000, 380, 'LOAD_UNLOAD', 
   'Completed operations successfully', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 hours'),
   
  ('MV Asian Navigator', 'IMO9876550', 'CONTAINER', 'Hong Kong', 'VOY008-2025', 
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '11 hours', 
   'DEPARTED', 'B-02', 'CONTAINERS', 13500, 310, 'UNLOAD', 
   'Completed unloading - departed on schedule', NOW() - INTERVAL '3 days', NOW() - INTERVAL '11 hours'),
   
  ('MV Caribbean Princess', 'IMO9876551', 'TANKER', 'Bahamas', 'VOY009-2025', 
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '7 hours', 
   'DEPARTED', 'T-01', 'LIQUID', 45000, 45000, 'UNLOAD', 
   'Tanker operations completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '7 hours');

-- Get ship visit IDs for use in schedules and tasks
DO $$
DECLARE
    ship_ids UUID[];
    ship1 UUID;
    ship2 UUID;
    ship3 UUID;
    ship4 UUID;
    ship5 UUID;
BEGIN
    -- Get ship IDs
    SELECT ARRAY_AGG(id) INTO ship_ids FROM operations.ship_visits WHERE status IN ('IN_PROGRESS', 'ARRIVED', 'PLANNED') ORDER BY eta LIMIT 5;
    
    IF array_length(ship_ids, 1) >= 5 THEN
        ship1 := ship_ids[1];
        ship2 := ship_ids[2];
        ship3 := ship_ids[3];
        ship4 := ship_ids[4];
        ship5 := ship_ids[5];
        
        -- ============================================
        -- PART 2: ASSETS DATA
        -- ============================================
        
        -- Insert Assets (various types and statuses)
        INSERT INTO operations.assets (name, type, status, "currentLocation", "specifications", "lastMaintenanceDate", "nextMaintenanceDate", notes)
        VALUES
            -- Cranes (in use)
            ('Crane-01', 'CRANE', 'IN_USE', 'Berth B-01', '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '2 months', NOW() + INTERVAL '1 month', 'Operating on MV Ocean Star'),
            ('Crane-02', 'CRANE', 'IN_USE', 'Berth B-02', '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '1 month', NOW() + INTERVAL '2 months', 'Operating on MV Pacific Pearl'),
            ('Crane-03', 'CRANE', 'AVAILABLE', 'Berth B-03', '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '3 weeks', NOW() + INTERVAL '5 weeks', 'Ready for assignment'),
            ('Crane-04', 'CRANE', 'AVAILABLE', 'Storage Yard A', '{"capacity": "50t", "reach": "45m", "model": "RTG-2023"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Standby'),
            
            -- Reach Stackers
            ('Stacker-01', 'REACH_STACKER', 'IN_USE', 'Container Yard', '{"capacity": "45t", "lift_height": "5_high"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Yard operations'),
            ('Stacker-02', 'REACH_STACKER', 'IN_USE', 'Container Yard', '{"capacity": "45t", "lift_height": "5_high"}'::jsonb, NOW() - INTERVAL '3 weeks', NOW() + INTERVAL '5 weeks', 'Yard operations'),
            ('Stacker-03', 'REACH_STACKER', 'AVAILABLE', 'Equipment Pool', '{"capacity": "45t", "lift_height": "5_high"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),
            
            -- Trucks
            ('Truck-01', 'TRUCK', 'IN_USE', 'Terminal Gate', '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Container transport'),
            ('Truck-02', 'TRUCK', 'IN_USE', 'Container Yard', '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '3 weeks', NOW() + INTERVAL '5 weeks', 'Container transport'),
            ('Truck-03', 'TRUCK', 'AVAILABLE', 'Equipment Pool', '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),
            ('Truck-04', 'TRUCK', 'AVAILABLE', 'Equipment Pool', '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),
            
            -- Yard Tractors
            ('Tractor-01', 'YARD_TRACTOR', 'IN_USE', 'Yard A', '{"capacity": "20t"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Yard operations'),
            ('Tractor-02', 'YARD_TRACTOR', 'AVAILABLE', 'Equipment Pool', '{"capacity": "20t"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),
            
            -- Forklifts
            ('Forklift-01', 'FORKLIFT', 'IN_USE', 'Warehouse 1', '{"capacity": "5t"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Warehouse operations'),
            ('Forklift-02', 'FORKLIFT', 'AVAILABLE', 'Warehouse 2', '{"capacity": "5t"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Available'),
            
            -- One in maintenance
            ('Crane-05', 'CRANE', 'MAINTENANCE', 'Maintenance Workshop', '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '6 months', NOW() + INTERVAL '2 days', 'Scheduled maintenance - back in service soon');
        
        -- ============================================
        -- PART 3: SCHEDULES DATA
        -- ============================================
        
        -- Insert Schedules for ship1 (MV Ocean Star - IN_PROGRESS)
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship1, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'IN_PROGRESS', 10, 'Container Unloading - Bay 1-10', 45, 480, '{"cranes": ["Crane-01"], "personnel": 15}'::jsonb, 'Currently 45% complete - ahead of schedule'),
            (ship1, NOW() + INTERVAL '8 hours', NOW() + INTERVAL '16 hours', 'SCHEDULED', 9, 'Container Loading - Bay 11-20', 0, 480, '{"cranes": ["Crane-01", "Crane-03"], "personnel": 20}'::jsonb, 'Scheduled loading operation'),
            (ship1, NOW() + INTERVAL '18 hours', NOW() + INTERVAL '20 hours', 'SCHEDULED', 8, 'Final Inspection & Documentation', 0, 120, '{"inspectors": 3}'::jsonb, 'Pre-departure checks'),
            (ship1, NOW() + INTERVAL '21 hours', NOW() + INTERVAL '22 hours', 'SCHEDULED', 10, 'Vessel Departure', 0, 60, '{"pilotRequired": true, "tugboats": 2}'::jsonb, 'Departure scheduled');
        
        -- Insert Schedules for ship2 (MV Pacific Pearl - IN_PROGRESS)
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship2, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '4 hours', 'IN_PROGRESS', 10, 'Mixed Operations - Unload/Load', 60, 480, '{"cranes": ["Crane-02"], "personnel": 18}'::jsonb, 'Currently 60% complete'),
            (ship2, NOW() + INTERVAL '6 hours', NOW() + INTERVAL '10 hours', 'SCHEDULED', 9, 'Container Restowage', 0, 240, '{"cranes": ["Crane-02"], "stackers": ["Stacker-01"], "personnel": 12}'::jsonb, 'Container repositioning'),
            (ship2, NOW() + INTERVAL '12 hours', NOW() + INTERVAL '14 hours', 'SCHEDULED', 8, 'Customs Inspection', 0, 120, '{"customsOfficers": 2}'::jsonb, 'Mandatory customs check');
        
        -- Insert Schedules for ship3 (MV Atlantic Queen - ARRIVED)
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship3, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'SCHEDULED', 10, 'Berth Allocation & Safety Check', 0, 60, '{"safetyOfficers": 2}'::jsonb, 'Pre-operation safety check'),
            (ship3, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '15 hours', 'SCHEDULED', 10, 'Bulk Grain Unloading', 0, 720, '{"cranes": ["Crane-03", "Crane-04"], "conveyors": 2, "personnel": 25}'::jsonb, 'Bulk cargo discharge to silos'),
            (ship3, NOW() + INTERVAL '16 hours', NOW() + INTERVAL '18 hours', 'SCHEDULED', 7, 'Hold Cleaning', 0, 120, '{"personnel": 10}'::jsonb, 'Post-discharge cleaning');
        
        -- Insert Schedules for ship4 (MV Baltic Breeze - PLANNED)
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship4, NOW() + INTERVAL '6 hours', NOW() + INTERVAL '7 hours', 'PENDING', 10, 'Vessel Arrival & Berthing', 0, 60, '{"pilotRequired": true, "tugboats": 2, "linemen": 4}'::jsonb, 'Awaiting pilot assignment'),
            (ship4, NOW() + INTERVAL '8 hours', NOW() + INTERVAL '20 hours', 'PENDING', 9, 'Container Discharge Operations', 0, 720, '{"cranes": ["Crane-01", "Crane-03"], "personnel": 22}'::jsonb, 'Pending berth confirmation'),
            (ship4, NOW() + INTERVAL '22 hours', NOW() + INTERVAL '34 hours', 'PENDING', 8, 'Container Loading Operations', 0, 720, '{"cranes": ["Crane-01", "Crane-03"], "personnel": 22}'::jsonb, 'Export containers ready');
        
        -- Insert Schedules for ship5 (MV Indian Express - PLANNED)
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship5, NOW() + INTERVAL '18 hours', NOW() + INTERVAL '19 hours', 'PENDING', 10, 'Vessel Arrival', 0, 60, '{"pilotRequired": true, "tugboats": 2}'::jsonb, 'Scheduled arrival'),
            (ship5, NOW() + INTERVAL '20 hours', NOW() + INTERVAL '32 hours', 'PENDING', 9, 'Export Container Loading', 0, 720, '{"cranes": ["Crane-02"], "personnel": 18}'::jsonb, 'Loading export containers');
        
        -- ============================================
        -- PART 4: TASKS DATA
        -- ============================================
        
        -- Get some asset IDs and schedule IDs for tasks
        DECLARE
            crane1_id UUID;
            crane2_id UUID;
            stacker1_id UUID;
            schedule1_id UUID;
            schedule2_id UUID;
        BEGIN
            SELECT id INTO crane1_id FROM operations.assets WHERE name = 'Crane-01' LIMIT 1;
            SELECT id INTO crane2_id FROM operations.assets WHERE name = 'Crane-02' LIMIT 1;
            SELECT id INTO stacker1_id FROM operations.assets WHERE name = 'Stacker-01' LIMIT 1;
            SELECT id INTO schedule1_id FROM operations.schedules WHERE "shipVisitId" = ship1 LIMIT 1;
            SELECT id INTO schedule2_id FROM operations.schedules WHERE "shipVisitId" = ship2 LIMIT 1;
            
            -- Insert Tasks
            INSERT INTO operations.tasks (title, description, type, status, priority, "scheduleId", "assignedAssetId", "startTime", "endTime", "estimatedDuration", "actualDuration", "completionPercentage", location, notes)
            VALUES
                -- Active tasks (IN_PROGRESS)
                ('Unload Container MAEU1234567', 'Discharge 40ft container from Bay 5', 'UNLOADING', 'IN_PROGRESS', 8, schedule1_id, crane1_id, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '15 minutes', 45, NULL, 70, 'Berth B-01', 'Standard container'),
                ('Load Container TCLU9876543', 'Load 20ft container to Bay 15', 'LOADING', 'IN_PROGRESS', 7, schedule2_id, crane2_id, NOW() - INTERVAL '20 minutes', NOW() + INTERVAL '10 minutes', 30, NULL, 50, 'Berth B-02', 'Refrigerated container'),
                
                -- Completed tasks
                ('Unload Container CMAU5555555', 'Discharge completed', 'UNLOADING', 'COMPLETED', 8, schedule1_id, crane1_id, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '90 minutes', 30, 30, 100, 'Berth B-01', 'Completed on time'),
                ('Yard Transfer YD-001', 'Move container to storage', 'TRANSFER', 'COMPLETED', 6, schedule2_id, stacker1_id, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '150 minutes', 30, 25, 100, 'Container Yard', 'Completed ahead of schedule'),
                
                -- Assigned tasks (ready to start)
                ('Unload Container HLCU7777777', 'Ready for discharge', 'UNLOADING', 'ASSIGNED', 8, schedule1_id, crane1_id, NOW() + INTERVAL '30 minutes', NOW() + INTERVAL '75 minutes', 45, NULL, 0, 'Berth B-01', 'Next in queue'),
                ('Container Inspection INS-001', 'Customs inspection required', 'INSPECTION', 'ASSIGNED', 9, schedule2_id, NULL, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 60, NULL, 0, 'Berth B-02', 'High priority inspection'),
                
                -- Pending tasks
                ('Unload Container MSCU8888888', 'Awaiting crane availability', 'UNLOADING', 'PENDING', 7, schedule1_id, NULL, NOW() + INTERVAL '4 hours', NOW() + INTERVAL '5 hours', 60, NULL, 0, 'Berth B-01', 'Pending resource allocation'),
                ('Maintenance Check MNT-001', 'Routine equipment check', 'MAINTENANCE', 'PENDING', 5, NULL, crane1_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 120, NULL, 0, 'Maintenance Workshop', 'Scheduled maintenance');
        END;
        
        RAISE NOTICE 'Demo data created successfully!';
        RAISE NOTICE 'Created ship visits, assets, schedules, and tasks';
        RAISE NOTICE 'Ship 1 (IN_PROGRESS): %', ship1;
        RAISE NOTICE 'Ship 2 (IN_PROGRESS): %', ship2;
        RAISE NOTICE 'Ship 3 (ARRIVED): %', ship3;
        RAISE NOTICE 'Ship 4 (PLANNED): %', ship4;
        RAISE NOTICE 'Ship 5 (PLANNED): %', ship5;
    ELSE
        RAISE EXCEPTION 'Failed to create ship visits. Please check the operations.ship_visits table.';
    END IF;
END $$;

-- ============================================
-- VERIFY DATA
-- ============================================

-- Show summary
SELECT 
    'Ship Visits' as entity,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
    COUNT(*) FILTER (WHERE status = 'ARRIVED') as arrived,
    COUNT(*) FILTER (WHERE status = 'PLANNED') as planned,
    COUNT(*) FILTER (WHERE status = 'DEPARTED') as departed
FROM operations.ship_visits
UNION ALL
SELECT 
    'Assets' as entity,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'IN_USE') as in_use,
    COUNT(*) FILTER (WHERE status = 'AVAILABLE') as available,
    COUNT(*) FILTER (WHERE status = 'MAINTENANCE') as maintenance,
    0 as departed
FROM operations.assets
UNION ALL
SELECT 
    'Schedules' as entity,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
    COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
FROM operations.schedules
UNION ALL
SELECT 
    'Tasks' as entity,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
    COUNT(*) FILTER (WHERE status = 'ASSIGNED') as assigned,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
FROM operations.tasks;

RAISE NOTICE 'Demo data seeding complete! Check the summary above.';
