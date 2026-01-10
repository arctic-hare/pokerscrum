import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server as HttpServer } from 'http';
import { Server as WSServer, WebSocket } from 'ws';
import { GameService } from './game.service';
import { v4 as uuidv4 } from 'uuid';
import * as cookie from 'cookie';

interface GameWebSocket extends WebSocket {
  gameId?: string;
  sessionId?: string;
  playerId?: string;
}

@Injectable()
export class WebSocketGateway implements OnModuleInit, OnModuleDestroy {
  private wss: WSServer | null = null;
  private clients: Map<string, GameWebSocket> = new Map();

  constructor(private gameService: GameService) {}

  onModuleInit() {
    // WebSocket сервер будет запущен отдельно через main.ts
  }

  onModuleDestroy() {
    this.close();
  }

  initialize(httpServer: HttpServer) {
    this.wss = new WSServer({
      server: httpServer,
      path: '/ws',
    });

    this.wss.on('connection', (ws: GameWebSocket, req) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);

      // Получаем sessionId из cookies
      const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
      ws.sessionId = cookies.sessionId;

      console.log(`WebSocket client connected: ${clientId}, sessionId: ${ws.sessionId || 'none'}`);

      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: error.message,
            })
          );
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });
    });

    const address = httpServer.address();
    const port = typeof address === 'string' ? address : address?.port || 3000;
    console.log(`WebSocket server is running on ws://localhost:${port}/ws`);
  }

  private async handleMessage(ws: GameWebSocket, message: any) {
    switch (message.type) {
      case 'JOIN_GAME':
        await this.handleJoinGame(ws, message);
        break;
      case 'VOTE':
        await this.handleVote(ws, message);
        break;
      case 'REVEAL':
        await this.handleReveal(ws);
        break;
      case 'RESET':
        await this.handleReset(ws);
        break;
      default:
        ws.send(
          JSON.stringify({
            type: 'ERROR',
            message: 'Unknown message type',
          })
        );
    }
  }

  private async handleJoinGame(ws: GameWebSocket, message: any) {
    try {
      if (!ws.sessionId) {
        throw new Error('Session ID not found in cookies');
      }

      ws.gameId = message.gameId;

      // Определяем игрока по sessionId
      const player = await this.gameService.getPlayerBySession(message.gameId, ws.sessionId);

      if (!player) {
        throw new Error('Player not found. Please join the game first via HTTP API.');
      }

      ws.playerId = player.id;

      await this.broadcastGameUpdate(message.gameId);
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          message: error.message,
        })
      );
    }
  }

  private async handleVote(ws: GameWebSocket, message: any) {
    try {
      if (!ws.gameId || !ws.playerId) {
        throw new Error('Not joined to game');
      }

      // Клиенты/кеши могут прислать number — Prisma ожидает string
      const value =
        message?.value === null || message?.value === undefined ? '' : String(message.value);
      await this.gameService.vote(ws.gameId, ws.playerId, value);
      await this.broadcastGameUpdate(ws.gameId);
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          message: error.message,
        })
      );
    }
  }

  private async handleReveal(ws: GameWebSocket) {
    try {
      if (!ws.gameId) {
        throw new Error('Not joined to game');
      }

      await this.gameService.reveal(ws.gameId);
      await this.broadcastGameUpdate(ws.gameId);
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          message: error.message,
        })
      );
    }
  }

  private async handleReset(ws: GameWebSocket) {
    try {
      if (!ws.gameId) {
        throw new Error('Not joined to game');
      }

      await this.gameService.resetRound(ws.gameId);
      await this.broadcastGameUpdate(ws.gameId);
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          message: error.message,
        })
      );
    }
  }

  private async broadcastGameUpdate(gameId: string) {
    if (!gameId) return;

    const gameState = await this.gameService.getGame(gameId);
    const message = JSON.stringify({
      type: 'GAME_UPDATE',
      game: gameState,
    });

    this.clients.forEach((client) => {
      if (client.gameId === gameId && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private handleDisconnect(ws: GameWebSocket) {
    for (const [clientId, client] of this.clients.entries()) {
      if (client === ws) {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
        if (ws.gameId) {
          this.broadcastGameUpdate(ws.gameId);
        }
        break;
      }
    }
  }

  private close() {
    if (this.wss) {
      this.clients.forEach((client) => {
        client.close();
      });
      this.clients.clear();
      this.wss.close();
      this.wss = null;
    }
  }
}
