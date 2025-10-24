import { PartialType } from '@nestjs/mapped-types';
import { CreateInventLogDto } from './create-invent-log.dto';

export class UpdateInventLogDto extends PartialType(CreateInventLogDto) {}
