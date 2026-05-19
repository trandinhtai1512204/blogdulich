import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string | null;
        createdAt: Date;
        _count: {
            bookings: number;
        };
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        bookings: ({
            hotel: {
                id: string;
                name: string;
                slug: string;
                createdAt: Date;
                cityId: string;
                description: string | null;
                updatedAt: Date;
                address: string;
                price: number;
                images: string[];
                availableRooms: number;
            };
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                bookingId: string;
                provider: string;
                transactionId: string | null;
                amount: number;
                currency: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            hotelId: string;
            checkIn: Date;
            checkOut: Date;
            totalPrice: number;
            expiresAt: Date | null;
            userId: string;
        })[];
    }>;
    updateRole(id: string, role: 'admin' | 'user'): Promise<{
        id: string;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
