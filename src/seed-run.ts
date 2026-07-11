import 'dotenv/config';
import { seedDatabase } from './seed';

seedDatabase()
  .then(() => { console.log('Seed completed'); process.exit(0); })
  .catch((err) => { console.error('Seed failed:', err); process.exit(1); });
