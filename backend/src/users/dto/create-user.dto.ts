import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsNumber()
  roleId: number;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsNumber()
  organizationId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  mobile: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
