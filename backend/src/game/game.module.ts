import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { WebSocketGateway } from './websocket.gateway';

@Module({
  controllers: [GameController],
  providers: [GameService, WebSocketGateway],
  exports: [GameService],
})
export class GameModule {}
