import { config } from './config/index.js';
import { createApp } from './http/server.js';

const app = createApp();
app.listen(config.port, config.host, () => {
  console.log(`${config.name} v${config.version} listening on http://${config.host}:${config.port}`);
  console.log(`  prefix: ${config.apiPrefix}  ·  auth: ${config.apiKey ? 'ON (X-API-Key)' : 'OFF'}`);
  if (!config.apiKey) {
    console.warn('  ⚠️  API_KEY is empty — any local page can call this API. Set API_KEY to enable auth.');
  }
});
