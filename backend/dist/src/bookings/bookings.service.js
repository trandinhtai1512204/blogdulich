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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const { hotelId, checkIn, checkOut } = dto;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkOutDate <= checkInDate) {
            throw new common_1.BadRequestException('checkOut phải sau checkIn');
        }
        const nights = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);
        return this.prisma.$transaction(async (tx) => {
            const hotel = await tx.hotel.findUnique({ where: { id: hotelId } });
            if (!hotel)
                throw new common_1.BadRequestException('Hotel không tồn tại');
            if (hotel.availableRooms <= 0)
                throw new common_1.BadRequestException('Hết phòng');
            const overlap = await tx.booking.findFirst({
                where: {
                    hotelId,
                    status: 'confirmed',
                    OR: [{ checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } }],
                },
            });
            if (overlap)
                throw new common_1.BadRequestException('Phòng đã được đặt trong khoảng thời gian này');
            const totalPrice = nights * hotel.price;
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            const booking = await tx.booking.create({
                data: {
                    userId,
                    hotelId,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    totalPrice,
                    status: 'pending',
                    expiresAt,
                },
            });
            return booking;
        });
    }
    async getMyBookings(userId) {
        return this.prisma.booking.findMany({
            where: { userId },
            include: {
                hotel: {
                    select: { id: true, name: true, slug: true, address: true, images: true },
                },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async cancel(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.BadRequestException('Booking không tồn tại');
        if (booking.userId !== userId)
            throw new common_1.BadRequestException('Không phải booking của bạn');
        if (booking.status !== 'pending')
            throw new common_1.BadRequestException('Chỉ có thể hủy booking đang pending');
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'cancelled' },
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map