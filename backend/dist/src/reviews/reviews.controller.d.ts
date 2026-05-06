import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    create(hotelId: string, req: any, dto: CreateReviewDto): Promise<{
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
                email: string;
                name: string | null;
                id: string;
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
    delete(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        hotelId: string;
        rating: number;
        comment: string | null;
    }>;
}
