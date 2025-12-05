import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { User } from '../user/user.entity';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  getAll() {
    return this.memberService.findAll();
  }

  // Get current user's member data - MUST be before @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyMember(@Req() req: AuthenticatedRequest) {
    return this.memberService.findByUserId(req.user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.memberService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.memberService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateMemberDto) {
    return this.memberService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.memberService.delete(id);
  }
}
