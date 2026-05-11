import { PrismaService } from '../prisma/prisma.service';
import { QueryHotelsDto } from './dto/query-hotels.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
export declare class HotelsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryHotelsDto): Promise<{
        data: ({
            city: {
                id: string;
                slug: string;
                name: string;
                country: string;
                image: string | null;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
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
            slug: string;
            name: string;
            country: string;
            image: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
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
    }>;
    create(dto: CreateHotelDto): import(".prisma/client").Prisma.Prisma__HotelClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: Partial<CreateHotelDto>): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
