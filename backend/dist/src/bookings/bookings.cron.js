"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BookingsCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let BookingsCron = BookingsCron_1 = class BookingsCron {
    prisma;
    logger = new common_1.Logger(BookingsCron_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async expireBookings() {
        const result = await this.prisma.booking.updateMany({
            where: {
                status: 'pending',
                expiresAt: { lt: new Date() },
            },
            data: { status: 'cancelled' },
        });
        if (result.count > 0) {
            this.logger.log(`⏰ Expired ${result.count} booking(s)`);
        }
    }
};
exports.BookingsCron = BookingsCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsCron.prototype, "expireBookings", null);
exports.BookingsCron = BookingsCron = BookingsCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsCron);
//# sourceMappingURL=bookings.cron.js.map