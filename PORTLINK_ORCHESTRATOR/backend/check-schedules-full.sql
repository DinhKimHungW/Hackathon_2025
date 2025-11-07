-- Check schedules with shipVisit and resources data
SELECT 
    s.id,
    s.name,
    s.operation,
    s.status,
    s."startTime",
    s."endTime",
    s."shipVisitId",
    sv."vesselName" as ship_name,
    sv."vesselIMO" as ship_imo,
    sv."berthLocation" as berth_location,
    s.resources::text as resources_json,
    s.resources->>'berthName' as berth_name,
    s.resources->>'berthId' as berth_id
FROM operations.schedules s
LEFT JOIN operations.ship_visits sv ON s."shipVisitId" = sv.id
ORDER BY s."startTime";

-- Count schedules by shipVisit
SELECT 
    COUNT(*) FILTER (WHERE "shipVisitId" IS NOT NULL) as with_ship,
    COUNT(*) FILTER (WHERE "shipVisitId" IS NULL) as without_ship,
    COUNT(*) as total
FROM operations.schedules;

-- Check resources field structure
SELECT DISTINCT
    resources->>'berthName' as berth_name,
    resources->>'berthId' as berth_id,
    COUNT(*) as count
FROM operations.schedules
WHERE resources IS NOT NULL
GROUP BY resources->>'berthName', resources->>'berthId';
