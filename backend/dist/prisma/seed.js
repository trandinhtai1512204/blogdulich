"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const CITIES = [
    { name: 'Hà Nội', slug: 'ha-noi' },
    { name: 'TP. Hồ Chí Minh', slug: 'sai-gon' },
    { name: 'Hải Phòng', slug: 'hai-phong' },
    { name: 'Đà Nẵng', slug: 'da-nang' },
    { name: 'Cần Thơ', slug: 'can-tho' },
    { name: 'Huế', slug: 'hue' },
    { name: 'An Giang', slug: 'an-giang' },
    { name: 'Bắc Ninh', slug: 'bac-ninh' },
    { name: 'Cà Mau', slug: 'ca-mau' },
    { name: 'Cao Bằng', slug: 'cao-bang' },
    { name: 'Đắk Lắk', slug: 'dak-lak' },
    { name: 'Điện Biên', slug: 'dien-bien' },
    { name: 'Đồng Nai', slug: 'dong-nai' },
    { name: 'Đồng Tháp', slug: 'dong-thap' },
    { name: 'Gia Lai', slug: 'gia-lai' },
    { name: 'Hà Tĩnh', slug: 'ha-tinh' },
    { name: 'Hưng Yên', slug: 'hung-yen' },
    { name: 'Khánh Hòa', slug: 'khanh-hoa' },
    { name: 'Lai Châu', slug: 'lai-chau' },
    { name: 'Lâm Đồng', slug: 'lam-dong' },
    { name: 'Lạng Sơn', slug: 'lang-son' },
    { name: 'Lào Cai', slug: 'lao-cai' },
    { name: 'Nghệ An', slug: 'nghe-an' },
    { name: 'Ninh Bình', slug: 'ninh-binh' },
    { name: 'Phú Thọ', slug: 'phu-tho' },
    { name: 'Quảng Ngãi', slug: 'quang-ngai' },
    { name: 'Quảng Ninh', slug: 'quang-ninh' },
    { name: 'Quảng Trị', slug: 'quang-tri' },
    { name: 'Sơn La', slug: 'son-la' },
    { name: 'Tây Ninh', slug: 'tay-ninh' },
    { name: 'Thái Nguyên', slug: 'thai-nguyen' },
    { name: 'Thanh Hóa', slug: 'thanh-hoa' },
    { name: 'Tuyên Quang', slug: 'tuyen-quang' },
    { name: 'Vĩnh Long', slug: 'vinh-long' },
];
const VERTICALS = [
    { rootSlug: 'lich-trinh-du-lich', type: 'itinerary', slugPrefix: 'lich-trinh-du-lich' },
    { rootSlug: 'kinh-nghiem', type: 'experience', slugPrefix: 'kinh-nghiem-du-lich' },
];
const REVIEW_SUBTYPES = [
    { name: 'Tour', slug: 'review-tour' },
    { name: 'Khách sạn', slug: 'review-khach-san' },
    { name: 'Combo', slug: 'review-combo' },
    { name: 'Resort', slug: 'review-resort' },
    { name: 'Du thuyền', slug: 'review-du-thuyen' },
    { name: 'Nhà hàng', slug: 'review-nha-hang' },
];
async function ensureCities() {
    for (const c of CITIES) {
        await prisma.city.upsert({
            where: { slug: c.slug },
            create: { name: c.name, slug: c.slug, country: 'Vietnam' },
            update: { name: c.name },
        });
    }
    console.log(`✓ ${CITIES.length} cities upserted`);
}
async function getRoot(slug) {
    const root = await prisma.category.findFirst({ where: { slug, parentId: null } });
    if (!root)
        throw new Error(`Missing system root category: ${slug}. Boot the app once to auto-create it.`);
    return root;
}
async function seedFlatVerticals() {
    const cities = await prisma.city.findMany({
        where: { slug: { in: CITIES.map((c) => c.slug) } },
        select: { id: true, name: true, slug: true },
    });
    for (const v of VERTICALS) {
        const root = await getRoot(v.rootSlug);
        let count = 0;
        for (const city of cities) {
            const slug = `${v.slugPrefix}-${city.slug}`;
            await prisma.category.upsert({
                where: { parentId_slug: { parentId: root.id, slug } },
                create: {
                    name: city.name,
                    slug,
                    type: v.type,
                    level: 'CITY',
                    parentId: root.id,
                    cityId: city.id,
                },
                update: {
                    name: city.name,
                    type: v.type,
                    level: 'CITY',
                    cityId: city.id,
                },
            });
            count++;
        }
        console.log(`✓ ${count} ${v.type} categories upserted`);
    }
}
async function seedReviewSubtypes() {
    const root = await getRoot('review');
    for (const r of REVIEW_SUBTYPES) {
        await prisma.category.upsert({
            where: { parentId_slug: { parentId: root.id, slug: r.slug } },
            create: {
                name: r.name,
                slug: r.slug,
                type: 'review',
                level: 'SUBTYPE',
                parentId: root.id,
                cityId: null,
            },
            update: {
                name: r.name,
                type: 'review',
                level: 'SUBTYPE',
                cityId: null,
            },
        });
    }
    console.log(`✓ ${REVIEW_SUBTYPES.length} review subtypes upserted`);
}
async function main() {
    await ensureCities();
    await seedFlatVerticals();
    await seedReviewSubtypes();
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map