import { HotelsService } from './hotels.service';
import { QueryHotelsDto } from './dto/query-hotels.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
export declare class HotelsController {
    private hotelsService;
    constructor(hotelsService: HotelsService);
    findAll(query: QueryHotelsDto): Promise<{
        data: ({
            city: {
                id: string;
                name: string;
                slug: string;
                createdAt: Date;
                country: string;
                image: string | null;
                description: string | null;
                updatedAt: Date;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(slug: string): Promise<{
        city: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            country: string;
            image: string | null;
            description: string | null;
            updatedAt: Date;
        };
    } & {
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
    }>;
    create(dto: CreateHotelDto): import(".prisma/client").Prisma.Prisma__HotelClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: Partial<CreateHotelDto>): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
