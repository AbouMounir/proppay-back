import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";


// Configuration Swagger
export const initSwagger = () => {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Propay API Documentation',
                version: '1.0.0',
                description: 'Documentation for your API'
            },
            servers: [
                {
                    url: "http://localhost:4000"
                }
            ]
        },
        apis: ['**/*.js'], // Chemin vers les fichiers contenant les commentaires Swagger
    };
    
    const specs = swaggerJSDoc(options);
    
    app.use('/api-docs', serve, setup(specs));
}

