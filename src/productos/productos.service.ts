
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(data: {
    nombre: string;
    descripcion: string;
    stock: number;
  }) {
    if (
      typeof data?.nombre !== 'string' ||
      !data.nombre.trim()
    ) {
      throw new BadRequestException('El nombre es obligatorio');
    }

    if (
      typeof data?.descripcion !== 'string' ||
      !data.descripcion.trim()
    ) {
      throw new BadRequestException(
        'La descripción es obligatoria',
      );
    }

    if (!Number.isInteger(data.stock) || data.stock < 0) {
      throw new BadRequestException(
        'El stock debe ser un número entero mayor o igual a cero',
      );
    }

    return this.prisma.producto.create({
      data: {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion.trim(),
        stock: data.stock,
      },
    });
  }

  async listar() {
    return this.prisma.producto.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async buscarPorId(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      throw new NotFoundException('El producto no existe');
    }

    return producto;
  }
}
