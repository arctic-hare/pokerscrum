import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto, DeckType } from './dto/create-game.dto';
import { getDeckCards, isAverageEnabled } from './decks';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private prisma: PrismaService) {}

  async createGame(createGameDto: CreateGameDto) {
    try {
      // Валидация custom deck
      if (createGameDto.deckType === DeckType.CUSTOM) {
        if (!createGameDto.customDeck) {
          throw new BadRequestException('Custom deck is required when deckType is custom');
        }
        // Парсим и валидируем кастомную колоду
        const cards = createGameDto.customDeck.split(',').map((c) => c.trim());
        if (cards.length === 0) {
          throw new BadRequestException('Custom deck must contain at least one card');
        }
        // Проверяем, что все значения - числа
        for (const card of cards) {
          const num = parseInt(card, 10);
          if (isNaN(num) || num < 0) {
            throw new BadRequestException(
              `Invalid card value: "${card}". All cards must be positive numbers.`
            );
          }
        }
      }

      const game = await this.prisma.game.create({
        data: {
          name: createGameDto.name,
          status: 'waiting',
          deckType: createGameDto.deckType || DeckType.STANDARD,
          customDeck: createGameDto.customDeck || null,
        },
      });
      this.logger.log(`Game created with ID: ${game.id}`);
      return { gameId: game.id };
    } catch (error) {
      this.logger.error('Error in createGame:', error);
      throw error;
    }
  }

  async joinGame(gameId: string, nickname: string, sessionId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Проверяем, существует ли уже игрок с таким sessionId в этой игре
    const existingPlayer = await this.prisma.player.findUnique({
      where: {
        gameId_sessionId: {
          gameId,
          sessionId,
        },
      },
    });

    if (existingPlayer) {
      return { playerId: existingPlayer.id, gameId: existingPlayer.gameId };
    }

    // Создаем нового игрока
    const player = await this.prisma.player.create({
      data: {
        gameId,
        nickname,
        sessionId,
      },
    });

    return { playerId: player.id, gameId: player.gameId };
  }

  async getGame(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          select: {
            id: true,
            nickname: true,
            createdAt: true,
          },
        },
        votes: {
          include: {
            player: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Получаем доступные карты (id) для игры
    const deckCards = getDeckCards(game.deckType, game.customDeck);
    const availableCards = deckCards.map((c) => c.id);
    const numericValueById = new Map(
      deckCards
        .filter((c) => c.numericValue !== undefined)
        .map((c) => [c.id, c.numericValue!] as const)
    );

    // Всегда возвращаем все голоса (на фронтенде они будут фильтроваться по статусу)
    const votes = game.votes.map((vote) => ({
      playerId: vote.playerId,
      playerNickname: vote.player.nickname,
      value: vote.value,
    }));

    // Вычисляем средний балл (только для вскрытых карт)
    let averageScore: number | null = null;
    if (game.status === 'revealed') {
      if (isAverageEnabled(game.deckType)) {
        const numericVotes = votes
          .map((v) => (v.value === null ? null : (numericValueById.get(v.value) ?? null)))
          .filter((v): v is number => v !== null);
        if (numericVotes.length > 0) {
          const sum = numericVotes.reduce((acc, val) => acc + val, 0);
          averageScore = sum / numericVotes.length;
        }
      }
    }

    const result: any = {
      id: game.id,
      name: game.name,
      status: game.status,
      deckType: game.deckType,
      availableCards,
      players: game.players,
      votes,
      averageScore,
      progress: {
        total: game.players.length,
        voted: game.votes.filter((v) => v.value !== null).length,
      },
    };

    return result;
  }

  async vote(gameId: string, playerId: string, value: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status === 'revealed') {
      throw new Error('Cannot vote after reveal');
    }

    // Проверяем, что значение голоса допустимо для данной системы голосования
    const availableCards = getDeckCards(game.deckType, game.customDeck).map((c) => c.id);
    if (!availableCards.includes(value)) {
      throw new BadRequestException(
        `Vote value ${value} is not allowed. Available cards: ${availableCards.join(', ')}`
      );
    }

    // Обновляем или создаем голос
    const vote = await this.prisma.vote.upsert({
      where: {
        gameId_playerId: {
          gameId,
          playerId,
        },
      },
      update: {
        value,
      },
      create: {
        gameId,
        playerId,
        value,
      },
    });

    // Обновляем статус игры
    const votesCount = await this.prisma.vote.count({
      where: {
        gameId,
        value: { not: null },
      },
    });

    let newStatus = game.status;
    if (votesCount > 0 && game.status === 'waiting') {
      newStatus = 'voting';
    }

    if (newStatus !== game.status) {
      await this.prisma.game.update({
        where: { id: gameId },
        data: { status: newStatus },
      });
    }

    return vote;
  }

  async reveal(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status === 'revealed') {
      return game;
    }

    return this.prisma.game.update({
      where: { id: gameId },
      data: { status: 'revealed' },
    });
  }

  async resetRound(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Удаляем все голоса текущего раунда
    await this.prisma.vote.deleteMany({
      where: { gameId },
    });

    // Сбрасываем статус на waiting
    return this.prisma.game.update({
      where: { id: gameId },
      data: { status: 'waiting' },
    });
  }

  async getPlayerBySession(gameId: string, sessionId: string) {
    return this.prisma.player.findUnique({
      where: {
        gameId_sessionId: {
          gameId,
          sessionId,
        },
      },
    });
  }
}
