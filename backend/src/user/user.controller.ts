import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.findOne(id);
  }

  // Admin 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('pending/approvals')
  getPendingUsers(): Promise<User[]> {
    return this.userService.findPending();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/approve')
  approveUser(@Param('id', ParseIntPipe) id: number,): Promise<User> {
    return this.userService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/reject')
  rejectUser(@Param('id', ParseIntPipe) id: number, ): Promise<User> {
    return this.userService.reject(id);
  }

  @Post()
  create(@Body() user: Partial<User>): Promise<User> {
    return this.userService.create(user);
  }

  // Update 
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const updated = await this.userService.updateCurrentUser(req.user.id, dto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.userService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.delete(id);
  }
}
