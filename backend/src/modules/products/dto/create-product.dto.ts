import { IsString, IsNumber, IsOptional, IsArray, IsNotEmpty, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class VariantDto {
  @ApiPropertyOptional() @IsOptional() @IsString() sku?: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() size?: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) salePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) stock?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() images?: string[];
}

export class CreateProductDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortDesc?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sku?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() barcode?: string;
  @ApiProperty() @IsString() categoryId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brandId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sellerId?: string;
  @ApiProperty() @IsNumber() @Min(0) basePrice: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) salePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() images?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() material?: string;
  @ApiPropertyOptional() @IsOptional() attributes?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) stock?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDesc?: string;
  @ApiPropertyOptional() @IsOptional() @ValidateNested({ each: true }) @Type(() => VariantDto) variants?: VariantDto[];
}
