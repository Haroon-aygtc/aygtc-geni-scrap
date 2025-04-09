import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Backend API is running' });
});

// TODO: Import and use API routes here
import userRoutes from './routes/userRoutes.js';
import userActivityRoutes from './routes/userActivityRoutes.js';
import promptTemplateRoutes from './routes/promptTemplateRoutes.js';
import aiCacheRoutes from './routes/aiCacheRoutes.js';
import authRoutes from './routes/authRoutes.js';
import followUpConfigRoutes from './routes/followUpConfigRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import widgetRoutes from './routes/widgetRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes.js';
import moderationRuleRoutes from './routes/moderationRuleRoutes.js';
import scrapingRoutes from './routes/scrapingRoutes.js';
import analyticsLogRoutes from './routes/analyticsLogRoutes.js';
import monitoringLogRoutes from './routes/monitoringLogRoutes.js';

app.use('/api/users', userRoutes);
app.use('/api/user-activities', userActivityRoutes);
app.use('/api/prompt-templates', promptTemplateRoutes);
app.use('/api/ai-cache', aiCacheRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/follow-up-configs', followUpConfigRoutes);
app.use('/api/chat-sessions', chatRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/moderation-rules', moderationRuleRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/analytics-logs', analyticsLogRoutes);
app.use('/api/monitoring-logs', monitoringLogRoutes);

export default app;
