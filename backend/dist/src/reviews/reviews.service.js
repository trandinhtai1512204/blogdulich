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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, hotelId, dto) {
        const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel)
            throw new common_1.NotFoundException('Hotel không tồn tại');
        const booking = await this.prisma.booking.findFirst({
            where: { userId, hotelId, status: 'confirmed' },
        });
        if (!booking)
            throw new common_1.BadRequestException('Bạn cần đặt phòng thành công mới được đánh giá');
        return this.prisma.review.upsert({
            where: { userId_hotelId: { userId, hotelId } },
            create: { userId, hotelId, ...dto },
            update: { rating: dto.rating, comment: dto.comment },
        });
    }
    async findByHotel(hotelId) {
        const reviews = await this.prisma.review.findMany({
            where: { hotelId },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const total = reviews.length;
        const avg = total > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
            : 0;
        const distribution = [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: reviews.filter((r) => r.rating === star).length,
        }));
        return { reviews, total, avg: Math.round(avg * 10) / 10, distribution };
    }
    async delete(reviewId, userId) {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!review)
            throw new common_1.NotFoundException('Review không tồn tại');
        if (review.userId !== userId)
            throw new common_1.BadRequestException('Không phải review của bạn');
        return this.prisma.review.delete({ where: { id: reviewId } });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map