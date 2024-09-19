import { Controller, Get, Param, Post, Body, UseGuards, Request, ParseIntPipe, Patch, Delete, Put, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('follow/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async followUser(@Request() req, @Param('id') id: number) {
    return this.userService.followUser(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserMe(@Request() req) {
    return this.userService.getUserDetails(req.user.userId);
  }

  @Get(':id')
  async getUserDetails(@Param('id') id: number) {
    return this.userService.getUserDetails(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.userId, id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUser(req.user.userId, id);
    return { message: 'User deleted successfully' };
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

}
