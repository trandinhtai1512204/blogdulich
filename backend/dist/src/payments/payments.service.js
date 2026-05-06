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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCheckoutSession(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { hotel: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking không tồn tại');
        if (booking.userId !== userId)
            throw new common_1.BadRequestException('Không phải booking của bạn');
        if (booking.status !== 'pending')
            throw new common_1.BadRequestException('Booking không hợp lệ');
        const existingPayment = await this.prisma.payment.findUnique({
            where: { bookingId },
        });
        if (existingPayment?.status === 'paid') {
            throw new common_1.BadRequestException('Booking này đã được thanh toán');
        }
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Đặt phòng: ${booking.hotel.name}`,
                            description: `Check-in: ${booking.checkIn.toLocaleDateString('vi-VN')} → Check-out: ${booking.checkOut.toLocaleDateString('vi-VN')}`,
                        },
                        unit_amount: Math.round(booking.totalPrice * 100),
                    },
                    quantity: 1,
                },
            ],
            metadata: { bookingId: booking.id },
            success_url: `${process.env.CLIENT_URL}/booking/success?bookingId=${bookingId}`,
            cancel_url: `${process.env.CLIENT_URL}/booking/cancel?bookingId=${bookingId}`,
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });
        await this.prisma.payment.upsert({
            where: { bookingId },
            update: { transactionId: session.id, status: 'pending' },
            create: {
                bookingId,
                provider: 'stripe',
                transactionId: session.id,
                amount: booking.totalPrice,
                status: 'pending',
            },
        });
        return { url: session.url, sessionId: session.id };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map