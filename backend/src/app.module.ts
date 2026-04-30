import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CitiesModule } from './cities/cities.module';
import { HotelsModule } from './hotels/hotels.module';
import { PostsModule } from './posts/posts.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewsModule } from './reviews/reviews.module';
import { MailModule } from './mail/mail.module';
import { CategoriesModule } from './categories/categories.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CitiesModule,
    HotelsModule,
    PostsModule,
    CategoriesModule,
    TaxonomyModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    UploadModule,
    MailModule,
  ],
})
export class AppModule {}
