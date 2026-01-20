import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','trainer')
  @Get()
  getAll() {
    return this.memberService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyMember(@Req() req: AuthenticatedRequest) {
    return this.memberService.findByUserId(req.user.id);
  }

  
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMyMember(@Req() req: AuthenticatedRequest, @Body() dto: UpdateMemberDto) {
    const member = await this.memberService.findByUserId(req.user.id);
    if (!member) {
      throw new NotFoundException('Member profile not found');
    }
    return this.memberService.update(member.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','trainer')
  @Get(':id')
  async getOne(@Param('id') id: string) {
    try {
      const memberId = parseInt(id, 10);
      if (isNaN(memberId)) {
        throw new NotFoundException('Invalid member ID');
      }
      const member = await this.memberService.findOne(memberId);
      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }
      return member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error in getOne for member ID ${id}:`, error);
      throw new NotFoundException(`Error loading member with ID ${id}`);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.memberService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    try {
      const memberId = parseInt(id, 10);
      if (isNaN(memberId)) {
        throw new NotFoundException('Invalid member ID');
      }
      return await this.memberService.update(memberId, dto);
    } catch (error) {
      console.error(`Error in update for member ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') 
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const memberId = parseInt(id, 10);
      if (isNaN(memberId)) {
        throw new NotFoundException('Invalid member ID');
      }
      await this.memberService.delete(memberId);
      return { message: 'Member successfully deleted' };
    } catch (error) {
      console.error(`Error in delete for member ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('pending/packages')
  getPendingPackageRequests() {
    return this.memberService.findPendingPackageRequests();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/approve-package')
  async approvePackage(@Param('id') id: string) {
    try {
      const memberId = parseInt(id, 10);
      if (isNaN(memberId)) {
        throw new NotFoundException('Invalid member ID');
      }
      return await this.memberService.approvePackage(memberId);
    } catch (error) {
      console.error(`Error approving package for member ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/reject-package')
  async rejectPackage(@Param('id') id: string) {
    try {
      const memberId = parseInt(id, 10);
      if (isNaN(memberId)) {
        throw new NotFoundException('Invalid member ID');
      }
      return await this.memberService.rejectPackage(memberId);
    } catch (error) {
      console.error(`Error rejecting package for member ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}
