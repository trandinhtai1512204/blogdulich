import { PrismaService } from '../prisma/prisma.service';
import { QueryHotelsDto } from './dto/query-hotels.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
export declare class HotelsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryHotelsDto): Promise<{
        data: ({
            city: {
                image: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                description: string | null;
                country: string;
            };
        } & {
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
            image: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            country: string;
        };
    } & {
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
    }>;
    create(dto: CreateHotelDto): import(".prisma/client").Prisma.Prisma__HotelClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: Partial<CreateHotelDto>): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
