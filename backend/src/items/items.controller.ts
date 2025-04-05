import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { User } from '@prisma/client';
import { Request } from 'express';
interface ItemRequest extends Request {
  payload: User;
}
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto, @Req() request: ItemRequest) {
    createItemDto.organizationId = request?.payload?.organizationId;
    return this.itemsService.create(createItemDto);
  }
  @Get()
  findAll(@Req() request: ItemRequest) {
    return this.itemsService.findAll(request.payload?.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: ItemRequest) {
    return this.itemsService.findOne(+id, request.payload?.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() request: ItemRequest,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    updateItemDto.organizationId = request?.payload?.organizationId;
    return this.itemsService.create(updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(+id);
  }
}
