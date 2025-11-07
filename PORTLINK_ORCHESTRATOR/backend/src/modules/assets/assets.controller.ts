import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, AssetFilterDto, AssetStatus, AssetType } from './dto/asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findAll(@Query() filterDto: AssetFilterDto) {
    return this.assetsService.findAll(filterDto);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.assetsService.getStatistics();
  }

  @Get('available')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findAvailable(@Query('type') type?: AssetType) {
    return this.assetsService.findAvailable(type);
  }

  @Get('by-type/:type')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findByType(@Param('type') type: AssetType) {
    return this.assetsService.findByType(type);
  }

  @Get('by-status/:status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findByStatus(@Param('status') status: AssetStatus) {
    return this.assetsService.findByStatus(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AssetStatus,
  ) {
    return this.assetsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.remove(id);
  }
}
