import { PartialType } from '@nestjs/swagger';
import { CreatePromoDto } from './create-promo.dto';

export class UpdatePromoDto extends PartialType(CreatePromoDto) {}
