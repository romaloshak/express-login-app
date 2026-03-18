import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import profileRoutes from './src/routes/profile.routes.js';
import userRoutes from './src/routes/user.routes.js';

const port = process.env.POSTGRES_PORT || 8000;

const app: Express = express();
app.use(express.json());
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/profile', profileRoutes);
app.use('/', authRoutes);

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

export default app;
