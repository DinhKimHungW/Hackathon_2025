-- PortLink Orchestrator - Simplified Demo Data
-- Matches actual database schema

\c portlink_db

-- Reset existing demo data to avoid duplicates when re-running the script
TRUNCATE operations.tasks,
         operations.schedules,
         operations.assets,
         operations.ship_visits
RESTART IDENTITY CASCADE;

-- ============================================
-- SHIP VISITS
-- ============================================

-- Insert Ship Visits
INSERT INTO operations.ship_visits 
  ("vesselName", "vesselIMO", "voyageNumber", eta, etd, ata, atd, status, "berthLocation", "totalContainers", "containersLoaded", "containersUnloaded", "completionPercentage", "shippingLine", agent, "cargoDetails", remarks, "createdAt", "updatedAt")
VALUES
  -- Active/In Progress Ships
  ('MV Ocean Star', 'IMO9876543', 'VOY001-2025', 
   NOW() - INTERVAL '2 hours', NOW() + INTERVAL '2 days', NOW() - INTERVAL '1 hour', NULL, 
   'IN_PROGRESS', 'B-01', 350, 120, 150, 77.00, 'Maersk Line', 'Port Services Inc', 
   '{"type": "CONTAINERS", "weight": 15000}'::jsonb, 'High priority vessel - scheduled unloading operations', NOW() - INTERVAL '3 hours', NOW()),
   
  ('MV Pacific Pearl', 'IMO9876544', 'VOY002-2025', 
   NOW() - INTERVAL '4 hours', NOW() + INTERVAL '1 day', NOW() - INTERVAL '3 hours', NULL, 
   'IN_PROGRESS', 'B-02', 280, 100, 120, 78.50, 'CMA CGM', 'Marine Logistics Ltd', 
   '{"type": "CONTAINERS", "weight": 12500}'::jsonb, 'Regular service vessel', NOW() - INTERVAL '5 hours', NOW()),
   
  -- Arrived Ships (ready for operations)
  ('MV Atlantic Queen', 'IMO9876545', 'VOY003-2025', 
   NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '3 days', NOW() - INTERVAL '15 minutes', NULL, 
   'ARRIVED', 'B-03', 0, 0, 0, 0.00, 'MSC', 'Ocean Freight Co', 
   '{"type": "BULK", "weight": 25000}'::jsonb, 'Bulk grain cargo - requires special handling', NOW() - INTERVAL '1 hour', NOW()),
   
  -- Planned Ships (upcoming arrivals)
  ('MV Baltic Breeze', 'IMO9876546', 'VOY004-2025', 
   NOW() + INTERVAL '6 hours', NOW() + INTERVAL '4 days', NULL, NULL, 
   'PLANNED', 'B-04', 420, 0, 0, 0.00, 'Hapag-Lloyd', 'Coastal Shipping', 
   '{"type": "CONTAINERS", "weight": 18000}'::jsonb, 'Expected arrival this afternoon', NOW(), NOW()),
   
  ('MV Indian Express', 'IMO9876547', 'VOY005-2025', 
   NOW() + INTERVAL '18 hours', NOW() + INTERVAL '5 days', NULL, NULL, 
   'PLANNED', 'B-05', 320, 0, 0, 0.00, 'ONE', 'Express Logistics', 
   '{"type": "CONTAINERS", "weight": 14000}'::jsonb, 'Export containers ready at terminal', NOW(), NOW()),
   
  ('MV Mediterranean Dream', 'IMO9876548', 'VOY006-2025', 
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', NULL, NULL, 
   'PLANNED', NULL, 150, 0, 0, 0.00, 'Evergreen', 'Global Ship Services', 
   '{"type": "VEHICLES", "weight": 8000}'::jsonb, 'Vehicle carrier - berth to be assigned', NOW(), NOW()),
   
  -- Completed/Departed Ships (for historical data)
  ('MV Nordic Trader', 'IMO9876549', 'VOY007-2025', 
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 hours', 
   'DEPARTED', 'B-01', 380, 200, 180, 100.00, 'Yang Ming', 'Premier Maritime', 
   '{"type": "CONTAINERS", "weight": 16000}'::jsonb, 'Completed operations successfully', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 hours'),
   
  ('MV Asian Navigator', 'IMO9876550', 'VOY008-2025', 
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '11 hours', 
   'DEPARTED', 'B-02', 310, 0, 310, 100.00, 'COSCO', 'Asian Freight', 
   '{"type": "CONTAINERS", "weight": 13500}'::jsonb, 'Completed unloading - departed on schedule', NOW() - INTERVAL '3 days', NOW() - INTERVAL '11 hours'),
   
  ('MV Caribbean Princess', 'IMO9876551', 'VOY009-2025', 
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '7 hours', 
   'DEPARTED', 'T-01', 0, 0, 0, 100.00, 'Tanker Services Ltd', 'Maritime Solutions', 
   '{"type": "LIQUID", "weight": 45000}'::jsonb, 'Tanker operations completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '7 hours');

SELECT 'Created ' || COUNT(*) || ' ship visits' FROM operations.ship_visits;

-- ============================================
-- ASSETS
-- ============================================

-- Insert Assets
INSERT INTO operations.assets
    ("assetCode", name, type, status, location, "utilizationRate", specifications, "lastMaintenanceDate", "nextMaintenanceDate", notes)
VALUES
        -- Quay Cranes
        ('CRN-01', 'Quay Crane 01', 'CRANE', 'IN_USE', 'Berth B-01', 72.5, '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '2 months', NOW() + INTERVAL '1 month', 'Operating on MV Ocean Star'),
        ('CRN-02', 'Quay Crane 02', 'CRANE', 'IN_USE', 'Berth B-02', 68.3, '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '1 month', NOW() + INTERVAL '2 months', 'Operating on MV Pacific Pearl'),
        ('CRN-03', 'Quay Crane 03', 'CRANE', 'AVAILABLE', 'Berth B-03', 12.0, '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '3 weeks', NOW() + INTERVAL '5 weeks', 'Ready for assignment'),
        ('CRN-04', 'RTG Crane 04', 'CRANE', 'AVAILABLE', 'Storage Yard A', 8.0, '{"capacity": "50t", "reach": "45m", "model": "RTG-2023"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Standby'),
        ('CRN-05', 'Quay Crane 05', 'CRANE', 'MAINTENANCE', 'Maintenance Workshop', 0.0, '{"capacity": "65t", "reach": "50m", "model": "STS-2024"}'::jsonb, NOW() - INTERVAL '6 months', NOW() + INTERVAL '2 days', 'Scheduled maintenance'),

        -- Reach Stackers
        ('RST-01', 'Reach Stacker 01', 'REACH_STACKER', 'IN_USE', 'Container Yard', 64.0, '{"capacity": "45t", "lift_height": "5_high"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Yard operations'),
        ('RST-02', 'Reach Stacker 02', 'REACH_STACKER', 'IN_USE', 'Container Yard', 61.0, '{"capacity": "45t", "lift_height": "5_high"}'::jsonb, NOW() - INTERVAL '3 weeks', NOW() + INTERVAL '5 weeks', 'Yard operations'),
        ('RST-03', 'Reach Stacker 03', 'REACH_STACKER', 'AVAILABLE', 'Equipment Pool', 10.0, '{"capacity": "45t", "lift_height": "5_high"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),

        -- Prime Movers / Trucks
        ('TRK-01', 'Prime Mover 01', 'TRUCK', 'IN_USE', 'Terminal Gate', 55.0, '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Container transport'),
        ('TRK-02', 'Prime Mover 02', 'TRUCK', 'IN_USE', 'Container Yard', 58.5, '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '3 weeks', NOW() + INTERVAL '5 weeks', 'Container transport'),
        ('TRK-03', 'Prime Mover 03', 'TRUCK', 'AVAILABLE', 'Equipment Pool', 5.0, '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),
        ('TRK-04', 'Prime Mover 04', 'TRUCK', 'AVAILABLE', 'Equipment Pool', 5.0, '{"capacity": "40t", "type": "Prime_Mover"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),

        -- Yard Tractors
        ('YTR-01', 'Yard Tractor 01', 'YARD_TRACTOR', 'IN_USE', 'Yard A', 62.0, '{"capacity": "20t"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Yard operations'),
        ('YTR-02', 'Yard Tractor 02', 'YARD_TRACTOR', 'AVAILABLE', 'Equipment Pool', 8.0, '{"capacity": "20t"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Available'),

        -- Forklifts
        ('FRK-01', 'Forklift 01', 'FORKLIFT', 'IN_USE', 'Warehouse 1', 74.5, '{"capacity": "5t"}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '7 weeks', 'Warehouse operations'),
        ('FRK-02', 'Forklift 02', 'FORKLIFT', 'AVAILABLE', 'Warehouse 2', 12.0, '{"capacity": "5t"}'::jsonb, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', 'Available');

SELECT 'Created ' || COUNT(*) || ' assets' FROM operations.assets;

-- ============================================
-- SCHEDULES
-- ============================================

-- Create schedules for the active ships
DO $$
DECLARE
    ship1_id UUID;
    ship2_id UUID;
    ship3_id UUID;
BEGIN
    -- Get first IN_PROGRESS ship
    SELECT id INTO ship1_id FROM operations.ship_visits WHERE status = 'IN_PROGRESS' AND "vesselName" = 'MV Ocean Star' LIMIT 1;
    SELECT id INTO ship2_id FROM operations.ship_visits WHERE status = 'IN_PROGRESS' AND "vesselName" = 'MV Pacific Pearl' LIMIT 1;
    SELECT id INTO ship3_id FROM operations.ship_visits WHERE status = 'ARRIVED' LIMIT 1;
    
    IF ship1_id IS NOT NULL THEN
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship1_id, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'IN_PROGRESS', 10, 'Container Unloading - Bay 1-10', 45, 480, '{"cranes": ["Crane-01"], "personnel": 15}'::jsonb, 'Currently 45% complete'),
            (ship1_id, NOW() + INTERVAL '8 hours', NOW() + INTERVAL '16 hours', 'SCHEDULED', 9, 'Container Loading - Bay 11-20', 0, 480, '{"cranes": ["Crane-01", "Crane-03"], "personnel": 20}'::jsonb, 'Scheduled loading'),
            (ship1_id, NOW() + INTERVAL '18 hours', NOW() + INTERVAL '20 hours', 'SCHEDULED', 8, 'Final Inspection', 0, 120, '{"inspectors": 3}'::jsonb, 'Pre-departure checks');
    END IF;
    
    IF ship2_id IS NOT NULL THEN
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship2_id, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '4 hours', 'IN_PROGRESS', 10, 'Mixed Operations', 60, 480, '{"cranes": ["Crane-02"], "personnel": 18}'::jsonb, '60% complete'),
            (ship2_id, NOW() + INTERVAL '6 hours', NOW() + INTERVAL '10 hours', 'SCHEDULED', 9, 'Container Restowage', 0, 240, '{"cranes": ["Crane-02"], "personnel": 12}'::jsonb, 'Repositioning');
    END IF;
    
    IF ship3_id IS NOT NULL THEN
        INSERT INTO operations.schedules ("shipVisitId", "startTime", "endTime", status, priority, operation, "completionPercentage", "estimatedDuration", resources, notes)
        VALUES
            (ship3_id, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'SCHEDULED', 10, 'Safety Check', 0, 60, '{"officers": 2}'::jsonb, 'Pre-operation check'),
            (ship3_id, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '15 hours', 'SCHEDULED', 10, 'Bulk Cargo Unloading', 0, 720, '{"cranes": ["Crane-03"], "personnel": 25}'::jsonb, 'Bulk discharge');
    END IF;
END $$;

SELECT 'Created ' || COUNT(*) || ' schedules' FROM operations.schedules;

-- ============================================
-- TASKS
-- ============================================

-- Create some tasks
DO $$
DECLARE
    schedule_primary UUID;
    schedule_secondary UUID;
    schedule_pending UUID;
    crane_primary UUID;
    crane_secondary UUID;
    crane_maintenance UUID;
    stacker_id UUID;
    forklift_id UUID;
    tractor_id UUID;
BEGIN
    SELECT id INTO schedule_primary FROM operations.schedules WHERE status = 'IN_PROGRESS' ORDER BY "startTime" LIMIT 1;
    SELECT id INTO schedule_secondary FROM operations.schedules WHERE status = 'IN_PROGRESS' ORDER BY "startTime" OFFSET 1 LIMIT 1;
    SELECT id INTO schedule_pending FROM operations.schedules WHERE status IN ('SCHEDULED', 'PENDING') ORDER BY "startTime" LIMIT 1;
    SELECT id INTO crane_primary FROM operations.assets WHERE "assetCode" = 'CRN-01' LIMIT 1;
    SELECT id INTO crane_secondary FROM operations.assets WHERE "assetCode" = 'CRN-02' LIMIT 1;
    SELECT id INTO crane_maintenance FROM operations.assets WHERE "assetCode" = 'CRN-05' LIMIT 1;
    SELECT id INTO stacker_id FROM operations.assets WHERE "assetCode" = 'RST-01' LIMIT 1;
    SELECT id INTO forklift_id FROM operations.assets WHERE "assetCode" = 'FRK-01' LIMIT 1;
    SELECT id INTO tractor_id FROM operations.assets WHERE "assetCode" = 'YTR-01' LIMIT 1;
    
    IF schedule_primary IS NOT NULL THEN
        INSERT INTO operations.tasks
          ("taskName", "taskType", status, priority, "scheduleId", "assetId", "assignedTo", "startTime", "endTime", "estimatedDuration", "completionPercentage", location, notes)
        VALUES
            ('Unload Container MAEU1234567', 'UNLOADING', 'IN_PROGRESS', 8, schedule_primary, crane_primary, 'Ops Team Alpha', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '15 minutes', 45, 70, 'Berth B-01', 'Standard container move in progress'),
            ('Unload Container CMAU5555555', 'UNLOADING', 'COMPLETED', 8, schedule_primary, crane_primary, 'Ops Team Alpha', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '90 minutes', 30, 100, 'Berth B-01', 'Completed within target window'),
            ('Unload Container HLCU7777777', 'UNLOADING', 'ASSIGNED', 8, schedule_primary, crane_primary, 'Ops Team Alpha', NOW() + INTERVAL '30 minutes', NOW() + INTERVAL '75 minutes', 45, 0, 'Berth B-01', 'Next in discharge queue'),
            ('Load Container TCLU9876543', 'LOADING', 'IN_PROGRESS', 7, COALESCE(schedule_secondary, schedule_primary), crane_secondary, 'Ops Team Bravo', NOW() - INTERVAL '20 minutes', NOW() + INTERVAL '10 minutes', 30, 55, 'Berth B-02', 'Refrigerated cargo loading'),
            ('Customs Inspection INS-001', 'INSPECTION', 'PENDING', 9, COALESCE(schedule_pending, schedule_primary), NULL, 'Customs Team', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 60, 0, 'Berth B-02', 'High priority customs inspection'),
            ('Equipment Maintenance CRN-05', 'MAINTENANCE', 'PENDING', 6, NULL, crane_maintenance, 'Maintenance Unit', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 3 hours', 180, 0, 'Maintenance Workshop', 'Quarterly hoist inspection'),
            ('Yard Transfer YD-001', 'UNLOADING', 'CANCELLED', 5, schedule_secondary, stacker_id, 'Yard Crew', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '15 minutes', 60, 0, 'Container Yard', 'Cancelled due to cargo damage'),
            ('Warehouse Replenishment WHS-01', 'LOADING', 'COMPLETED', 6, schedule_secondary, forklift_id, 'Warehouse Ops', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 30 minutes', 90, 100, 'Warehouse 1', 'Pallets staged for outbound'),
            ('Shuttle Move SHL-445', 'LOADING', 'IN_PROGRESS', 6, schedule_secondary, tractor_id, 'Yard Shuttle', NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '30 minutes', 90, 35, 'Transfer Lane C', 'Moving export blocks to quay');
    END IF;
END $$;

SELECT 'Created ' || COUNT(*) || ' tasks' FROM operations.tasks;

-- Show summary
SELECT 
    'Summary' as info,
    (SELECT COUNT(*) FROM operations.ship_visits) as ship_visits,
    (SELECT COUNT(*) FROM operations.assets) as assets,
    (SELECT COUNT(*) FROM operations.schedules) as schedules,
    (SELECT COUNT(*) FROM operations.tasks) as tasks;
