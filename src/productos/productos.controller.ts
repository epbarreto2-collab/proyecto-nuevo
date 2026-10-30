
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ProductosService } from './productos.service.js';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  crear(
    @Body()
    data: {
      nombre: string;
      descripcion: string;
      stock: number;
    },
  ) {
    return this.productosService.crear(data);
  }

  @Get()
  listar() {
    return this.productosService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.buscarPorId(id);
  }
}
