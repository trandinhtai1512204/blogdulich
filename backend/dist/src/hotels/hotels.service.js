"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HotelsService = class HotelsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { cityId, search, minPrice, maxPrice, page = '1', limit = '10' } = query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const where = {};
        if (cityId)
            where.cityId = cityId;
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        const [data, total] = await Promise.all([
            this.prisma.hotel.findMany({
                where,
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                orderBy: { createdAt: 'desc' },
                include: { city: true },
            }),
            this.prisma.hotel.count({ where }),
        ]);
        return {
            data,
            meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) },
        };
    }
    async findOne(slug) {
        const hotel = await this.prisma.hotel.findUnique({
            where: { slug },
            include: { city: true },
        });
        if (!hotel)
            throw new common_1.NotFoundException('Hotel không tồn tại');
        return hotel;
    }
    create(dto) {
        return this.prisma.hotel.create({ data: dto });
    }
    async update(id, dto) {
        const hotel = await this.prisma.hotel.findUnique({ where: { id } });
        if (!hotel)
            throw new common_1.NotFoundException('Hotel không tồn tại');
        return this.prisma.hotel.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const hotel = await this.prisma.hotel.findUnique({ where: { id } });
        if (!hotel)
            throw new common_1.NotFoundException('Hotel không tồn tại');
        return this.prisma.hotel.delete({ where: { id } });
    }
};
exports.HotelsService = HotelsService;
exports.HotelsService = HotelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HotelsService);
//# sourceMappingURL=hotels.service.js.map