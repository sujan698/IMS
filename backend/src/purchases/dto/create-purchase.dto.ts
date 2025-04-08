import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreatePurchaseDto {
  @IsNotEmpty()
  @IsDateString()
  orderDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  vendorId: number;

  @IsNumber()
  @IsOptional()
  subTotal?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsOptional()
  beforeTax?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsArray()
  @IsNotEmpty()
  itemIds: number[];
}
