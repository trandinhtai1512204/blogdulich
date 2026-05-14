"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const CITIES = [
    { name: 'Hà Nội', slug: 'ha-noi', photo: 'photo-1601108644994-1e450e786d3d' },
    { name: 'TP. Hồ Chí Minh', slug: 'sai-gon', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'Đà Nẵng', slug: 'da-nang', photo: 'photo-1696993545232-2b2717676c40' },
    { name: 'Huế', slug: 'hue', photo: 'photo-1555041469-a586c61ea9bc' },
    { name: 'Khánh Hòa', slug: 'khanh-hoa', photo: 'photo-1508009603885-50cf7c8dd0d5' },
    { name: 'Lâm Đồng', slug: 'lam-dong', photo: 'photo-1587474260584-136574528ed5' },
    { name: 'Quảng Ninh', slug: 'quang-ninh', photo: 'photo-1528360983277-13d401cdc186' },
    { name: 'Lào Cai', slug: 'lao-cai', photo: 'photo-1528127269322-539801943592' },
    { name: 'Cần Thơ', slug: 'can-tho', photo: 'photo-1528127269322-539801943592' },
    { name: 'Ninh Bình', slug: 'ninh-binh', photo: 'photo-1573790387438-4da905039392' },
];
const IMG = (photo) => `https://images.unsplash.com/${photo}?w=1200&q=80`;
const REVIEW_SUBTYPES = [
    { name: 'Tour', slug: 'review-tour' },
    { name: 'Khách sạn', slug: 'review-khach-san' },
    { name: 'Combo', slug: 'review-combo' },
    { name: 'Resort', slug: 'review-resort' },
    { name: 'Du thuyền', slug: 'review-du-thuyen' },
    { name: 'Nhà hàng', slug: 'review-nha-hang' },
];
const REVIEW_CITIES = CITIES.slice(0, 5);
function itineraryContent(city) {
    return `<h2>Lịch trình du lịch ${city} 3 ngày 2 đêm chi tiết</h2>
<p>${city} là điểm đến hấp dẫn với nhiều cảnh đẹp và trải nghiệm văn hóa phong phú. Dưới đây là gợi ý lịch trình 3 ngày 2 đêm chi tiết giúp bạn tận hưởng chuyến đi trọn vẹn nhất.</p>
<h3>Ngày 1: Khám phá trung tâm ${city}</h3>
<p><strong>Buổi sáng:</strong> Đến ${city}, check-in khách sạn và dùng bữa sáng địa phương. Tham quan các điểm nổi bật ở trung tâm thành phố.</p>
<p><strong>Buổi chiều:</strong> Ghé thăm khu phố cổ, chợ truyền thống và các di tích lịch sử của ${city}.</p>
<p><strong>Buổi tối:</strong> Thưởng thức ẩm thực đặc sản ${city}, dạo phố đêm và cảm nhận không khí về đêm.</p>
<h3>Ngày 2: Khám phá ngoại ô và thiên nhiên</h3>
<p><strong>Buổi sáng:</strong> Di chuyển đến các điểm tham quan ngoại thành ${city}, thưởng ngoạn cảnh thiên nhiên tươi đẹp.</p>
<p><strong>Buổi chiều:</strong> Trải nghiệm hoạt động ngoài trời, chụp ảnh check-in tại các điểm đẹp xung quanh ${city}.</p>
<p><strong>Buổi tối:</strong> Trở về trung tâm, dùng bữa tối và nghỉ ngơi.</p>
<h3>Ngày 3: Văn hóa và mua sắm</h3>
<p><strong>Buổi sáng:</strong> Thăm bảo tàng, làng nghề truyền thống hoặc các địa điểm văn hóa đặc sắc của ${city}.</p>
<p><strong>Buổi chiều:</strong> Mua sắm quà lưu niệm và đặc sản ${city} mang về.</p>
<p><strong>Buổi tối:</strong> Bữa tối chia tay ${city}, chuẩn bị hành lý cho ngày trở về.</p>
<h3>Lưu ý khi đi ${city}</h3>
<ul>
<li>Đặt khách sạn trước ít nhất 1–2 tuần để có giá tốt</li>
<li>Chuẩn bị trang phục phù hợp với thời tiết địa phương</li>
<li>Mang theo tiền mặt vì một số nơi chưa chấp nhận thanh toán thẻ</li>
</ul>`;
}
function experienceContent(city) {
    return `<h2>Kinh nghiệm du lịch ${city} tự túc từ A đến Z</h2>
<p>Du lịch ${city} tự túc không khó nếu bạn có sự chuẩn bị kỹ càng. Bài viết này tổng hợp đầy đủ kinh nghiệm từ việc lên kế hoạch, di chuyển, ăn ở đến tham quan tại ${city}.</p>
<h3>Thời điểm tốt nhất để đến ${city}</h3>
<p>${city} đẹp nhất vào mùa khô, khi thời tiết thuận lợi cho hoạt động ngoài trời. Tuy nhiên, mỗi mùa đều có nét đẹp riêng.</p>
<h3>Cách di chuyển đến ${city}</h3>
<p><strong>Máy bay:</strong> Cách nhanh và tiện lợi nhất từ các thành phố lớn.</p>
<p><strong>Xe khách / Tàu hỏa:</strong> Lựa chọn tiết kiệm cho du khách có nhiều thời gian.</p>
<p><strong>Tự lái xe:</strong> Phù hợp với nhóm bạn hoặc gia đình muốn tự do khám phá.</p>
<h3>Nơi ở tại ${city}</h3>
<p>${city} có đầy đủ các loại hình lưu trú từ homestay giá rẻ, khách sạn mini đến resort cao cấp. Đặt phòng trước để có giá tốt và vị trí thuận lợi.</p>
<h3>Ẩm thực nhất định phải thử</h3>
<p>${city} nổi tiếng với nhiều món đặc sản độc đáo. Đừng bỏ qua cơ hội thưởng thức ẩm thực tại các quán ăn nổi tiếng và chợ đêm địa phương.</p>
<h3>Những điều cần lưu ý</h3>
<ul>
<li>Tìm hiểu kỹ địa điểm tham quan trước khi đến</li>
<li>Giữ đồ cá nhân cẩn thận ở nơi đông người</li>
<li>Tôn trọng văn hóa và phong tục địa phương</li>
<li>Mua bảo hiểm du lịch để an tâm hơn trong chuyến đi</li>
</ul>`;
}
function destinationContent(city) {
    return `<h2>Top địa điểm du lịch ${city} đẹp nhất không thể bỏ qua</h2>
<p>${city} sở hữu nhiều địa điểm hấp dẫn, từ cảnh quan thiên nhiên tươi đẹp đến di tích lịch sử văn hóa phong phú. Cùng khám phá những điểm đến không thể bỏ qua khi đến ${city}!</p>
<h3>1. Trung tâm lịch sử và văn hóa</h3>
<p>Khu vực trung tâm ${city} với các di tích lịch sử, bảo tàng và kiến trúc cổ kính là điểm đến đầu tiên không thể bỏ qua. Nơi đây lưu giữ những giá trị văn hóa và lịch sử quý báu.</p>
<h3>2. Thiên nhiên và cảnh quan</h3>
<p>${city} có hệ sinh thái phong phú với nhiều cảnh đẹp thiên nhiên, tạo nên vẻ đẹp đặc trưng của vùng đất này.</p>
<h3>3. Khu phố đặc sắc và ẩm thực</h3>
<p>Khu phố cổ và chợ truyền thống tại ${city} là nơi bạn hòa mình vào nhịp sống địa phương, thưởng thức ẩm thực đặc sản và mua sắm đồ thủ công độc đáo.</p>
<h3>4. Điểm vui chơi giải trí</h3>
<p>Bên cạnh các điểm tham quan văn hóa, ${city} còn có nhiều khu vui chơi giải trí hiện đại, phù hợp với mọi lứa tuổi và sở thích.</p>
<h3>Lời khuyên khi tham quan ${city}</h3>
<ul>
<li>Đến buổi sáng sớm để tránh đông và có ánh sáng đẹp chụp ảnh</li>
<li>Mặc trang phục lịch sự khi tham quan địa điểm tôn giáo</li>
<li>Thuê xe máy hoặc xe đạp để dễ dàng di chuyển khám phá</li>
<li>Thử món ăn đường phố địa phương để có trải nghiệm chân thực nhất</li>
</ul>`;
}
function reviewContent(city, subtypeName) {
    return `<h2>Review ${subtypeName} tại ${city} — Đánh giá thực tế 2025</h2>
<p>Sau khi trải nghiệm nhiều dịch vụ ${subtypeName.toLowerCase()} tại ${city}, mình xin chia sẻ đánh giá khách quan nhất để giúp bạn có lựa chọn phù hợp cho chuyến đi.</p>
<h3>Tổng quan</h3>
<p>${city} có khá nhiều lựa chọn ${subtypeName.toLowerCase()} với đa dạng mức giá và chất lượng. Tùy nhu cầu và ngân sách, bạn đều tìm được dịch vụ phù hợp.</p>
<h3>Đánh giá chi tiết</h3>
<p><strong>Chất lượng dịch vụ:</strong> Nhìn chung khá tốt so với mặt bằng chung. Đội ngũ nhân viên nhiệt tình, chuyên nghiệp và am hiểu địa phương.</p>
<p><strong>Giá cả:</strong> Dao động từ bình dân đến cao cấp. Nên so sánh nhiều nơi trước khi quyết định để có giá tốt nhất.</p>
<p><strong>Vị trí:</strong> Đa số có vị trí thuận tiện, gần các điểm tham quan chính và phương tiện giao thông.</p>
<h3>Gợi ý theo ngân sách</h3>
<ul>
<li><strong>Tiết kiệm:</strong> Nhiều lựa chọn bình dân với chất lượng tốt</li>
<li><strong>Trung bình:</strong> Đầy đủ tiện nghi, phù hợp đa số du khách</li>
<li><strong>Cao cấp:</strong> Dịch vụ đẳng cấp, xứng đáng trải nghiệm một lần</li>
</ul>
<h3>Kết luận</h3>
<p>${subtypeName} tại ${city} nhìn chung đáng để trải nghiệm — đánh giá 4/5 sao.</p>`;
}
async function ensureSystemRoots() {
    const roots = [
        { name: 'Điểm đến hấp dẫn', slug: 'diem-den', type: 'destination' },
        { name: 'Lịch trình du lịch', slug: 'lich-trinh-du-lich', type: 'itinerary' },
        { name: 'Review', slug: 'review', type: 'review' },
        { name: 'Kinh nghiệm du lịch', slug: 'kinh-nghiem', type: 'experience' },
    ];
    for (const r of roots) {
        const existing = await prisma.category.findFirst({ where: { slug: r.slug, parentId: null } });
        if (existing) {
            await prisma.category.update({ where: { id: existing.id }, data: { name: r.name, type: r.type, level: 'ROOT' } });
        }
        else {
            await prisma.category.create({ data: { name: r.name, slug: r.slug, type: r.type, level: 'ROOT', parentId: null, cityId: null } });
        }
    }
    console.log('✓ 4 system roots ensured');
}
async function getRoot(slug) {
    const root = await prisma.category.findFirst({ where: { slug, parentId: null } });
    if (!root)
        throw new Error(`Missing root: ${slug}`);
    return root;
}
async function seedCities() {
    for (const c of CITIES) {
        await prisma.city.upsert({
            where: { slug: c.slug },
            create: { name: c.name, slug: c.slug, country: 'Vietnam' },
            update: { name: c.name },
        });
    }
    console.log(`✓ ${CITIES.length} cities upserted`);
}
async function cleanupWrongDestinationCategories() {
    const wrong = await prisma.category.findMany({
        where: { type: 'destination', level: 'CITY', slug: { startsWith: 'du-lich-' } },
        select: { id: true },
    });
    if (!wrong.length)
        return;
    const ids = wrong.map((c) => c.id);
    await prisma.post.deleteMany({ where: { categoryId: { in: ids } } });
    await prisma.category.deleteMany({ where: { id: { in: ids } } });
    console.log(`✓ Dọn ${wrong.length} destination categories sai slug`);
}
async function seedCategories() {
    const cityRecords = await prisma.city.findMany({
        where: { slug: { in: CITIES.map((c) => c.slug) } },
        select: { id: true, name: true, slug: true },
    });
    const cityMap = new Map(cityRecords.map((c) => [c.slug, c]));
    const destRoot = await getRoot('diem-den');
    for (const c of CITIES) {
        const city = cityMap.get(c.slug);
        if (!city)
            continue;
        await prisma.category.upsert({
            where: { parentId_slug: { parentId: destRoot.id, slug: c.slug } },
            create: { name: city.name, slug: c.slug, type: 'destination', level: 'CITY', parentId: destRoot.id, cityId: null },
            update: { name: city.name, type: 'destination', cityId: null },
        });
    }
    for (const c of CITIES) {
        const city = cityMap.get(c.slug);
        if (!city)
            continue;
        const cityCat = await prisma.category.findFirst({
            where: { slug: c.slug, parentId: destRoot.id, level: 'CITY' },
            select: { id: true },
        });
        if (!cityCat)
            continue;
        await prisma.category.upsert({
            where: { parentId_slug: { parentId: cityCat.id, slug: 'diem-du-lich' } },
            create: { name: 'Điểm du lịch', slug: 'diem-du-lich', type: 'destination', level: 'SUB', parentId: cityCat.id, cityId: city.id },
            update: { name: 'Điểm du lịch', cityId: city.id },
        });
    }
    console.log(`✓ ${CITIES.length} destination CITY + SUB categories upserted`);
    const flatVerticals = [
        { rootSlug: 'lich-trinh-du-lich', type: 'itinerary', slugPrefix: 'lich-trinh-du-lich' },
        { rootSlug: 'kinh-nghiem', type: 'experience', slugPrefix: 'kinh-nghiem-du-lich' },
    ];
    for (const v of flatVerticals) {
        const root = await getRoot(v.rootSlug);
        for (const c of CITIES) {
            const city = cityMap.get(c.slug);
            if (!city)
                continue;
            const slug = `${v.slugPrefix}-${c.slug}`;
            await prisma.category.upsert({
                where: { parentId_slug: { parentId: root.id, slug } },
                create: { name: city.name, slug, type: v.type, level: 'CITY', parentId: root.id, cityId: city.id },
                update: { name: city.name, type: v.type, cityId: city.id },
            });
        }
        console.log(`✓ ${CITIES.length} ${v.type} CITY categories upserted`);
    }
    const reviewRoot = await getRoot('review');
    for (const r of REVIEW_SUBTYPES) {
        await prisma.category.upsert({
            where: { parentId_slug: { parentId: reviewRoot.id, slug: r.slug } },
            create: { name: r.name, slug: r.slug, type: 'review', level: 'SUBTYPE', parentId: reviewRoot.id, cityId: null },
            update: { name: r.name },
        });
    }
    console.log(`✓ ${REVIEW_SUBTYPES.length} review subtypes upserted`);
    for (const subtype of REVIEW_SUBTYPES) {
        const subtypeCat = await prisma.category.findFirst({ where: { slug: subtype.slug, level: 'SUBTYPE' } });
        if (!subtypeCat)
            continue;
        for (const c of REVIEW_CITIES) {
            const city = cityMap.get(c.slug);
            if (!city)
                continue;
            const slug = `${subtype.slug}-${c.slug}`;
            await prisma.category.upsert({
                where: { parentId_slug: { parentId: subtypeCat.id, slug } },
                create: { name: city.name, slug, type: 'review', level: 'CITY', parentId: subtypeCat.id, cityId: city.id },
                update: { name: city.name, cityId: city.id },
            });
        }
    }
    console.log(`✓ ${REVIEW_CITIES.length * REVIEW_SUBTYPES.length} review CITY categories upserted`);
}
async function seedPosts() {
    const cityRecords = await prisma.city.findMany({
        where: { slug: { in: CITIES.map((c) => c.slug) } },
        select: { id: true, name: true, slug: true },
    });
    const cityById = new Map(cityRecords.map((c) => [c.id, c]));
    const photoBySlug = new Map(CITIES.map((c) => [c.slug, c.photo]));
    let total = 0;
    const destSubCats = await prisma.category.findMany({
        where: { slug: 'diem-du-lich', level: 'SUB', type: 'destination' },
        select: { id: true, cityId: true },
    });
    for (const cat of destSubCats) {
        const city = cat.cityId ? cityById.get(cat.cityId) : undefined;
        if (!city)
            continue;
        const photo = photoBySlug.get(city.slug) ?? CITIES[0].photo;
        await prisma.post.upsert({
            where: { categoryId_slug: { categoryId: cat.id, slug: 'diem-den-khong-the-bo-qua' } },
            create: {
                title: `Top địa điểm du lịch ${city.name} đẹp nhất không thể bỏ qua`,
                slug: 'diem-den-khong-the-bo-qua',
                excerpt: `Tổng hợp những địa điểm du lịch ${city.name} đẹp nhất, ấn tượng nhất mà bạn không nên bỏ lỡ.`,
                content: destinationContent(city.name),
                thumbnail: IMG(photo),
                categoryId: cat.id,
                cityId: city.id,
                location: city.name,
                published: true,
                status: 'approved',
            },
            update: {},
        });
        total++;
    }
    console.log(`✓ ${destSubCats.length} destination posts`);
    const itiRoot = await getRoot('lich-trinh-du-lich');
    const itiCats = await prisma.category.findMany({
        where: { parentId: itiRoot.id, level: 'CITY' },
        select: { id: true, cityId: true },
    });
    for (const cat of itiCats) {
        const city = cat.cityId ? cityById.get(cat.cityId) : undefined;
        if (!city)
            continue;
        const photo = photoBySlug.get(city.slug) ?? CITIES[0].photo;
        await prisma.post.upsert({
            where: { categoryId_slug: { categoryId: cat.id, slug: 'lich-trinh-3-ngay-2-dem' } },
            create: {
                title: `Lịch trình du lịch ${city.name} 3 ngày 2 đêm chi tiết`,
                slug: 'lich-trinh-3-ngay-2-dem',
                excerpt: `Gợi ý lịch trình du lịch ${city.name} 3 ngày 2 đêm chi tiết, phù hợp cho gia đình, cặp đôi và nhóm bạn.`,
                content: itineraryContent(city.name),
                thumbnail: IMG(photo),
                categoryId: cat.id,
                cityId: city.id,
                location: city.name,
                published: true,
                status: 'approved',
            },
            update: {},
        });
        total++;
    }
    console.log(`✓ ${itiCats.length} itinerary posts`);
    const expRoot = await getRoot('kinh-nghiem');
    const expCats = await prisma.category.findMany({
        where: { parentId: expRoot.id, level: 'CITY' },
        select: { id: true, cityId: true },
    });
    for (const cat of expCats) {
        const city = cat.cityId ? cityById.get(cat.cityId) : undefined;
        if (!city)
            continue;
        const photo = photoBySlug.get(city.slug) ?? CITIES[0].photo;
        await prisma.post.upsert({
            where: { categoryId_slug: { categoryId: cat.id, slug: 'kinh-nghiem-tu-tuc-tu-a-den-z' } },
            create: {
                title: `Kinh nghiệm du lịch ${city.name} tự túc từ A đến Z`,
                slug: 'kinh-nghiem-tu-tuc-tu-a-den-z',
                excerpt: `Tổng hợp kinh nghiệm du lịch ${city.name} tự túc đầy đủ nhất: di chuyển, ăn ở, tham quan và chi phí.`,
                content: experienceContent(city.name),
                thumbnail: IMG(photo),
                categoryId: cat.id,
                cityId: city.id,
                location: city.name,
                published: true,
                status: 'approved',
            },
            update: {},
        });
        total++;
    }
    console.log(`✓ ${expCats.length} experience posts`);
    for (const subtype of REVIEW_SUBTYPES) {
        const subtypeCat = await prisma.category.findFirst({ where: { slug: subtype.slug, level: 'SUBTYPE' } });
        if (!subtypeCat)
            continue;
        const reviewCats = await prisma.category.findMany({
            where: { parentId: subtypeCat.id, level: 'CITY' },
            select: { id: true, cityId: true },
        });
        for (const cat of reviewCats) {
            const city = cat.cityId ? cityById.get(cat.cityId) : undefined;
            if (!city)
                continue;
            const photo = photoBySlug.get(city.slug) ?? CITIES[0].photo;
            const postSlug = `review-${subtype.slug.replace('review-', '')}-2025`;
            await prisma.post.upsert({
                where: { categoryId_slug: { categoryId: cat.id, slug: postSlug } },
                create: {
                    title: `Review ${subtype.name} tại ${city.name} — Đánh giá thực tế 2025`,
                    slug: postSlug,
                    excerpt: `Đánh giá chi tiết dịch vụ ${subtype.name.toLowerCase()} tại ${city.name}: chất lượng, giá cả và những điểm nổi bật nhất.`,
                    content: reviewContent(city.name, subtype.name),
                    thumbnail: IMG(photo),
                    categoryId: cat.id,
                    cityId: city.id,
                    location: city.name,
                    published: true,
                    status: 'approved',
                },
                update: {},
            });
            total++;
        }
    }
    console.log(`✓ ${REVIEW_CITIES.length * REVIEW_SUBTYPES.length} review posts`);
    console.log(`\n✓ Tổng cộng ${total} posts`);
}
const CITY_PHOTO_MAP = new Map(CITIES.map((c) => [c.slug, c.photo]));
const DEFAULT_PHOTO = 'photo-1528360983277-13d401cdc186';
async function fixMissingThumbnails() {
    const posts = await prisma.post.findMany({
        where: { thumbnail: null },
        select: { id: true, city: { select: { slug: true } } },
    });
    if (!posts.length)
        return;
    for (const post of posts) {
        const photo = post.city?.slug
            ? (CITY_PHOTO_MAP.get(post.city.slug) ?? DEFAULT_PHOTO)
            : DEFAULT_PHOTO;
        await prisma.post.update({ where: { id: post.id }, data: { thumbnail: IMG(photo) } });
    }
    console.log(`✓ Gán thumbnail cho ${posts.length} posts thiếu ảnh`);
}
async function main() {
    console.log('▶ Seeding...\n');
    await cleanupWrongDestinationCategories();
    await ensureSystemRoots();
    await seedCities();
    await seedCategories();
    await seedPosts();
    await fixMissingThumbnails();
    console.log('\n✅ Xong!');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map