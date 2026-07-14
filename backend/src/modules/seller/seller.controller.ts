import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SellerService } from './seller.service';

@ApiTags('Seller')
@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}
}
