import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerInventoryDto } from './create-player-inventory.dto';

export class UpdatePlayerInventoryDto extends PartialType(CreatePlayerInventoryDto) {}
