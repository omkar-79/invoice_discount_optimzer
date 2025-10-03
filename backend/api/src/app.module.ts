import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { RatesModule } from './rates/rates.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DecisionsModule } from './decisions/decisions.module';
import { ChatModule } from './chat/chat.module';
import { SettingsModule } from './settings/settings.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    AuthModule,
    RatesModule,
    InvoicesModule,
    DecisionsModule,
    ChatModule,
    SettingsModule,
    AnalyticsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
