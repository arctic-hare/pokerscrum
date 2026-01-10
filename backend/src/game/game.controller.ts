import { Controller, Post, Get, Body, Param, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GameService } from './game.service';
import { JoinGameDto } from './dto/join-game.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/game')
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(private readonly gameService: GameService) {}

  @Post('create')
  async createGame(@Body() createGameDto: CreateGameDto, @Res() res: Response) {
    try {
      const result = await this.gameService.createGame(createGameDto);
      return res.json(result);
    } catch (error) {
      this.logger.error('Error creating game:', error);
      return res.status(500).json({
        error: 'Failed to create game',
        message: error.message || 'Internal server error',
      });
    }
  }

  @Post('join')
  async joinGame(@Body() joinGameDto: JoinGameDto, @Req() req: Request, @Res() res: Response) {
    // Получаем или создаем sessionId из cookie
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    const result = await this.gameService.joinGame(
      joinGameDto.gameId,
      joinGameDto.nickname,
      sessionId
    );

    return res.json(result);
  }

  @Get(':id')
  async getGame(@Param('id') id: string) {
    return this.gameService.getGame(id);
  }

  @Get(':id/current-player')
  async getCurrentPlayer(@Param('id') id: string, @Req() req: Request) {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return { player: null };
    }
    const player = await this.gameService.getPlayerBySession(id, sessionId);
    return { player };
  }
}
