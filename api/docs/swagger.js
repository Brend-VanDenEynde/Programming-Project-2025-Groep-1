const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const openAPIDocs = YAML.load('./docs/openapi.yaml');

const swaggerDocs = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openAPIDocs));
  console.log(`📚  Swagger docs available at http://localhost:3001/docs`);
};

module.exports = swaggerDocs;