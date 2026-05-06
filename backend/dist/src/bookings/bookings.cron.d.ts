import { PrismaService } from '../prisma/prisma.service';
export declare class BookingsCron {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    expireBookings(): Promise<void>;
}
