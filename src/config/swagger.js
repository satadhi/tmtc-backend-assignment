const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TMTC Travel Itinerary API',
      version: '1.0.0',
      description: 'REST API for managing travel itineraries with auth, caching, and sharing',
    },
    servers: [{ url: process.env.SWAGGER_SERVER || 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // reads JSDoc comments in route files
};

const swaggerSpec = swaggerJsDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger docs available at /api/docs');
}

module.exports = setupSwagger;
