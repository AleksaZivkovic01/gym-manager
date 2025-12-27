import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RatingService } from './rating.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { Rating } from './rating.entity';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('trainers/:trainerId/ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get()
  getRatings(@Param('trainerId', ParseIntPipe) trainerId: number): Promise<Rating[]> {
    return this.ratingService.findByTrainer(trainerId);
  }

  @Get('average')
  getAverageRating(@Param('trainerId', ParseIntPipe) trainerId: number): Promise<number> {
    return this.ratingService.getAverageRating(trainerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Get('my-rating')
  async getMyRating(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<Rating | null> {
    if (!req.user.member?.id) {
      throw new ForbiddenException('User is not a member');
    }

    return this.ratingService.getRatingByMemberAndTrainer(req.user.member.id,trainerId);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Post()
  createRating(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Body() dto: CreateRatingDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Rating> {
    // Use member ID from authenticated user if not provided
    if (!dto.memberId && req.user.role === 'member' && req.user.member?.id) {
      dto.memberId = req.user.member.id;
    }
    return this.ratingService.create(trainerId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Put(':id')
  updateRating(
    @Param('id', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ): Promise<Rating> {
    return this.ratingService.update(ratingId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteRating(@Param('id', ParseIntPipe) ratingId: number): Promise<void> {
    return this.ratingService.delete(ratingId);
  }
}

