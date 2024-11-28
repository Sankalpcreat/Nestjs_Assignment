import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS if needed
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("QR Code Management API")
    .setDescription("API documentation for the QR Code Management Platform")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter JWT token",
        in: "header",
      },
      "access-token", // This name should match the security name below
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "QR Code Management API Docs",
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
