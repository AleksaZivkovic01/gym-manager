import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RatingService } from './rating.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { Rating } from './rating.entity';
import { User } from '../user/user.entity';

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

  @UseGuards(AuthGuard('jwt'))
  @Get('my-rating')
  async getMyRating(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<Rating | null> {
    if (req.user.role !== 'member' || !req.user.member?.id) {
      throw new Error('User is not a member');
    }
    return this.ratingService.getRatingByMemberAndTrainer(req.user.member.id, trainerId);
  }

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  updateRating(
    @Param('id', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ): Promise<Rating> {
    return this.ratingService.update(ratingId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteRating(@Param('id', ParseIntPipe) ratingId: number): Promise<void> {
    return this.ratingService.delete(ratingId);
  }
}

