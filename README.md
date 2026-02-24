# MyMarket

A modern full-stack marketplace platform built with Next.js, tRPC, Drizzle ORM, and Tailwind CSS. MyMarket enables users to create, discover, and purchase products while communicating with sellers through an integrated chat system.

## Features

### 🛍️ Product Management
- **Browse Products**: Explore products by category and subcategory
- **Create Listings**: Users can upload products with images, descriptions, and prices
- **Product Search**: Full-text search with filtering by category and subcategory
- **Product Details**: View detailed product information, similar products, and seller details
- **Edit/Delete Products**: Manage your own product listings with ease
- **Image Carousel**: Beautiful image galleries for products using Swiper

### 🔐 Authentication
- **Dual Authentication System**: 
  - NextAuth with OAuth providers (social login)
  - JWT-based authentication for email/password registration
- **Email Confirmation**: Verification system with 6-digit confirmation codes
- **Password Reset**: Secure forgot password flow with email verification
- **Protected Routes**: Middleware-based route protection for authenticated pages

### 💬 Real-time Messaging
- **Chat System**: Socket.io-powered real-time messaging between buyers and sellers
- **Conversation Management**: View conversation history and organize chats
- **Recent Searches**: Track previous conversations for quick access
- **Delete Messages**: Remove chat messages when needed

### 🛒 Shopping Cart
- **Add to Cart**: Simple cart management with toggle buttons
- **Cart Persistence**: Persistent shopping cart across sessions
- **Cart Management**: Easy add/remove functionality

### 👤 User Profiles
- **User Settings**: Customize profile information
- **My Products**: View all products created by the user
- **Profile Display**: Public user profiles to view seller information

### 📱 Responsive Design
- **Mobile Optimized**: Fully responsive design with mobile-first approach
- **Navigation**: Sidebar and navbar with mobile modal support
- **Dynamic Layouts**: Adaptive layouts for different screen sizes

## Tech Stack

### Backend
- **Framework**: Next.js 14+ with App Router
- **API**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js + JWT
- **Real-time**: Socket.io for live messaging
- **Email**: Nodemailer for email notifications
- **File Upload**: UploadThing for image management
- **Validation**: Zod for schema validation

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom PostCSS
- **Components**: Shadcn UI for accessible component library
- **Carousel**: Swiper for image galleries
- **HTTP Client**: TanStack React Query for data fetching
- **Utilities**: Lucide icons, bcryptjs for password hashing

### DevOps & Deployment
- **Hosting**: Vercel (Frontend), Railway (Socket.io Server)
- **Database**: Hosted PostgreSQL
- **Environment**: Configuration via .env.local

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- PostgreSQL database
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mymarket
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mymarket_db

# JWT Authentication
JWT_SECRET=your-secret-key-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth Providers (if using)
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# File Upload (UploadThing)
UPLOADTHING_SECRET=your-uploadthing-secret
NEXT_PUBLIC_UPLOADTHING_APP_ID=your-app-id

# Socket.io Server
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001

# Other configurations
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Set up the database**
```bash
# Run migrations
npm run db:push

# (Optional) Run Prisma Studio to view data
npm run db:studio
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Database Migrations

Create a new migration after schema changes:
```bash
npm run db:generate
```

View and manage migrations:
```bash
npm run db:push     # Apply pending migrations
npm run db:studio   # Open Prisma Studio UI
```

## Project Structure

```
mymarket/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes (auth, upload, etc.)
│   │   ├── cart/         # Shopping cart page
│   │   ├── chat/         # Chat messaging page
│   │   ├── products/     # Product detail pages
│   │   ├── settings/     # User settings page
│   │   └── ...
│   ├── components/       # React components
│   │   ├── Cart/         # Shopping cart components
│   │   ├── Chat/         # Chat system components
│   │   ├── Product/      # Product components
│   │   ├── ui/           # Shadcn UI components
│   │   └── ...
│   ├── server/           # Backend logic
│   │   ├── api/          # tRPC routers
│   │   ├── db/           # Database schema and setup
│   │   ├── auth/         # Authentication logic
│   │   └── socket.ts     # Socket.io configuration
│   ├── trpc/             # tRPC configuration
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global CSS styles
│   └── middleware.ts     # Next.js middleware for route protection
├── drizzle/              # Database migrations
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## Authentication Flow

### JWT Authentication (Email/Password)
1. User registers with email and password
2. System sends confirmation code to email
3. User confirms email with code
4. JWT token is issued for login
5. Token can be sent via Authorization header or cookie
6. Requests include token for authentication

### OAuth Authentication (NextAuth)
1. User clicks social login button
2. Redirected to OAuth provider
3. User authorizes application
4. Session is created and stored
5. User can access protected routes

### Dual Auth Support
- tRPC protected procedures accept both JWT and OAuth users
- Router context automatically resolves user from either auth method
- OAuth takes precedence if both are present

## Key Features Explained

### Protected tRPC Procedures
The `protectedProcedure` ensures only authenticated users can access sensitive operations:
- Create, update, and delete products
- Send and manage chat messages
- Access user-specific data

### Real-time Chat with Socket.io
- Bidirectional communication between buyers and sellers
- Message persistence in database
- Real-time notifications for new messages
- Deployed separately on Railway for scalability

### Email Notifications
- Confirmation codes for new registrations
- Password reset links with verification
- System uses Nodemailer with Gmail SMTP

### Product Images with UploadThing
- Upload multiple images when creating products
- Automatic image optimization
- Gallery display with Swiper carousel
- Fallback handling for missing images

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | Secret key for JWT signing | Yes |
| NEXTAUTH_URL | NextAuth callback URL | Yes |
| NEXTAUTH_SECRET | NextAuth encryption secret | Yes |
| EMAIL_USER | Gmail address for sending emails | Yes |
| EMAIL_PASS | Gmail app password | Yes |
| UPLOADTHING_SECRET | UploadThing API secret | Yes |
| NEXT_PUBLIC_UPLOADTHING_APP_ID | UploadThing App ID | Yes |
| NEXT_PUBLIC_SOCKET_SERVER_URL | Socket.io server URL | Yes |

## Development Commands

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:push         # Apply migrations
npm run db:generate     # Create new migration
npm run db:studio       # Open database UI

# Linting & Formatting
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Type Checking
npm run type-check      # TypeScript type checking

# Build
npm run build           # Build for production
```

## Common Issues & Solutions

### JWT Token Verification Fails
- Ensure JWT_SECRET is set in environment variables
- Check token hasn't expired
- Verify token format in Authorization header

### Socket.io Connection Issues
- Verify NEXT_PUBLIC_SOCKET_SERVER_URL is correct
- Check if socket server is running
- Confirm CORS settings allow your frontend domain

### Email Sending Fails
- Enable "Less secure app access" (deprecated) or use App Passwords
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check email provider SMTP settings

### Database Connection Errors
- Verify DATABASE_URL connection string
- Ensure PostgreSQL is running
- Check database credentials and permissions

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure build settings (automatic)
4. Deploy on push to main branch

### Socket.io Server (Railway)
1. Create Railway project
2. Connect GitHub repository
3. Set environment variables
4. Deploy and configure custom domain
5. Update NEXT_PUBLIC_SOCKET_SERVER_URL in frontend

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source. Please check the LICENSE file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review error messages and logs

---

**Built with ❤️ using modern web technologies**
