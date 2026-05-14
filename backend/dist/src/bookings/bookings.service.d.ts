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
        userId: string;
        hotelId: string;
        checkIn: Date;
        checkOut: Date;
        totalPrice: number;
        expiresAt: Date | null;
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
        userId: string;
        hotelId: string;
        checkIn: Date;
        checkOut: Date;
        totalPrice: number;
        expiresAt: Date | null;
    })[]>;
    cancel(bookingId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        userId: string;
        hotelId: string;
        checkIn: Date;
        checkOut: Date;
        totalPrice: number;
        expiresAt: Date | null;
    }>;
}
