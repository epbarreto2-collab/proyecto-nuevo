
import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller.js';
import { PedidosService } from './pedidos.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
