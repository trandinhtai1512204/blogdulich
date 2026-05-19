import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateBookingDto): Promise<{
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
    }>;
    getMyBookings(userId: string): Promise<({
        hotel: {
            id: string;
            name: string;
            slug: string;
            address: string;
            images: string[];
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
    })[]>;
    cancel(bookingId: string, userId: string): Promise<{
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
    }>;
}
