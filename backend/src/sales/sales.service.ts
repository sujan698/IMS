import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prismaService: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const { itemIds, ...saleData } = createSaleDto;
    return this.prismaService.$transaction(async (prismaService) => {
      const sale = await this.prismaService.sale.create({
        data: saleData,
      });
      if (itemIds && itemIds.length > 0) {
        await prismaService.itemSale.createMany({
          data: itemIds.map((itemId) => ({
            saleId: sale.id,
            itemId,
          })),
        });
      }
      return sale;
    });
  }

  async findAll() {
    return this.prismaService.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const sale = await this.prismaService.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
    if (!sale) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const { itemIds, ...saleData } = updateSaleDto;
    try {
      return await this.prismaService.$transaction(async () => {
        //update the sale with the provided data
        const sale = await this.prismaService.sale.update({
          where: { id },
          data: saleData,
        });
        //if itemIds are provided , update the item-sale relationship
        if (itemIds) {
          //delete existing item-sale relationships for the sale
          await this.prismaService.itemSale.deleteMany({
            where: { saleId: id },
          });
          //create new item-sale relationships for the sale
          if (itemIds.length > 0) {
            await this.prismaService.itemSale.createMany({
              data: itemIds.map((itemId) => ({
                saleId: id,
                itemId,
              })),
            });
          }
        }
        return sale;
      });
    } catch {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.sale.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }
  }
}
