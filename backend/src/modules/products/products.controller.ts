import * as express from 'express';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List products with advanced filtering and pagination',
  })
  findAll(@Query() filters: ProductFiltersDto) {
    return this.productsService.findAll(filters);
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending products' })
  getTrending(@Query('limit') limit?: number) {
    return this.productsService.getTrending(limit);
  }

  @Get('new-arrivals')
  @Public()
  @ApiOperation({ summary: 'Get new arrival products' })
  getNewArrivals(@Query('limit') limit?: number) {
    return this.productsService.getNewArrivals(limit);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured(@Query('limit') limit?: number) {
    return this.productsService.getFeatured(limit);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get product by slug with full details' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new product (Admin/Seller only)' })
  create(
    @Body() dto: CreateProductDto,
    @Request() req: express.Request & { user: { id: string; role: Role } },
  ) {
    return this.productsService.create(dto, req.user.id, req.user.role);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product (Admin/Seller only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: express.Request & { user: { id: string; role: Role } },
  ) {
    return this.productsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Archive product (Admin/Seller only)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
