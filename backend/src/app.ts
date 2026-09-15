import express from 'express';
import core from 'cors';
import caseStudyRoutes from './routes/case-study.routes';
import authRoutes from './routes/auth.routes';
import testimonialRoutes from './routes/testimonial.routes';

const app = express();

app.use(core());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/testimonials', testimonialRoutes);

export default app;
