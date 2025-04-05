import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerVendorDto } from './dto/create-customer-vendor.dto';
import { UpdateCustomerVendorDto } from './dto/update-customer-vendor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerVendorsService {
  constructor(private prismaService: PrismaService) {}

  async create(CreateCustomerVendorDto: CreateCustomerVendorDto) {
    return this.prismaService.customerVendor.create({
      data: CreateCustomerVendorDto,
    });
  }

  findAll() {
    return this.prismaService.customerVendor.findMany();
  }

  async findOne(id: number) {
    const customerVendor = await this.prismaService.customerVendor.findUnique({
      where: { id },
    });
    if (!customerVendor) {
      throw new NotFoundException(`CustomerVendor with id ${id} not found`);
    }
    return customerVendor;
  }

  async update(id: number, UpdateCustomerVendorDto: UpdateCustomerVendorDto) {
    try {
      return await this.prismaService.customerVendor.update({
        where: { id },
        data: UpdateCustomerVendorDto,
      });
    } catch {
      throw new NotFoundException(`CustomerVendor with id ${id} not found`);
    }
  }
  async remove(id: number) {
    try {
      return await this.prismaService.customerVendor.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`CustomerVendor with id ${id} not found`);
    }
  }
}
