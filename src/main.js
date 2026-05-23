import { config } from './config/index.js';
import { createApp } from './http/server.js';

const app = createApp();
app.listen(config.port, () => {
  console.log(`Markdown reader server running at http://localhost:${config.port}`);
});
