import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    const { itemIds, ...purchaseData } = createPurchaseDto;

    return this.prismaService.$transaction(async () => {
      const purchase = await this.prismaService.purchase.create({
        data: purchaseData,
      });

      if (itemIds && itemIds.length > 0) {
        await this.prismaService.itemPurchase.createMany({
          data: itemIds.map((itemId) => ({
            purchaseId: purchase.id,
            itemId,
          })),
        });
      }
      return purchase;
    });
  }

  async findAll() {
    return this.prismaService.purchase.findMany({
      include: {
        vendor: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const purchase = await this.prismaService.purchase.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }
    return purchase;
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    const { itemIds, ...purchaseData } = updatePurchaseDto;
    try {
      return await this.prismaService.$transaction(async () => {
        const purchase = await this.prismaService.purchase.update({
          where: { id },
          data: purchaseData,
        });
        if (!purchase) {
          await this.prismaService.itemPurchase.deleteMany({
            where: { purchaseId: id },
          });
        }

        if (itemIds.length > 0) {
          await this.prismaService.itemPurchase.createMany({
            data: itemIds.map((itemId) => ({
              purchaseId: purchase.id,
              itemId,
            })),
          });
        }
        return purchase;
      });
    } catch {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.purchase.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }
  }
}
