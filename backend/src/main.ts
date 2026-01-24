import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { WebSocketGateway } from './game/websocket.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser
  app.use(cookieParser());

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'planning-poker-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // CORS configuration - поддержка нескольких origins
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3001'];

  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, мобильные приложения, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: Origin ${origin} not allowed. Allowed origins:`, allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  const httpServer = await app.listen(port);
  console.log(`Backend is running on http://localhost:${port}`);

  // Инициализация WebSocket сервера
  const wsGateway = app.get(WebSocketGateway);
  wsGateway.initialize(httpServer);
}

bootstrap();
