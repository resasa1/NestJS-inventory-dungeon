import { PartialType } from '@nestjs/mapped-types';
import { CreateLogDto } from './create-invent-log.dto';

export class UpdateInventLogDto extends PartialType(CreateLogDto) {}
