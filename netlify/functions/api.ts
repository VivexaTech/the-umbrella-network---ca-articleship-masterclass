import serverless from 'serverless-http';
import { app } from '../../server.js';

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Normalize the path so Express routes matching /api/* work seamlessly
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api');
  }
  return serverlessHandler(event, context);
};
