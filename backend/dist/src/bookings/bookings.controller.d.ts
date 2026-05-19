import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsController {
    private bookingService;
    constructor(bookingService: BookingsService);
    create(req: any, dto: CreateBookingDto): Promise<{
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
    getMyBookings(req: any): Promise<({
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
    cancel(id: string, req: any): Promise<{
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
