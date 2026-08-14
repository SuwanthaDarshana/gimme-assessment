import 'dotenv/config';
import { createApp } from './src/app.js';

const PORT = process.env.PORT || 4000;
createApp().listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));