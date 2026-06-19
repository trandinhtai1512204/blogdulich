"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const CITIES = [
    { name: 'Hà Nội', slug: 'ha-noi', photo: 'photo-1601108644994-1e450e786d3d' },
    { name: 'Hải Phòng', slug: 'hai-phong', photo: 'photo-1573790387438-4da905039392' },
    { name: 'Quảng Ninh', slug: 'quang-ninh', photo: 'photo-1528360983277-13d401cdc186' },
    { name: 'Lào Cai', slug: 'lao-cai', photo: 'photo-1528127269322-539801943592' },
    { name: 'Lai Châu', slug: 'lai-chau', photo: 'photo-1528127269322-539801943592' },
    { name: 'Điện Biên', slug: 'dien-bien', photo: 'photo-1555041469-a586c61ea9bc' },
    { name: 'Sơn La', slug: 'son-la', photo: 'photo-1587474260584-136574528ed5' },
    { name: 'Cao Bằng', slug: 'cao-bang', photo: 'photo-1528360983277-13d401cdc186' },
    { name: 'Lạng Sơn', slug: 'lang-son', photo: 'photo-1573790387438-4da905039392' },
    { name: 'Tuyên Quang', slug: 'tuyen-quang', photo: 'photo-1528127269322-539801943592' },
    { name: 'Thái Nguyên', slug: 'thai-nguyen', photo: 'photo-1573790387438-4da905039392' },
    { name: 'Phú Thọ', slug: 'phu-tho', photo: 'photo-1601108644994-1e450e786d3d' },
    { name: 'Bắc Ninh', slug: 'bac-ninh', photo: 'photo-1601108644994-1e450e786d3d' },
    { name: 'Hưng Yên', slug: 'hung-yen', photo: 'photo-1601108644994-1e450e786d3d' },
    { name: 'Ninh Bình', slug: 'ninh-binh', photo: 'photo-1573790387438-4da905039392' },
    { name: 'Thanh Hóa', slug: 'thanh-hoa', photo: 'photo-1508009603885-50cf7c8dd0d5' },
    { name: 'Nghệ An', slug: 'nghe-an', photo: 'photo-1508009603885-50cf7c8dd0d5' },
    { name: 'Hà Tĩnh', slug: 'ha-tinh', photo: 'photo-1508009603885-50cf7c8dd0d5' },
    { name: 'Quảng Trị', slug: 'quang-tri', photo: 'photo-1573790387438-4da905039392' },
    { name: 'Huế', slug: 'hue', photo: 'photo-1555041469-a586c61ea9bc' },
    { name: 'Đà Nẵng', slug: 'da-nang', photo: 'photo-1696993545232-2b2717676c40' },
    { name: 'Quảng Ngãi', slug: 'quang-ngai', photo: 'photo-1508009603885-50cf7c8dd0d5' },
    { name: 'Gia Lai', slug: 'gia-lai', photo: 'photo-1587474260584-136574528ed5' },
    { name: 'Khánh Hòa', slug: 'khanh-hoa', photo: 'photo-1508009603885-50cf7c8dd0d5' },
    { name: 'Đắk Lắk', slug: 'dak-lak', photo: 'photo-1587474260584-136574528ed5' },
    { name: 'Lâm Đồng', slug: 'lam-dong', photo: 'photo-1587474260584-136574528ed5' },
    { name: 'TP. Hồ Chí Minh', slug: 'sai-gon', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'Đồng Nai', slug: 'dong-nai', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'Tây Ninh', slug: 'tay-ninh', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'Cần Thơ', slug: 'can-tho', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'Vĩnh Long', slug: 'vinh-long', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'Đồng Tháp', slug: 'dong-thap', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'An Giang', slug: 'an-giang', photo: 'photo-1583417319070-4a69db38a482' },
    { name: 'Cà Mau', slug: 'ca-mau', photo: 'photo-1583417319070-4a69db38a482' },
];
const DEST_SUBS = [
    { name: 'Địa điểm tham quan', slug: 'dia-diem-tham-quan' },
    { name: 'Địa điểm vui chơi', slug: 'dia-diem-vui-choi' },
    { name: 'Di tích lịch sử', slug: 'di-tich-lich-su' },
    { name: 'Bảo tàng', slug: 'bao-tang' },
    { name: 'Ở đâu', slug: 'o-dau' },
];
const SPECIAL_DEST_SUBS = {
    'hai-phong': [
        { name: 'Biển Hải Phòng', slug: 'bien' },
        { name: 'Du lịch Cát Bà', slug: 'cat-ba' },
    ],
    'da-nang': [
        { name: 'Bãi biển Đà Nẵng', slug: 'bai-bien' },
        { name: 'Du lịch Sơn Trà', slug: 'son-tra' },
        { name: 'Du lịch Bà Nà Hills', slug: 'ba-na-hills' },
    ],
};
const REVIEW_SUBTYPES = [
    { name: 'Tour', slug: 'review-tour' },
    { name: 'Khách sạn', slug: 'review-khach-san' },
    { name: 'Combo', slug: 'review-combo' },
    { name: 'Resort', slug: 'review-resort' },
    { name: 'Du thuyền', slug: 'review-du-thuyen' },
    { name: 'Nhà hàng', slug: 'review-nha-hang' },
];
const IMG = (photo) => `https://images.unsplash.com/${photo}?w=1200&q=80`;
const CITY_PHOTO_MAP = new Map(CITIES.map((c) => [c.slug, c.photo]));
const VALID_CITY_SLUGS = new Set(CITIES.map((c) => c.slug));
const DEFAULT_PHOTO = 'photo-1528360983277-13d401cdc186';
function postImage(...parts) {
    const seed = parts
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return `https://picsum.photos/seed/blogdulich-${seed}/1200/800`;
}
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
function destinationSubContent(city, subName) {
    return `<h2>${subName} tại ${city} đáng ghé thăm nhất</h2>
<p>${city} sở hữu nhiều ${subName.toLowerCase()} hấp dẫn, từ cảnh quan thiên nhiên tươi đẹp đến di tích văn hóa lịch sử phong phú.</p>
<h3>Những địa điểm nổi bật</h3>
<p>Khu vực trung tâm ${city} tập trung nhiều ${subName.toLowerCase()} tiêu biểu, mang đậm bản sắc văn hóa và lịch sử địa phương.</p>
<h3>Kinh nghiệm tham quan</h3>
<ul>
<li>Đến buổi sáng sớm để tránh đông và có ánh sáng đẹp chụp ảnh</li>
<li>Mặc trang phục lịch sự khi tham quan địa điểm tôn giáo</li>
<li>Thuê hướng dẫn viên địa phương để hiểu rõ hơn về lịch sử và văn hóa</li>
</ul>`;
}
function anGiContent(city) {
    return `<h2>Ăn gì ở ${city}? Top món ngon không thể bỏ qua</h2>
<p>${city} nổi tiếng với nền ẩm thực phong phú, đậm đà bản sắc địa phương. Dưới đây là những món ăn và địa chỉ ẩm thực bạn nhất định phải thử khi đến ${city}.</p>
<h3>Những món ngon đặc trưng của ${city}</h3>
<p>Ẩm thực ${city} mang đậm nét đặc trưng vùng miền, kết hợp hài hòa giữa các nguyên liệu tươi ngon địa phương và công thức gia truyền độc đáo.</p>
<h3>Địa chỉ ăn uống ngon tại ${city}</h3>
<p><strong>Khu ăn uống trung tâm:</strong> Tập trung nhiều hàng quán đa dạng, phục vụ cả ẩm thực địa phương lẫn món ăn quốc tế.</p>
<p><strong>Chợ đêm và phố ẩm thực:</strong> Nơi lý tưởng để thưởng thức đặc sản ${city} với giá cả phải chăng.</p>
<p><strong>Nhà hàng đặc sản:</strong> Phục vụ những món ăn truyền thống được chế biến cầu kỳ, phù hợp cho các bữa ăn đặc biệt.</p>
<h3>Những lưu ý khi ăn uống tại ${city}</h3>
<ul>
<li>Thử đặc sản địa phương tại các quán ăn bình dân để có trải nghiệm chân thực nhất</li>
<li>Hỏi người dân địa phương để được giới thiệu quán ngon, giá tốt</li>
<li>Ẩm thực đường phố ${city} rất phong phú và an toàn tại các khu tập trung</li>
</ul>`;
}
function oDauContent(city) {
    return `<h2>Ở đâu tại ${city}? Gợi ý khách sạn, homestay tốt nhất</h2>
<p>Lưu trú tại ${city} có rất nhiều lựa chọn phù hợp với mọi ngân sách, từ homestay ấm cúng đến resort cao cấp. Dưới đây là hướng dẫn chọn nơi ở lý tưởng tại ${city}.</p>
<h3>Các khu vực lưu trú tốt nhất tại ${city}</h3>
<p><strong>Trung tâm thành phố:</strong> Thuận tiện di chuyển, gần các điểm tham quan và ẩm thực. Phù hợp với du khách muốn khám phá toàn bộ ${city}.</p>
<p><strong>Khu phố du lịch:</strong> Sôi động, nhiều dịch vụ du lịch, phù hợp với khách trẻ và ưa khám phá.</p>
<p><strong>Ngoại ô và resort:</strong> Yên tĩnh, gần thiên nhiên, lý tưởng cho kỳ nghỉ thư giãn.</p>
<h3>Các loại hình lưu trú phổ biến</h3>
<ul>
<li><strong>Homestay:</strong> Trải nghiệm văn hóa địa phương, giá từ 150.000–400.000 đồng/đêm</li>
<li><strong>Khách sạn mini / 3 sao:</strong> Tiện nghi đầy đủ, giá từ 400.000–800.000 đồng/đêm</li>
<li><strong>Khách sạn 4–5 sao:</strong> Dịch vụ cao cấp, giá từ 1.000.000 đồng/đêm trở lên</li>
<li><strong>Resort:</strong> Phù hợp cho kỳ nghỉ dưỡng, thường có hồ bơi và spa</li>
</ul>
<h3>Lưu ý khi đặt phòng tại ${city}</h3>
<ul>
<li>Đặt trước ít nhất 1–2 tuần vào mùa cao điểm</li>
<li>So sánh giá trên nhiều nền tảng đặt phòng</li>
<li>Đọc kỹ đánh giá của khách hàng trước khi đặt</li>
<li>Kiểm tra vị trí so với các điểm bạn muốn tham quan</li>
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
async function loadSeedCities() {
    const cities = await prisma.city.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { slug: 'asc' },
    });
    return cities.map((city) => ({
        ...city,
        photo: CITY_PHOTO_MAP.get(city.slug) ?? DEFAULT_PHOTO,
    }));
}
function destinationSubsForCity(citySlug) {
    return [...DEST_SUBS, ...(SPECIAL_DEST_SUBS[citySlug] ?? [])];
}
function uniqueSlugItems(items) {
    const seen = new Set();
    return items.filter((item) => {
        if (seen.has(item.slug))
            return false;
        seen.add(item.slug);
        return true;
    });
}
async function resetTaxonomyContent() {
    const deletedPosts = await prisma.post.deleteMany({});
    console.log(`✓ Đã xóa ${deletedPosts.count} posts cũ`);
    const deleteSub = await prisma.category.deleteMany({ where: { level: 'SUB' } });
    const deleteCity = await prisma.category.deleteMany({ where: { level: 'CITY' } });
    const deleteSubtype = await prisma.category.deleteMany({ where: { level: 'SUBTYPE' } });
    const deleteBadRoots = await prisma.category.deleteMany({
        where: {
            parentId: null,
            slug: { notIn: ['diem-den', 'lich-trinh-du-lich', 'review', 'kinh-nghiem'] },
        },
    });
    console.log(`✓ Đã xóa category con cũ: ${deleteSub.count} SUB, ${deleteCity.count} CITY, ${deleteSubtype.count} SUBTYPE, ${deleteBadRoots.count} root ngoài luồng`);
}
async function pruneObsoleteCities() {
    const obsolete = await prisma.city.findMany({
        where: { slug: { notIn: [...VALID_CITY_SLUGS] } },
        select: { id: true, slug: true, _count: { select: { hotels: true } } },
    });
    if (!obsolete.length) {
        console.log('✓ Không có city thừa cần xoá');
        return;
    }
    const deletable = obsolete.filter((c) => c._count.hotels === 0);
    const blocked = obsolete.filter((c) => c._count.hotels > 0);
    if (deletable.length) {
        await prisma.city.deleteMany({ where: { id: { in: deletable.map((c) => c.id) } } });
        console.log(`✓ Đã xoá ${deletable.length} city thừa: ${deletable.map((c) => c.slug).join(', ')}`);
    }
    if (blocked.length) {
        console.warn(`⚠ Bỏ qua ${blocked.length} city còn hotel tham chiếu (xoá tay nếu cần): ${blocked.map((c) => c.slug).join(', ')}`);
    }
}
async function seedCities() {
    for (const c of CITIES) {
        await prisma.city.upsert({
            where: { slug: c.slug },
            create: { name: c.name, slug: c.slug, country: 'Vietnam' },
            update: { name: c.name },
        });
    }
    console.log(`✓ ${CITIES.length} city defaults ensured`);
}
async function seedCategories(cities) {
    const destRoot = await getRoot('diem-den');
    for (const city of cities) {
        await prisma.category.upsert({
            where: { parentId_slug: { parentId: destRoot.id, slug: city.slug } },
            create: { name: city.name, slug: city.slug, type: 'destination', level: 'CITY', parentId: destRoot.id, cityId: null },
            update: { name: city.name, type: 'destination', cityId: null },
        });
    }
    for (const city of cities) {
        const cityCat = await prisma.category.findFirst({
            where: { slug: city.slug, parentId: destRoot.id, level: 'CITY' },
            select: { id: true },
        });
        if (!cityCat)
            continue;
        for (const sub of uniqueSlugItems(destinationSubsForCity(city.slug))) {
            await prisma.category.upsert({
                where: { parentId_slug: { parentId: cityCat.id, slug: sub.slug } },
                create: { name: sub.name, slug: sub.slug, type: 'destination', level: 'SUB', parentId: cityCat.id, cityId: city.id },
                update: { name: sub.name, cityId: city.id },
            });
        }
    }
    console.log(`✓ ${cities.length} destination CITY categories + sitebrief SUBs upserted`);
    const flatVerticals = [
        { rootSlug: 'lich-trinh-du-lich', type: 'itinerary', slugPrefix: 'lich-trinh-du-lich' },
        { rootSlug: 'kinh-nghiem', type: 'experience', slugPrefix: 'kinh-nghiem-du-lich' },
    ];
    for (const v of flatVerticals) {
        const root = await getRoot(v.rootSlug);
        for (const city of cities) {
            const slug = `${v.slugPrefix}-${city.slug}`;
            await prisma.category.upsert({
                where: { parentId_slug: { parentId: root.id, slug } },
                create: { name: city.name, slug, type: v.type, level: 'CITY', parentId: root.id, cityId: city.id },
                update: { name: city.name, type: v.type, cityId: city.id },
            });
        }
        console.log(`✓ ${cities.length} ${v.type} CITY categories upserted`);
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
        for (const city of cities) {
            await prisma.category.upsert({
                where: { parentId_slug: { parentId: subtypeCat.id, slug: city.slug } },
                create: { name: city.name, slug: city.slug, type: 'review', level: 'CITY', parentId: subtypeCat.id, cityId: city.id },
                update: { name: city.name, cityId: city.id },
            });
        }
    }
    console.log(`✓ ${cities.length * REVIEW_SUBTYPES.length} review CITY categories upserted`);
    console.log('✓ review CITY categories use direct L4 post URLs');
}
async function seedPosts(cities) {
    const cityById = new Map(cities.map((c) => [c.id, c]));
    const cityBySlug = new Map(cities.map((c) => [c.slug, c]));
    let total = 0;
    const destRoot = await getRoot('diem-den');
    const destCityCats = await prisma.category.findMany({
        where: { parentId: destRoot.id, level: 'CITY', type: 'destination' },
        select: { id: true, slug: true },
    });
    for (const cityCat of destCityCats) {
        const city = cityBySlug.get(cityCat.slug);
        if (!city)
            continue;
        const thumbnail = postImage('destination', city.slug, 'an-gi');
        await prisma.post.upsert({
            where: { categoryId_slug: { categoryId: cityCat.id, slug: 'an-gi' } },
            create: {
                title: `Ăn gì ở ${city.name}? Top món ngon không thể bỏ qua`,
                slug: 'an-gi',
                excerpt: `Tổng hợp những món ngon đặc sản ${city.name} và địa chỉ ăn uống được yêu thích nhất.`,
                content: anGiContent(city.name),
                thumbnail,
                categoryId: cityCat.id,
                cityId: city.id,
                location: city.name,
                published: true,
                status: 'approved',
            },
            update: { thumbnail },
        });
        total++;
    }
    console.log(`✓ ${destCityCats.length} destination direct posts (an-gi)`);
    const destSubCats = await prisma.category.findMany({
        where: { level: 'SUB', type: 'destination' },
        select: { id: true, name: true, slug: true, cityId: true },
    });
    const subPostMeta = {
        'dia-diem-tham-quan': {
            slug: 'dia-diem-tham-quan-noi-bat',
            title: (c) => `Top địa điểm tham quan ${c} đẹp nhất không thể bỏ lỡ`,
        },
        'dia-diem-vui-choi': {
            slug: 'dia-diem-vui-choi-hot',
            title: (c) => `Địa điểm vui chơi giải trí ${c} hot nhất hiện nay`,
        },
        'di-tich-lich-su': {
            slug: 'di-tich-lich-su-noi-tieng',
            title: (c) => `Di tích lịch sử ${c} nổi tiếng nhất bạn nên ghé thăm`,
        },
        'bao-tang': {
            slug: 'bao-tang-phai-tham',
            title: (c) => `Bảo tàng tại ${c} nhất định phải ghé một lần`,
        },
        'o-dau': {
            slug: 'khach-san-homestay-tot-nhat',
            title: (c) => `Ở đâu tại ${c}? Top khách sạn và homestay tốt nhất`,
        },
    };
    for (const cat of destSubCats) {
        const city = cat.cityId ? cityById.get(cat.cityId) : undefined;
        if (!city)
            continue;
        const meta = subPostMeta[cat.slug] ?? {
            slug: `${cat.slug}-noi-bat`,
            title: (c) => `${cat.name} tại ${c} đáng trải nghiệm nhất`,
        };
        const thumbnail = postImage('destination', city.slug, cat.slug, meta.slug);
        await prisma.post.upsert({
            where: { categoryId_slug: { categoryId: cat.id, slug: meta.slug } },
            create: {
                title: meta.title(city.name),
                slug: meta.slug,
                excerpt: `Khám phá ${cat.name.toLowerCase()} tại ${city.name}: những địa điểm ấn tượng nhất dành cho du khách.`,
                content: cat.slug === 'o-dau'
                    ? oDauContent(city.name)
                    : destinationSubContent(city.name, cat.name),
                thumbnail,
                categoryId: cat.id,
                cityId: city.id,
                location: city.name,
                published: true,
                status: 'approved',
            },
            update: { thumbnail },
        });
        total++;
    }
    console.log(`✓ ${destSubCats.length} destination SUB posts`);
    const itiRoot = await getRoot('lich-trinh-du-lich');
    const itiCats = await prisma.category.findMany({
        where: { parentId: itiRoot.id, level: 'CITY' },
        select: { id: true, cityId: true },
    });
    for (const cat of itiCats) {
        const city = cat.cityId ? cityById.get(cat.cityId) : undefined;
        if (!city)
            continue;
        const itineraryPosts = [
            {
                slug: '3-ngay-2-dem',
                title: `Lịch trình du lịch ${city.name} 3 ngày 2 đêm`,
                excerpt: `Gợi ý lịch trình du lịch ${city.name} 3 ngày 2 đêm chi tiết, phù hợp cho gia đình, cặp đôi và nhóm bạn.`,
            },
            {
                slug: '2-ngay-1-dem',
                title: `Lịch trình du lịch ${city.name} 2 ngày 1 đêm`,
                excerpt: `Gợi ý lịch trình du lịch ${city.name} 2 ngày 1 đêm gọn lịch, dễ đi và tối ưu thời gian.`,
            },
        ];
        for (const item of itineraryPosts) {
            const thumbnail = postImage('itinerary', city.slug, item.slug);
            await prisma.post.upsert({
                where: { categoryId_slug: { categoryId: cat.id, slug: item.slug } },
                create: {
                    title: item.title,
                    slug: item.slug,
                    excerpt: item.excerpt,
                    content: itineraryContent(city.name),
                    thumbnail,
                    categoryId: cat.id,
                    cityId: city.id,
                    location: city.name,
                    published: true,
                    status: 'approved',
                },
                update: { title: item.title, excerpt: item.excerpt, thumbnail },
            });
            total++;
        }
    }
    console.log(`✓ ${itiCats.length * 2} itinerary posts`);
    const expRoot = await getRoot('kinh-nghiem');
    const expCats = await prisma.category.findMany({
        where: { parentId: expRoot.id, level: 'CITY' },
        select: { id: true, cityId: true },
    });
    for (const cat of expCats) {
        const city = cat.cityId ? cityById.get(cat.cityId) : undefined;
        if (!city)
            continue;
        const experiencePosts = [
            {
                slug: 'tu-tuc',
                title: `Kinh nghiệm du lịch ${city.name} tự túc từ A đến Z`,
                excerpt: `Tổng hợp kinh nghiệm du lịch ${city.name} tự túc đầy đủ nhất: di chuyển, ăn ở, tham quan và chi phí.`,
            },
            {
                slug: 'thang-10',
                title: `Kinh nghiệm du lịch ${city.name} tháng 10 — thời điểm, thời tiết, gợi ý`,
                excerpt: `Kinh nghiệm đi ${city.name} tháng 10: thời tiết, lịch trình gợi ý và những lưu ý cần biết.`,
            },
        ];
        for (const item of experiencePosts) {
            const thumbnail = postImage('experience', city.slug, item.slug);
            await prisma.post.upsert({
                where: { categoryId_slug: { categoryId: cat.id, slug: item.slug } },
                create: {
                    title: item.title,
                    slug: item.slug,
                    excerpt: item.excerpt,
                    content: experienceContent(city.name),
                    thumbnail,
                    categoryId: cat.id,
                    cityId: city.id,
                    location: city.name,
                    published: true,
                    status: 'approved',
                },
                update: { title: item.title, excerpt: item.excerpt, thumbnail },
            });
            total++;
        }
    }
    console.log(`✓ ${expCats.length * 2} experience posts`);
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
            const postSlug = `review-${subtype.slug.replace('review-', '')}-2025`;
            const thumbnail = postImage('review', subtype.slug, city.slug, postSlug);
            await prisma.post.upsert({
                where: { categoryId_slug: { categoryId: cat.id, slug: postSlug } },
                create: {
                    title: `Review ${subtype.name} tại ${city.name} — Đánh giá thực tế 2025`,
                    slug: postSlug,
                    excerpt: `Đánh giá chi tiết dịch vụ ${subtype.name.toLowerCase()} tại ${city.name}: chất lượng, giá cả và những điểm nổi bật nhất.`,
                    content: reviewContent(city.name, subtype.name),
                    thumbnail,
                    categoryId: cat.id,
                    cityId: city.id,
                    location: city.name,
                    published: true,
                    status: 'approved',
                },
                update: { thumbnail },
            });
            total++;
        }
    }
    console.log(`✓ review posts upserted`);
    console.log(`\n✓ Tổng cộng ${total} posts`);
}
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
    await ensureSystemRoots();
    await resetTaxonomyContent();
    await pruneObsoleteCities();
    await seedCities();
    const cities = await loadSeedCities();
    console.log(`✓ Sử dụng ${cities.length} cities hiện có trong DB để fill taxonomy`);
    await seedCategories(cities);
    await seedPosts(cities);
    await fixMissingThumbnails();
    console.log('\n✅ Xong!');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map