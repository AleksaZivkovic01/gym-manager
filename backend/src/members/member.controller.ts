import {Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  getAll() {
    return this.memberService.findAll();
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
