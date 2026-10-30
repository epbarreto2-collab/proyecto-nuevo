import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.pedido.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async buscarPorId(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) {
      throw new NotFoundException('El pedido no existe');
    }

    return pedido;
  }

  async crear(data: {
    nombreCliente: string;
    productos: { productoId: number; cantidad: number }[];
  }) {
    if (
      typeof data?.nombreCliente !== 'string' ||
      !data.nombreCliente.trim()
    ) {
      throw new BadRequestException(
        'El nombre del cliente es obligatorio',
      );
    }

    if (
      !Array.isArray(data.productos) ||
      data.productos.length === 0
    ) {
      throw new BadRequestException(
        'El pedido debe incluir productos',
      );
    }

    for (const item of data.productos) {
      if (
        !item ||
        !Number.isInteger(item.productoId) ||
        !Number.isInteger(item.cantidad) ||
        item.productoId <= 0 ||
        item.cantidad <= 0
      ) {
        throw new BadRequestException(
          'Cada producto debe tener un ID válido y una cantidad mayor que cero',
        );
      }
    }

    const nombreCliente = data.nombreCliente.trim();
    const cantidades = new Map<number, number>();

    for (const item of data.productos) {
      cantidades.set(
        item.productoId,
        (cantidades.get(item.productoId) ?? 0) + item.cantidad,
      );
    }

    for (const cantidad of cantidades.values()) {
      if (!Number.isSafeInteger(cantidad)) {
        throw new BadRequestException(
          'La cantidad total del producto no es válida',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const pedidoSinRecibir = await tx.pedido.findFirst({
        where: {
          nombreCliente,
          estado: {
            in: ['PENDIENTE', 'ENVIADO'],
          },
        },
      });

      if (pedidoSinRecibir) {
        throw new BadRequestException(
          'El cliente ya tiene un pedido sin recibir',
        );
      }

      const productosPedido: {
        productoId: number;
        cantidad: number;
      }[] = [];

      for (const [productoId, cantidad] of cantidades) {
        const producto = await tx.producto.findUnique({
          where: { id: productoId },
        });

        if (!producto) {
          throw new NotFoundException(
            `No existe el producto con ID ${productoId}`,
          );
        }

        if (producto.stock < cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
          );
        }

        productosPedido.push({ productoId, cantidad });
      }

      for (const item of productosPedido) {
        const resultado = await tx.producto.updateMany({
          where: {
            id: item.productoId,
            stock: { gte: item.cantidad },
          },
          data: {
            stock: { decrement: item.cantidad },
          },
        });

        if (resultado.count !== 1) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${item.productoId}`,
          );
        }
      }

      const codigoVerificacion = randomInt(
        100000,
        1000000,
      ).toString();

      return tx.pedido.create({
        data: {
          nombreCliente,
          estado: 'PENDIENTE',
          codigoVerificacion,
          productos: productosPedido,
        },
      });
    });
  }

  async enviar(id: number) {
    const pedido = await this.buscarPorId(id);

    if (pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException(
        'Solo se pueden enviar pedidos pendientes',
      );
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: 'ENVIADO' },
    });
  }

  async recibir(id: number, codigo: string) {
    const pedido = await this.buscarPorId(id);

    if (pedido.estado !== 'ENVIADO') {
      throw new BadRequestException(
        'El pedido debe estar enviado antes de recibirse',
      );
    }

    if (pedido.codigoVerificacion !== codigo) {
      throw new BadRequestException(
        'Código de verificación incorrecto',
      );
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: 'RECIBIDO' },
    });
  }
}