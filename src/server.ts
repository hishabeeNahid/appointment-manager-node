import { Server } from 'http';
import { config } from './config';
import app from './app';
import { errorLogger, logger } from './shared/logger';

let server: Server;

// step 5: handle uncaught exceptions and shutdown the server gracefully
process.on('uncaughtException', err => {
  errorLogger.error(err);
  errorLogger.error('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

async function run_server() {
  try {
    // step 1: start the server
    server = app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });

    // step 2: connect to the database
    // db.connect(config.db_host, config.db_port);

    logger.info('Connected to  database');
  } catch (err) {
    errorLogger.error(
      `'Error connecting to database' err=>${JSON.stringify(err)}`
    );
    process.exit(1);
  }

  // step 3: handle unhandled promise rejections
  process.on('unhandledRejection', err => {
    errorLogger.error(err);
    errorLogger.error(
      'Shutting down the server due to Unhandled Promise rejection'
    );
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

// step 4: handle SIGTERM signal to gracefully shutdown the server
process.on('SIGTERM', () => {
  errorLogger.error('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      errorLogger.error('Process terminated');
    });
  }
});

run_server();
