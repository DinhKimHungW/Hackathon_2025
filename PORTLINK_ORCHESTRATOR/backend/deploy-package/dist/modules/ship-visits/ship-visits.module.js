"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipVisitsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ship_visits_service_1 = require("./ship-visits.service");
const ship_visits_controller_1 = require("./ship-visits.controller");
const ship_visit_entity_1 = require("./entities/ship-visit.entity");
let ShipVisitsModule = class ShipVisitsModule {
};
exports.ShipVisitsModule = ShipVisitsModule;
exports.ShipVisitsModule = ShipVisitsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ship_visit_entity_1.ShipVisit])],
        controllers: [ship_visits_controller_1.ShipVisitsController],
        providers: [ship_visits_service_1.ShipVisitsService],
        exports: [ship_visits_service_1.ShipVisitsService],
    })
], ShipVisitsModule);
//# sourceMappingURL=ship-visits.module.js.map