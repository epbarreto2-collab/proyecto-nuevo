import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller.js';
import { ProductosService } from './productos.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports: [PrismaModule],
})
export class ProductosModule {}
