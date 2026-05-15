"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const supabase_module_1 = require("./supabase/supabase.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const cities_module_1 = require("./cities/cities.module");
const hotels_module_1 = require("./hotels/hotels.module");
const posts_module_1 = require("./posts/posts.module");
const bookings_module_1 = require("./bookings/bookings.module");
const payments_module_1 = require("./payments/payments.module");
const reviews_module_1 = require("./reviews/reviews.module");
const upload_module_1 = require("./upload/upload.module");
const mail_module_1 = require("./mail/mail.module");
const categories_module_1 = require("./categories/categories.module");
const taxonomy_module_1 = require("./taxonomy/taxonomy.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            supabase_module_1.SupabaseModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            cities_module_1.CitiesModule,
            hotels_module_1.HotelsModule,
            posts_module_1.PostsModule,
            categories_module_1.CategoriesModule,
            taxonomy_module_1.TaxonomyModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            reviews_module_1.ReviewsModule,
            upload_module_1.UploadModule,
            mail_module_1.MailModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map