import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    private stripe;
    constructor(prisma: PrismaService);
    createCheckoutSession(bookingId: string, userId: string): Promise<{
        url: string | null;
        sessionId: string;
    }>;
}
