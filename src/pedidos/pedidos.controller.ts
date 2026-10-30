
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  crear(
    @Body()
    data: {
      nombreCliente: string;
      productos: { productoId: number; cantidad: number }[];
    },
  ) {
    return this.pedidosService.crear(data);
  }

  @Get()
  listar() {
    return this.pedidosService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.buscarPorId(id);
  }

  @Patch(':id/enviar')
  enviar(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.enviar(id);
  }

  @Patch(':id/recibir')
  recibir(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { codigoVerificacion: string },
  ) {
    return this.pedidosService.recibir(id, data.codigoVerificacion);
  }
}
