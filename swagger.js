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
                    url: "http://localhost:3000"
                },
                {
                    url: "https://proppay-back.vercel.app"
                }
            ],
            components: {
                schemas: {
                    Propriety: {
                        type: 'object',
                        required: ['landlordNumber','landlordFirstname','landlordLastname'],
                        proprieties: {
                            landlordNumber: {
                                type: 'string',
                                unique: true,
                            },
                            landlordFirstname: {
                                type: 'string',
                            },
                            landlordLastname: {
                                type: 'string',
                            },
                            landlordAdress: {
                                type: 'string'
                            },
                            profilImage: {
                                type: 'string'
                            },
                            landlordPassword: {
                                type: 'string'
                            },
                            identity: {
                                type: 'string'
                            },
                            listOfTenants: {
                                type: [Map],
                                default: []
                            },
                            listOfProprieties: {
                                type: [String],
                                default: []
                            }
                        }
                    }
                }
            }
        },
        apis: ['**/*.js'], // Chemin vers les fichiers contenant les commentaires Swagger
    };
    
    const specs = swaggerJSDoc(options);
    
    app.use('/api-docs', serve, setup(specs));
}

