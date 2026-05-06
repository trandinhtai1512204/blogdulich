import { UsersService } from './users.service';
declare class UpdateRoleDto {
    role: 'admin' | 'user';
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        email: string;
        name: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        _count: {
            bookings: number;
        };
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        name: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        bookings: ({
            hotel: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                address: string;
                price: number;
                images: string[];
                description: string | null;
                availableRooms: number;
                cityId: string;
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
            userId: string;
            hotelId: string;
            checkIn: Date;
            checkOut: Date;
            totalPrice: number;
            status: import(".prisma/client").$Enums.BookingStatus;
            expiresAt: Date | null;
        })[];
    }>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<{
        email: string;
        name: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
export {};
