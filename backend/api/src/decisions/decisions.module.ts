import { Module } from '@nestjs/common';
import { DecisionsController } from './decisions.controller';
import { DecisionsService } from './decisions.service';
import { PrismaService } from '../prisma.service';
import { RatesModule } from '../rates/rates.module';

@Module({
  imports: [RatesModule],
  controllers: [DecisionsController],
  providers: [DecisionsService, PrismaService],
})
export class DecisionsModule {}
