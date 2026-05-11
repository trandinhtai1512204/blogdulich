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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
const payments_service_1 = require("./payments.service");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const mail_service_1 = require("../mail/mail.service");
let PaymentsController = class PaymentsController {
    prisma;
    paymentsService;
    mailService;
    stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    constructor(prisma, paymentsService, mailService) {
        this.prisma = prisma;
        this.paymentsService = paymentsService;
        this.mailService = mailService;
    }
    createCheckout(bookingId, req) {
        return this.paymentsService.createCheckoutSession(bookingId, req.user.sub);
    }
    async handleWebhook(req, sig) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(req.rawBody ?? req.body, sig, endpointSecret);
        }
        catch (err) {
            console.log('❌ Webhook verify failed:', err.message);
            throw err;
        }
        console.log('✅ Webhook received:', event.type);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const bookingId = session.metadata?.bookingId;
            if (!bookingId)
                return { received: true };
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { hotel: true, user: true },
            });
            if (!booking || booking.status !== 'pending')
                return { received: true };
            await this.prisma.$transaction(async (tx) => {
                await tx.booking.update({
                    where: { id: bookingId },
                    data: { status: 'confirmed' },
                });
                await tx.payment.update({
                    where: { bookingId },
                    data: { status: 'paid', transactionId: session.payment_intent },
                });
                await tx.hotel.update({
                    where: { id: booking.hotelId },
                    data: { availableRooms: { decrement: 1 } },
                });
            });
            console.log('🔥 Booking confirmed:', bookingId);
            try {
                await this.mailService.sendBookingConfirmation({
                    toEmail: booking.user.email,
                    toName: booking.user.name || 'Khách hàng',
                    hotelName: booking.hotel.name,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    totalPrice: booking.totalPrice,
                    bookingId: booking.id,
                });
            }
            catch (mailErr) {
                console.log('⚠️ Email failed (non-critical):', mailErr.message);
            }
        }
        if (event.type === 'checkout.session.expired') {
            const session = event.data.object;
            const bookingId = session.metadata?.bookingId;
            if (!bookingId)
                return { received: true };
            await this.prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'cancelled' },
            });
            await this.prisma.payment.update({
                where: { bookingId },
                data: { status: 'failed' },
            });
            console.log('⏰ Booking expired:', bookingId);
        }
        return { received: true };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Post)('checkout/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_service_1.PaymentsService,
        mail_service_1.MailService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map