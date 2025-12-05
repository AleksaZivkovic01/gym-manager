import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.findOne(id);
  }

  // Admin only: Get pending users
  @UseGuards(AuthGuard('jwt'))
  @Get('pending/approvals')
  getPendingUsers(@Req() req: AuthenticatedRequest): Promise<User[]> {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can view pending users');
    }
    return this.userService.findPending();
  }

  // Admin only: Approve user
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/approve')
  approveUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<User> {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can approve users');
    }
    return this.userService.approve(id);
  }

  // Admin only: Reject user
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/reject')
  rejectUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<User> {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can reject users');
    }
    return this.userService.reject(id);
  }

  @Post()
  create(@Body() user: Partial<User>): Promise<User> {
    return this.userService.create(user);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.userService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.delete(id);
  }
}
