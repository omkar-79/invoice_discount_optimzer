import app from './app';
import { config } from './config';
import prisma from './prisma.client';
import logger from './middleware/logger.middleware';

async function bootstrap() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Connected to database');

    // Start server
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await prisma.$disconnect();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during database disconnection:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
