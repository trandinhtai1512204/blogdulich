import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { MailService } from '../mail/mail.service';
export declare class PaymentsController {
    private prisma;
    private paymentsService;
    private mailService;
    private stripe;
    constructor(prisma: PrismaService, paymentsService: PaymentsService, mailService: MailService);
    createCheckout(bookingId: string, req: any): Promise<{
        url: string | null;
        sessionId: string;
    }>;
    handleWebhook(req: Request, sig: string): Promise<{
        received: boolean;
    }>;
}
