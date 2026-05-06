export declare class MailService {
    private resend;
    sendBookingConfirmation(data: {
        toEmail: string;
        toName: string;
        hotelName: string;
        checkIn: Date;
        checkOut: Date;
        totalPrice: number;
        bookingId: string;
    }): Promise<void>;
    sendVerificationEmail(data: {
        toEmail: string;
        toName: string;
        verifyUrl: string;
    }): Promise<void>;
}
