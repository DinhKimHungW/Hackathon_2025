import { AppDataSource } from '../../config/datasource';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { Asset, AssetType, AssetStatus } from '../../modules/assets/entities/asset.entity';
import { ShipVisit, ShipVisitStatus } from '../../modules/ship-visits/entities/ship-visit.entity';
import { Task, TaskType, TaskStatus } from '../../modules/tasks/entities/task.entity';
import { Schedule, ScheduleStatus } from '../../modules/schedules/entities/schedule.entity';
import { Conflict, ConflictType, ConflictSeverity } from '../../modules/conflicts/entities/conflict.entity';
import * as bcrypt from 'bcrypt';

async function seedDemoData() {
  console.log('🌱 Starting DEMO data seeding for PortLink...');
  console.log('');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const assetRepo = AppDataSource.getRepository(Asset);
    const shipVisitRepo = AppDataSource.getRepository(ShipVisit);
    const taskRepo = AppDataSource.getRepository(Task);
    const scheduleRepo = AppDataSource.getRepository(Schedule);
    const conflictRepo = AppDataSource.getRepository(Conflict);

    // Helper dates
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. USERS
  console.log('👤 Checking users...');
  const adminExists = await userRepo.findOne({ where: { username: 'admin_catlai' } });
    
    if (!adminExists) {
      const demoUsers = [
        {
          username: 'admin_catlai',
          email: 'admin@catlai.com',
          passwordHash: await bcrypt.hash('Admin@2025', 10),
          role: UserRole.ADMIN,
          fullName: 'Quản Trị Viên Cảng Cát Lái',
          isActive: true,
          language: 'vi',
        },
        {
          username: 'manager_catlai',
          email: 'manager@catlai.com',
          passwordHash: await bcrypt.hash('Manager@2025', 10),
          role: UserRole.MANAGER,
          fullName: 'Giám Đốc Vận Hành',
          isActive: true,
          language: 'vi',
        },
        {
          username: 'ops_catlai',
          email: 'ops@catlai.com',
          passwordHash: await bcrypt.hash('Ops@2025', 10),
          role: UserRole.OPERATIONS,
          fullName: 'Nhân Viên Điều Hành',
          isActive: true,
          language: 'vi',
        },
        {
          username: 'driver_catlai',
          email: 'driver@catlai.com',
          passwordHash: await bcrypt.hash('Driver@2025', 10),
          role: UserRole.DRIVER,
          fullName: 'Tài Xế Trần Quốc Huy',
          isActive: true,
          language: 'vi',
        },
      ];
      await userRepo.save(demoUsers);
      console.log(`   ✅ Created ${demoUsers.length} users`);
    } else {
      console.log('   ℹ️  Users exist, using existing admin user');
    }

    const adminUser = await userRepo.findOne({ where: { username: 'admin_catlai' } });
    const managerUser = await userRepo.findOne({ where: { username: 'manager_catlai' } });
    const opsUser = await userRepo.findOne({ where: { username: 'ops_catlai' } });
    const driverUser = await userRepo.findOne({ where: { username: 'driver_catlai' } });

    // 2. ASSETS - Cranes for Cat Lai Port
    console.log('🏗️  Creating port assets...');
    const existingAssetsCount = await assetRepo.count();
    
    if (existingAssetsCount === 0) {
      const demoAssets = [
        // STS Cranes (26 total)
        ...Array.from({ length: 26 }, (_, i) => ({
          assetCode: `STS-${String(i + 1).padStart(2, '0')}`,
          name: `Cẩu Bờ STS-${String(i + 1).padStart(2, '0')}`,
          type: AssetType.CRANE,
          status: i < 20 ? AssetStatus.AVAILABLE : (i < 23 ? AssetStatus.IN_USE : AssetStatus.MAINTENANCE),
          capacity: 65,
          capacityUnit: 'tons',
          location: `Berth CT${Math.floor(i / 3) + 1}`,
          specifications: {
            type: 'Ship-to-Shore Gantry Crane',
            manufacturer: i % 2 === 0 ? 'Zpmc' : 'Liebherr',
            outreach: '65m',
            liftHeight: '42m',
          },
        })),
        // Yard equipment
        {
          assetCode: 'RTG-001',
          name: 'Xe Nâng Bãi RTG-001',
          type: AssetType.REACH_STACKER,
          status: AssetStatus.IN_USE,
          capacity: 45,
          capacityUnit: 'tons',
          location: 'Yard Area A',
        },
        {
          assetCode: 'TRUCK-001',
          name: 'Xe Đầu Kéo Container 001',
          type: AssetType.TRUCK,
          status: AssetStatus.AVAILABLE,
          capacity: 40,
          capacityUnit: 'tons',
          location: 'Gate Area',
        },
      ];
      
      await assetRepo.save(demoAssets);
      console.log(`   ✅ Created ${demoAssets.length} assets`);
    } else {
      console.log(`   ℹ️  Assets already exist (${existingAssetsCount} assets), skipping`);
    }

    // 3. SHIP VISITS - Based on Cat Lai port layout
    console.log('🚢 Creating ship visits...');
    const existingShip = await shipVisitRepo.findOne({ where: { vesselName: 'COSCO SHIPPING VIRGO' } });
    
    let savedShips: ShipVisit[] = [];
    
    if (!existingShip) {
      const demoShips = [
        {
          vesselName: 'COSCO SHIPPING VIRGO',
          vesselIMO: 'IMO9744465',
          voyageNumber: 'VOY-2025-CV001',
          eta: yesterday,
          etd: tomorrow,
          ata: yesterday,
          status: ShipVisitStatus.IN_PROGRESS,
          berthLocation: 'Berth CT1',
          totalContainers: 5500,
          dischargeContainers: 2500,
          loadContainers: 2200,
          vesselLength: 366,
          vesselBeam: 51,
          vesselDraft: 14.5,
          vesselGrossTonnage: 140000,
          agent: 'Cosco Shipping Agency Vietnam',
        },
        {
          vesselName: 'MSC OSCAR',
          vesselIMO: 'IMO9703291',
          voyageNumber: 'VOY-2025-MO002',
          eta: twoDaysAgo,
          etd: threeDaysFromNow,
          ata: twoDaysAgo,
          status: ShipVisitStatus.IN_PROGRESS,
          berthLocation: 'Berth CT2',
          totalContainers: 6200,
          dischargeContainers: 3100,
          loadContainers: 2900,
          vesselLength: 395,
          vesselBeam: 59,
          vesselDraft: 16,
          vesselGrossTonnage: 196000,
          agent: 'MSC Agency Vietnam',
        },
        {
          vesselName: 'EVER GOLDEN',
          vesselIMO: 'IMO9299645',
          voyageNumber: 'VOY-2025-EG003',
          eta: now,
          etd: tomorrow,
          ata: now,
          status: ShipVisitStatus.IN_PROGRESS,
          berthLocation: 'Berth CT4',
          totalContainers: 4800,
          dischargeContainers: 2400,
          loadContainers: 2000,
          vesselLength: 334,
          vesselBeam: 43,
          vesselDraft: 13.5,
          vesselGrossTonnage: 108000,
          agent: 'Evergreen Shipping Agency',
        },
        {
          vesselName: 'MAERSK EINDHOVEN',
          vesselIMO: 'IMO9632520',
          voyageNumber: 'VOY-2025-ME004',
          eta: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          etd: now,
          ata: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          atd: now,
          status: ShipVisitStatus.DEPARTED,
          berthLocation: 'Berth CT6',
          totalContainers: 5200,
          dischargeContainers: 2600,
          loadContainers: 2400,
          vesselLength: 347,
          vesselBeam: 48,
          vesselDraft: 14.2,
          vesselGrossTonnage: 116000,
          agent: 'Maersk Line Vietnam',
        },
        {
          vesselName: 'ONE COMMITMENT',
          vesselIMO: 'IMO9845123',
          voyageNumber: 'VOY-2025-OC005',
          eta: now,
          etd: new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000),
          ata: now,
          status: ShipVisitStatus.IN_PROGRESS,
          berthLocation: 'Berth CT8',
          totalContainers: 4200,
          dischargeContainers: 2100,
          loadContainers: 1900,
          vesselLength: 300,
          vesselBeam: 43,
          vesselDraft: 13,
          vesselGrossTonnage: 95000,
          agent: 'ONE Line Vietnam',
        },
        {
          vesselName: 'SÀ LAN ĐỒNG NAI 01',
          vesselIMO: 'BARGE001',
          voyageNumber: 'BARGE-2025-001',
          eta: yesterday,
          etd: now,
          ata: yesterday,
          status: ShipVisitStatus.IN_PROGRESS,
          berthLocation: 'Berth BG1',
          totalContainers: 80,
          dischargeContainers: 40,
          loadContainers: 35,
          vesselLength: 80,
          vesselBeam: 15,
          vesselDraft: 5,
          vesselGrossTonnage: 2500,
          agent: 'Dong Nai Barge Services',
        },
        {
          vesselName: 'PACIFIC HARMONY',
          vesselIMO: 'IMO9756432',
          voyageNumber: 'VOY-2025-PH006',
          eta: tomorrow,
          etd: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
          status: ShipVisitStatus.PLANNED,
          berthLocation: 'Berth CT3',
          totalContainers: 4500,
          vesselLength: 320,
          vesselBeam: 42,
          vesselDraft: 13,
          vesselGrossTonnage: 100000,
          agent: 'Pacific Shipping Lines',
        },
      ];

      savedShips = await shipVisitRepo.save(demoShips);
      console.log(`   ✅ Created ${savedShips.length} ship visits`);
    } else {
      // Use existing ship visits for schedules
      console.log('   ℹ️  Ship visits already exist, using existing ships for schedules');
      savedShips = await shipVisitRepo.find({ take: 7 });
    }

      // 4. SCHEDULES aligned with frontend views
      console.log('� Creating schedules...');
      const cranes = await assetRepo.find({ where: { type: AssetType.CRANE }, take: 6 });
      const truckAsset = await assetRepo.findOne({ where: { assetCode: 'TRUCK-001' } });
      const rtgAsset = await assetRepo.findOne({ where: { assetCode: 'RTG-001' } });

      const toCraneResource = (list: Asset[]) =>
        list
          .filter((item): item is Asset => Boolean(item))
          .map((crane) => ({
            id: crane.id,
            name: crane.name,
            status: crane.status,
          }));

      const scheduleDefinitions = [
        // === SCHEDULES FOR ADMIN VIEW - Overview and Statistics ===
        {
          ship: savedShips[0],
          startOffsetHours: -4,
          durationHours: 10,
          status: ScheduleStatus.IN_PROGRESS,
          priority: 10,
          operation: 'Dỡ container - COSCO SHIPPING VIRGO',
          completionPercentage: 62,
          resources: {
            berthId: 'CT1',
            berthName: savedShips[0].berthLocation,
            pilotRequired: true,
            pilotName: 'Nguyễn Văn Bình',
            tugboatCount: 2,
            assignedDriverId: driverUser?.id ?? null,
            assignedDriverName: driverUser?.fullName ?? null,
            gateNumber: 'Cổng 1',
            cranes: toCraneResource(cranes.slice(0, 2)),
            personnel: [
              { name: opsUser?.fullName ?? 'Tổ trưởng vận hành', role: 'Operations Lead' },
              { name: 'Lê Văn Đức', role: 'Stevedore Supervisor' },
            ],
            cargoType: 'Container lạnh',
          },
          notes: `Ca sáng đang xử lý 24 container lạnh. Giám sát trưởng: ${opsUser?.fullName ?? 'Operations Team'}`,
        },
        {
          ship: savedShips[0],
          startOffsetHours: 2,
          durationHours: 12,
          status: ScheduleStatus.SCHEDULED,
          priority: 9,
          operation: 'Chuẩn bị xếp hàng - COSCO SHIPPING VIRGO',
          completionPercentage: 0,
          resources: {
            berthId: 'CT1',
            berthName: savedShips[0].berthLocation,
            pilotRequired: true,
            cranes: toCraneResource(cranes.slice(1, 4)),
            personnel: [
              { name: managerUser?.fullName ?? 'Giám đốc vận hành', role: 'Planning Lead' },
            ],
            cargoType: 'Hàng khô',
            shift: 'Ca chiều',
          },
          notes: 'Chuẩn bị danh sách container ưu tiên xếp, cập nhật manifest trước 14:00.',
        },
        {
          ship: savedShips[1],
          startOffsetHours: -8,
          durationHours: 14,
          status: ScheduleStatus.IN_PROGRESS,
          priority: 9,
          operation: 'Điều phối bãi - MSC OSCAR',
          completionPercentage: 48,
          resources: {
            berthId: 'CT2',
            berthName: savedShips[1].berthLocation,
            pilotRequired: true,
            tugboatCount: 3,
            cranes: toCraneResource(cranes.slice(2, 5)),
            yardEquipment: rtgAsset
              ? [
                  {
                    id: rtgAsset.id,
                    name: rtgAsset.name,
                    status: rtgAsset.status,
                  },
                ]
              : [],
            cargoType: 'Container khô',
            yardBlock: 'Yard B3',
          },
          notes: 'Điều phối lại yard block để tránh quá tải bãi B3.',
        },
        
        // === SCHEDULES FOR OPERATIONS VIEW - Ship berthing details ===
        {
          ship: savedShips[2],
          startOffsetHours: -2,
          durationHours: 8,
          status: ScheduleStatus.IN_PROGRESS,
          priority: 8,
          operation: 'Hoạt động xếp dỡ - EVER GOLDEN',
          completionPercentage: 35,
          resources: {
            berthId: 'CT4',
            berthName: savedShips[2].berthLocation,
            pilotRequired: true,
            pilotName: 'Trần Quốc Việt',
            tugboatCount: 2,
            cranes: toCraneResource(cranes.slice(4, 6)),
            cargoType: 'Container thường',
            mooringServices: true,
          },
          notes: 'Hoạt động xếp dỡ đang diễn ra bình thường. Dự kiến hoàn thành lúc 18:00.',
        },
        {
          ship: savedShips[4],
          startOffsetHours: -3,
          durationHours: 10,
          status: ScheduleStatus.IN_PROGRESS,
          priority: 8,
          operation: 'Bốc dỡ hàng hóa - ONE COMMITMENT',
          completionPercentage: 72,
          resources: {
            berthId: 'CT8',
            berthName: savedShips[4].berthLocation,
            pilotRequired: true,
            pilotName: 'Phạm Minh Tuấn',
            tugboatCount: 2,
            cranes: toCraneResource(cranes.slice(5, 8)),
            cargoType: 'Container reefer',
            mooringServices: true,
          },
          notes: 'Đã xếp xong 1900 container, còn lại 200 container cần xử lý.',
        },
        
        // === SCHEDULES FOR MANAGER VIEW - Planning and resource allocation ===
        {
          ship: savedShips[6],
          startOffsetHours: 18,
          durationHours: 16,
          status: ScheduleStatus.SCHEDULED,
          priority: 7,
          operation: 'Kế hoạch cập bến - PACIFIC HARMONY',
          completionPercentage: 0,
          resources: {
            berthId: 'CT3',
            berthName: savedShips[6].berthLocation,
            pilotRequired: true,
            tugboatCount: 2,
            cranes: toCraneResource(cranes.slice(8, 11)),
            cargoType: 'Container khô',
            estimatedContainers: 4500,
            shift: 'Ca đêm',
          },
          notes: 'Lên kế hoạch phân bổ cẩu và nhân lực cho ca đêm. Cần kiểm tra tình trạng bãi container trước khi tàu cập.',
        },
        {
          ship: null,
          startOffsetHours: 6,
          durationHours: 4,
          status: ScheduleStatus.SCHEDULED,
          priority: 6,
          operation: 'Họp phân tích hiệu suất tuần',
          completionPercentage: 0,
          resources: {
            meetingRoom: 'Phòng họp A',
            participants: [
              { name: adminUser?.fullName ?? 'Admin', role: 'Quản trị viên' },
              { name: managerUser?.fullName ?? 'Manager', role: 'Giám đốc vận hành' },
              { name: opsUser?.fullName ?? 'Operations', role: 'Điều hành' },
            ],
            agenda: ['KPI tuần qua', 'Tối ưu hóa quy trình', 'Kế hoạch tuần tới'],
          },
          notes: 'Họp đánh giá hiệu suất hoạt động tuần qua và lập kế hoạch cải tiến.',
        },
        
        // === SCHEDULES FOR DRIVER VIEW - Container transport tasks ===
        {
          ship: savedShips[0],
          startOffsetHours: 1,
          durationHours: 3,
          status: ScheduleStatus.SCHEDULED,
          priority: 9,
          operation: 'Vận chuyển container lạnh đợt 2',
          completionPercentage: 0,
          resources: {
            berthId: 'CT1',
            berthName: savedShips[0].berthLocation,
            assignedDriverId: driverUser?.id ?? null,
            assignedDriverName: driverUser?.fullName ?? null,
            vehicleNumber: '79C-12345',
            gateNumber: 'Cổng 1',
            containerCount: 15,
            cargoType: 'Container lạnh',
            pickupLocation: 'Bến CT1',
            deliveryLocation: 'Kho lạnh Zone C',
          },
          notes: 'Giao hàng vào kho lạnh Zone C. Ưu tiên container có hạn sử dụng ngắn.',
        },
        {
          ship: savedShips[1],
          startOffsetHours: 4,
          durationHours: 2,
          status: ScheduleStatus.SCHEDULED,
          priority: 8,
          operation: 'Thu gom container rỗng',
          completionPercentage: 0,
          resources: {
            berthId: 'CT2',
            berthName: savedShips[1].berthLocation,
            assignedDriverId: driverUser?.id ?? null,
            assignedDriverName: driverUser?.fullName ?? null,
            vehicleNumber: '79C-12345',
            gateNumber: 'Cổng 2',
            containerCount: 20,
            cargoType: 'Empty containers',
            pickupLocation: 'Yard Area D',
            deliveryLocation: 'Depot container rỗng',
          },
          notes: 'Thu gom container rỗng từ bãi D về depot. Kiểm tra tình trạng container trước khi vận chuyển.',
        },
        
        // === MORE COMPLETED AND CANCELLED SCHEDULES FOR STATISTICS ===
        {
          ship: savedShips[3],
          startOffsetHours: -72,
          durationHours: 18,
          status: ScheduleStatus.COMPLETED,
          priority: 8,
          operation: 'Hoàn tất xếp dỡ - MAERSK EINDHOVEN',
          completionPercentage: 100,
          resources: {
            berthId: 'CT6',
            berthName: savedShips[3].berthLocation,
            pilotRequired: true,
            pilotName: 'Lê Văn Thành',
            tugboatCount: 2,
            cranes: toCraneResource(cranes.slice(11, 14)),
            cargoType: 'Mixed containers',
          },
          notes: 'Hoàn thành đúng tiến độ. Tàu đã rời bến lúc 8:00 sáng.',
        },
        {
          ship: savedShips[5],
          startOffsetHours: -5,
          durationHours: 5,
          status: ScheduleStatus.COMPLETED,
          priority: 6,
          operation: 'Trung chuyển sà lan - ĐỒNG NAI 01',
          completionPercentage: 100,
          resources: {
            berthId: 'BG1',
            berthName: savedShips[5].berthLocation,
            pilotRequired: false,
            assignedDriverId: driverUser?.id ?? null,
            assignedDriverName: driverUser?.fullName ?? null,
            gateNumber: 'Cổng 3',
            tugboatCount: 0,
            cargoType: 'Hàng transshipment nội địa',
            containerCount: 35,
          },
          notes: 'Hoàn tất trung chuyển 35 container về depot Đồng Nai.',
        },
        {
          ship: null,
          startOffsetHours: -24,
          durationHours: 6,
          status: ScheduleStatus.COMPLETED,
          priority: 5,
          operation: 'Bảo trì thiết bị cảng',
          completionPercentage: 100,
          resources: {
            maintenanceType: 'PREVENTIVE',
            equipment: ['STS-23', 'STS-24', 'RTG-001'],
            maintenanceTeam: 'Đội kỹ thuật A',
          },
          notes: 'Hoàn thành bảo trì định kỳ các thiết bị theo kế hoạch.',
        },
        {
          ship: savedShips[2],
          startOffsetHours: 8,
          durationHours: 4,
          status: ScheduleStatus.CANCELLED,
          priority: 5,
          operation: 'Kiểm tra an toàn - EVER GOLDEN (Đã hủy)',
          completionPercentage: 0,
          resources: {
            berthId: 'CT4',
            berthName: savedShips[2].berthLocation,
            inspectionTeam: 'Đội an toàn cảng',
            cancellationReason: 'Thiếu nhân sự kiểm tra',
          },
          notes: 'Hủy do thiếu nhân sự. Đã lên lịch lại vào ngày mai.',
        },
        {
          ship: null,
          startOffsetHours: -36,
          durationHours: 8,
          status: ScheduleStatus.CANCELLED,
          priority: 4,
          operation: 'Tập huấn an toàn lao động',
          completionPercentage: 0,
          resources: {
            trainingType: 'SAFETY',
            location: 'Hội trường cảng',
            cancellationReason: 'Hoãn do thời tiết xấu',
          },
          notes: 'Hoãn do mưa bão. Lên lịch lại tuần sau.',
        },
        
        // === PENDING SCHEDULES FOR APPROVAL WORKFLOW ===
        {
          ship: savedShips[4],
          startOffsetHours: 12,
          durationHours: 6,
          status: ScheduleStatus.PENDING,
          priority: 7,
          operation: 'Kiểm tra hải quan container đặc biệt',
          completionPercentage: 0,
          resources: {
            berthId: 'CT8',
            berthName: savedShips[4].berthLocation,
            inspectionType: 'CUSTOMS',
            customsTeam: 'Đội hải quan cảng',
            containerList: ['MSCU1234567', 'MSCU1234568', 'MSCU1234569'],
          },
          notes: 'Chờ phê duyệt từ hải quan. Container chứa hàng có giá trị cao cần kiểm tra kỹ.',
        },
        {
          ship: null,
          startOffsetHours: 24,
          durationHours: 4,
          status: ScheduleStatus.PENDING,
          priority: 6,
          operation: 'Nâng cấp hệ thống TOS',
          completionPercentage: 0,
          resources: {
            maintenanceType: 'SYSTEM_UPGRADE',
            affectedSystems: ['TOS', 'Gate System', 'Yard Management'],
            downtimeRequired: true,
            approvalRequired: adminUser?.fullName ?? 'Admin',
          },
          notes: 'Chờ phê duyệt từ Ban Giám Đốc. Cần ngừng hoạt động 4 tiếng vào ban đêm.',
        },
      ];

      // Filter out schedule definitions where the ship doesn't exist
      const validScheduleDefinitions = scheduleDefinitions.filter(def => def.ship != null);
      
      const demoSchedules = validScheduleDefinitions.map((definition) => {
        const startTime = new Date(now.getTime() + definition.startOffsetHours * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + definition.durationHours * 60 * 60 * 1000);

        return scheduleRepo.create({
          shipVisitId: definition.ship.id,
          startTime,
          endTime,
          actualStartTime: definition.status === ScheduleStatus.IN_PROGRESS ? startTime : null,
          actualEndTime: definition.status === ScheduleStatus.COMPLETED ? endTime : null,
          status: definition.status,
          priority: definition.priority,
          operation: definition.operation,
          completionPercentage: definition.completionPercentage,
          estimatedDuration: definition.durationHours * 60,
          resources: definition.resources,
          notes: definition.notes,
        });
      });

      const savedSchedules = await scheduleRepo.save(demoSchedules);
      console.log(`   ✅ Created ${savedSchedules.length} schedules`);

      const [
        virgoDischarge,
        virgoLoadPrep,
        mscYardTransfer,
        everGoldenOperations,
        oneCommitmentOperations,
        pacificHarmonyPlanning,
        weeklyMeeting,
        driverReeferTransport,
        driverEmptyPickup,
        maerskCompleted,
        dongNaiShuttleCompleted,
        maintenanceCompleted,
        everSafetyCancelled,
        trainingCancelled,
        customsInspectionPending,
        systemUpgradePending,
      ] = savedSchedules;

      // 5. TASKS linked to schedules
      console.log('📋 Creating schedule tasks...');
      const scheduleTasksDefinitions = [
        {
          schedule: virgoDischarge,
          taskName: 'Vận chuyển container lạnh vào kho',
          taskType: TaskType.UNLOADING,
          status: TaskStatus.IN_PROGRESS,
          startOffsetMinutes: 30,
          durationMinutes: 210,
          asset: truckAsset,
          priority: 9,
          assignedTo: driverUser?.id ?? null,
          completionPercentage: 55,
          location: 'Kho lạnh Cát Lái',
          metadata: {
            driverId: driverUser?.id ?? null,
            driverName: driverUser?.fullName ?? null,
            containerCount: 24,
            route: {
              origin: 'Bến CT1',
              destination: 'Kho lạnh Zone B',
            },
          },
          notes: 'Ưu tiên giao hàng cho khách CJ Logistics.',
        },
        {
          schedule: virgoDischarge,
          taskName: 'Điều phối cẩu STS-01',
          taskType: TaskType.UNLOADING,
          status: TaskStatus.IN_PROGRESS,
          startOffsetMinutes: 0,
          durationMinutes: 360,
          asset: cranes[0],
          priority: 8,
          assignedTo: opsUser?.id ?? null,
          completionPercentage: 60,
          location: savedShips[0].berthLocation,
          metadata: {
            shift: 'Ca sáng',
            supervisorId: opsUser?.id ?? null,
          },
          notes: 'Theo dõi sản lượng dỡ hàng từng giờ.',
        },
        {
          schedule: virgoLoadPrep,
          taskName: 'Chuẩn bị manifest xếp hàng',
          taskType: TaskType.TRANSFER,
          status: TaskStatus.PENDING,
          startOffsetMinutes: 90,
          durationMinutes: 180,
          asset: null,
          priority: 7,
          assignedTo: managerUser?.id ?? null,
          completionPercentage: 0,
          location: 'Văn phòng điều độ',
          metadata: {
            checklist: ['Manifest', 'Danh sách container ưu tiên', 'Thông báo hãng tàu'],
          },
          notes: 'Chờ xác nhận danh sách hàng nguy hiểm từ hãng tàu.',
        },
        {
          schedule: mscYardTransfer,
          taskName: 'Sắp xếp bãi B3',
          taskType: TaskType.TRANSFER,
          status: TaskStatus.IN_PROGRESS,
          startOffsetMinutes: 45,
          durationMinutes: 240,
          asset: rtgAsset,
          priority: 8,
          assignedTo: opsUser?.id ?? null,
          completionPercentage: 40,
          location: 'Yard B3',
          metadata: {
            yardBlock: 'B3',
            plannedMoves: 120,
          },
          notes: 'Di chuyển container 40HC sang block B5 để giảm tải.',
        },
        
        // Additional tasks for new schedules
        {
          schedule: everGoldenOperations,
          taskName: 'Dỡ container EVER GOLDEN',
          taskType: TaskType.UNLOADING,
          status: TaskStatus.IN_PROGRESS,
          startOffsetMinutes: 0,
          durationMinutes: 360,
          asset: cranes[4],
          priority: 8,
          assignedTo: opsUser?.id ?? null,
          completionPercentage: 35,
          location: savedShips[2].berthLocation,
          metadata: {
            containerCount: 2400,
            shift: 'Ca sáng',
          },
          notes: 'Đang xử lý container thường, ưu tiên hàng có booking sớm.',
        },
        {
          schedule: oneCommitmentOperations,
          taskName: 'Xếp container reefer',
          taskType: TaskType.LOADING,
          status: TaskStatus.IN_PROGRESS,
          startOffsetMinutes: -60,
          durationMinutes: 420,
          asset: cranes[5],
          priority: 9,
          assignedTo: opsUser?.id ?? null,
          completionPercentage: 72,
          location: savedShips[4].berthLocation,
          metadata: {
            containerType: 'REEFER',
            containerCount: 1900,
            remainingCount: 200,
          },
          notes: 'Ưu tiên xếp container lạnh có nhiệt độ đặc biệt.',
        },
        {
          schedule: driverReeferTransport,
          taskName: 'Vận chuyển container lạnh đợt 2',
          taskType: TaskType.TRANSFER,
          status: TaskStatus.PENDING,
          startOffsetMinutes: 0,
          durationMinutes: 180,
          asset: truckAsset,
          priority: 9,
          assignedTo: driverUser?.id ?? null,
          completionPercentage: 0,
          location: 'CT1 → Kho lạnh Zone C',
          metadata: {
            driverId: driverUser?.id ?? null,
            driverName: driverUser?.fullName ?? null,
            vehicleNumber: '79C-12345',
            containerCount: 15,
            route: {
              origin: 'Bến CT1',
              destination: 'Kho lạnh Zone C',
            },
          },
          notes: 'Nhận container từ bến lúc 13:00. Giao hàng trước 16:00.',
        },
        {
          schedule: driverEmptyPickup,
          taskName: 'Thu gom container rỗng từ bãi',
          taskType: TaskType.TRANSFER,
          status: TaskStatus.PENDING,
          startOffsetMinutes: 0,
          durationMinutes: 120,
          asset: truckAsset,
          priority: 7,
          assignedTo: driverUser?.id ?? null,
          completionPercentage: 0,
          location: 'Yard D → Depot',
          metadata: {
            driverId: driverUser?.id ?? null,
            vehicleNumber: '79C-12345',
            containerCount: 20,
            containerType: 'EMPTY',
          },
          notes: 'Kiểm tra container không bị hư hỏng trước khi chuyển về depot.',
        },
        {
          schedule: maerskCompleted,
          taskName: 'Hoàn tất dỡ hàng MAERSK',
          taskType: TaskType.UNLOADING,
          status: TaskStatus.COMPLETED,
          startOffsetMinutes: -1440,
          durationMinutes: 720,
          asset: cranes.length > 11 ? cranes[11] : cranes[0],
          priority: 8,
          assignedTo: opsUser?.id ?? null,
          completionPercentage: 100,
          location: savedShips[3].berthLocation,
          metadata: {
            containerCount: 2600,
            shift: 'Ca ngày',
          },
          notes: 'Hoàn thành đúng tiến độ, tàu đã rời bến.',
        },
        {
          schedule: dongNaiShuttleCompleted,
          taskName: 'Bốc container lên sà lan',
          taskType: TaskType.LOADING,
          status: TaskStatus.COMPLETED,
          startOffsetMinutes: -60,
          durationMinutes: 180,
          asset: cranes[1],
          priority: 6,
          assignedTo: driverUser?.id ?? null,
          completionPercentage: 100,
          location: savedShips[5].berthLocation,
          metadata: {
            driverId: driverUser?.id ?? null,
            containerCount: 18,
          },
          notes: 'Hoàn thành trước kế hoạch 30 phút.',
        },
      ];

      // Filter out tasks where the schedule doesn't exist
      const scheduleTasks = scheduleTasksDefinitions.filter(task => task.schedule != null);

      const taskEntities = scheduleTasks.map((template) => {
        const startTime = new Date(template.schedule.startTime.getTime() + template.startOffsetMinutes * 60 * 1000);
        const endTime = new Date(startTime.getTime() + template.durationMinutes * 60 * 1000);

        return taskRepo.create({
          scheduleId: template.schedule.id,
          assetId: template.asset?.id ?? null,
          taskName: template.taskName,
          taskType: template.taskType,
          status: template.status,
          priority: template.priority ?? 5,
          startTime,
          endTime,
          actualStartTime: template.status === TaskStatus.IN_PROGRESS || template.status === TaskStatus.COMPLETED ? startTime : null,
          actualEndTime: template.status === TaskStatus.COMPLETED ? endTime : null,
          completionPercentage:
            template.completionPercentage ??
            (template.status === TaskStatus.COMPLETED
              ? 100
              : template.status === TaskStatus.IN_PROGRESS
              ? 50
              : 0),
          assignedTo: template.assignedTo ?? null,
          location: template.location ?? null,
          metadata: template.metadata ?? null,
          notes: template.notes ?? null,
        });
      });

      await taskRepo.save(taskEntities);
      console.log(`   ✅ Created ${taskEntities.length} tasks`);

    console.log('');
    console.log('✨ Demo data seeding completed!');
    console.log('');
    console.log('📋 Login Credentials:');
  console.log('   Admin:      admin@catlai.com / Admin@2025');
  console.log('   Manager:    manager@catlai.com / Manager@2025');
  console.log('   Operations: ops@catlai.com / Ops@2025');
  console.log('   Driver:     driver@catlai.com / Driver@2025');
    console.log('');
    console.log('📊 Demo Data Summary:');
    console.log('   - 4 Users (Admin, Manager, Operations, Driver)');
    console.log('   - 28 Assets (26 STS Cranes + 2 Yard Equipment)');
    console.log('   - 7 Ship Visits (5 in progress, 1 departed, 1 planned)');
    console.log(`   - ${savedSchedules.length} Schedules (role-based filtering enabled)`);
    console.log(`   - ${taskEntities.length} Tasks (with driver assignments)`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seedDemoData()
  .then(() => {
    console.log('🎉 Demo seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Demo seeding failed:', error);
    process.exit(1);
  });
