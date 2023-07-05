import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as utils from 'openhim-mediator-utils';
import * as fs from 'fs';
import EventEmitter from 'events';
const configUrl = process.env.CONFIG;

const config = JSON.parse(
  fs.readFileSync(`${configUrl}/config.json`).toString(),
);

const himConfig = config.api;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
  fs.writeFileSync(
    'credentials.json',
    JSON.stringify({ access_token: null, expires_on: null }),
  );

  console.log('Listening on port', 3000);
}

function updateConfig(config) {
  fs.writeFileSync('him_config.json', JSON.stringify(config));
}

bootstrap().then(() => {
  utils.registerMediator(himConfig, config.mediator, (error) => {
    if (error) {
      console.error('Failed to register mediator', error);
    } else {
      console.log('Mediator registered successfully');
      const destConfig: EventEmitter = utils.activateHeartbeat({
        ...himConfig,
        urn: config.mediator.urn,
      });
      destConfig.on('config', (event) => {
        updateConfig(event);
      });
      utils.fetchConfig(
        {
          ...himConfig,
          urn: config.mediator.urn,
        },
        (error, fetchedConfig) => {
          updateConfig(fetchedConfig);
        },
      );
    }
  });
});
