# QR Code Management and Analytics Platform

# Project Overview

This project is a comprehensive QR Code Management and Analytics Platform built with NestJS, designed to generate both static and dynamic QR codes. It provides functionalities for:
 • User Authentication: Secure registration and login using JWT.
 • QR Code Generation:
 • Static QR Codes: Encode a fixed URL.
 • Dynamic QR Codes: Redirect to a URL that can be updated after creation.
 • Event Tracking: Track scans of QR codes, capturing data such as location, device type, user agent, and IP address.
 • Analytics:
 • View total scans, unique users, scans over time, geographic distribution, and device statistics.
 • AI Integration:
 • Anomaly Detection: Identify suspicious or anomalous scan patterns.
 • Summary Reports: Generate natural language summaries of analytics data using OpenAI’s GPT models.
 • Security and Scalability:
 • Implemented rate limiting to prevent abuse.
 • Optimized database performance with indexing.
 • Environment variables managed securely.
 • Prepared for high traffic with caching and horizontal scaling considerations.

  # Table of Contents

 • Project Overview
 • Features
 • Architecture
 • Setup Instructions
 • Prerequisites
 • Installation
 • Environment Variables
 • Database Setup
 • Running the Application
 • Testing
 • Dependencies
 • Scripts
 • API Documentation
 • Contributing
 • License

  # Features

 • User Authentication and Authorization
 • Secure user registration and login with JWT tokens.
 • Role-based access control (if applicable).
 • QR Code Management
 • Generate static and dynamic QR codes.
 • Update dynamic QR codes to redirect to new URLs.
 • Retrieve a list of user’s QR codes.
 • Event Tracking
 • Track scans of QR codes.
 • Store event data: timestamp, location, device type, user agent, and IP address.
 • Analytics and Reporting
 • View comprehensive analytics for each QR code.
 • AI-powered anomaly detection to identify suspicious activities.
 • Generate natural language summary reports using OpenAI’s GPT models.
 • Security and Scalability
 • Rate limiting to protect against DDoS attacks and abuse.
 • Secure password storage with bcrypt.
 • Database indexing for optimized performance.
 • Environment variable management with @nestjs/config.
 • Caching with Redis for high performance.

 # Architecture

The application follows a modular architecture provided by NestJS, promoting scalability and maintainability. Key modules include:
 • AuthModule: Handles user authentication and authorization.
 • UsersModule: Manages user data.
 • QrModule: Responsible for QR code generation and management.
 • EventModule: Tracks QR code scan events.
 • AnalyticsModule: Provides analytics data and AI integrations.

# Setup Instructions

Prerequisites

Ensure you have the following installed on your machine:
 • Node.js: Version 14.x or higher
 • npm: Version 6.x or higher
 • MySQL: Version 5.7 or higher
 • Redis: For caching and queuing
 • Git: Version control system

# Installation

 1. Clone the Repository
git clone <https://github.com/Sankalpcreat/Nestjs_Assignment.git>
cd Nestjs_Assignment

 2. Install Dependencies
  npm install

  Environment Variables

  Create a .env file in the root directory of the project and add the following environment variables:

# Application

NODE_ENV=development
PORT=3000

# Database

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s

# Redis

REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI API Key

OPENAI_API_KEY=your_openai_api_key

# Rate Limiting (optional)

THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Running the Application

Start the NestJS application:
npm run start:dev

Testing

Unit Tests

Run unit tests:
npm run test

End-to-End (E2E) Tests

Run integration tests:
npm run test:e2e

# Dependencies

Key dependencies used in this project:
 • NestJS Framework: @nestjs/core, @nestjs/common, @nestjs/typeorm
 • Authentication: @nestjs/passport, passport, passport-jwt, bcrypt
 • Database: typeorm, mysql2
 • Validation: class-validator, class-transformer
 • Caching and Queuing: @nestjs/bull, bull, redis, cache-manager
 • QR Code Generation: qrcode
 • OpenAI Integration: openai
 • Statistics: simple-statistics
 • Rate Limiting: @nestjs/throttler
 • API Documentation: @nestjs/swagger, swagger-ui-express

# API Documentation

The application uses Swagger for API documentation, which can be accessed at:
<http://localhost:3000/api>
nsuring Comprehensive Swagger Documentation

To ensure that the Swagger documentation is comprehensive:
 • Use Decorators
 • Apply @ApiTags, @ApiOperation, @ApiResponse, and @ApiBearerAuth decorators to your controllers and methods.
  @ApiTags('QR Codes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {

}
Document DTOs
 • Use @ApiProperty and related decorators to document your Data Transfer Objects (DTOs).
  export class CreateStaticQrDto {
  @ApiProperty({ description: 'URL to encode in the QR code' })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
