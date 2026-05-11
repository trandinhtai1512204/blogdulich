import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
export declare class CitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        slug: string;
        name: string;
        country: string;
        image: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(slug: string): Promise<{
        hotels: {
            id: string;
            slug: string;
            name: string;
            address: string;
            price: number;
            images: string[];
            availableRooms: number;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        country: string;
        image: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateCityDto): import(".prisma/client").Prisma.Prisma__CityClient<{
        id: string;
        slug: string;
        name: string;
        country: string;
        image: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: Partial<CreateCityDto>): Promise<{
        id: string;
        slug: string;
        name: string;
        country: string;
        image: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        slug: string;
        name: string;
        country: string;
        image: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
