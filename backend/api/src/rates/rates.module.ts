import { Module } from '@nestjs/common';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { PrismaService } from '../prisma.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [RatesController],
  providers: [RatesService, PrismaService],
  exports: [RatesService],
})
export class RatesModule {}
