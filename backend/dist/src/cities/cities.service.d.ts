import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
export declare class CitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        image: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        country: string;
    }[]>;
    findOne(slug: string): Promise<{
        hotels: {
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
        }[];
    } & {
        image: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        country: string;
    }>;
    create(dto: CreateCityDto): import(".prisma/client").Prisma.Prisma__CityClient<{
        image: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        country: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: Partial<CreateCityDto>): Promise<{
        image: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        country: string;
    }>;
    remove(id: string): Promise<{
        image: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        country: string;
    }>;
}
