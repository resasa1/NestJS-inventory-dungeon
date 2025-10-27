import { 
  Controller, Get, Post, Body, 
  Patch, Param, Delete, ParseIntPipe, Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../pagination.dto';

@Controller('users') // Ini berarti base URL-nya adalah /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post() // POST /users
  create(@Body() createUserDto: CreateUserDto) {
    // DTO akan divalidasi otomatis oleh ValidationPipe
    return this.usersService.create(createUserDto);
  }

  @Get() // GET /users
  findAll(@Query() paginationDto: PaginationDto) {
    // DTO akan divalidasi oleh ValidationPipe
    // dan nilai default akan otomatis terisi
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id') // GET /users/1
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe otomatis mengubah string "1" menjadi number 1
    return this.usersService.findOne(id);
  }

  @Patch(':id') // PATCH /users/1
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id') // DELETE /users/1
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

// import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { PaginationDto } from '../pagination.dto';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post()
//   create(@Body() createUserDto: CreateUserDto) {
//     return this.usersService.create(createUserDto);
//   }

//   @Get() // GET /users
//   findAll(@Query() paginationDto: PaginationDto) {
//     // DTO akan divalidasi oleh ValidationPipe
//     // dan nilai default akan otomatis terisi
//     return this.usersService.findAll(paginationDto);
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.usersService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
//     return this.usersService.update(+id, updateUserDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(+id);
//   }
// }
