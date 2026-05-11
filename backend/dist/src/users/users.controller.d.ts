import { UsersService } from './users.service';
declare class UpdateRoleDto {
    role: 'admin' | 'user';
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
                slug: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                cityId: string;
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
            hotelId: string;
            checkIn: Date;
            checkOut: Date;
            totalPrice: number;
            status: import(".prisma/client").$Enums.BookingStatus;
            expiresAt: Date | null;
            userId: string;
        })[];
    }>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<{
        id: string;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
export {};
