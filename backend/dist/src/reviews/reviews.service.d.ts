import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, hotelId: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        hotelId: string;
        rating: number;
        comment: string | null;
    }>;
    findByHotel(hotelId: string): Promise<{
        reviews: ({
            user: {
                id: string;
                name: string | null;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            hotelId: string;
            rating: number;
            comment: string | null;
        })[];
        total: number;
        avg: number;
        distribution: {
            star: number;
            count: number;
        }[];
    }>;
    delete(reviewId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        hotelId: string;
        rating: number;
        comment: string | null;
    }>;
}
