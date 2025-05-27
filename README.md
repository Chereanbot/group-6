# DULAS - Dilla University Legal Aid Service

![DULAS Logo](public/images/logo.svg)

DULAS is a comprehensive legal management system designed to streamline the operations of Dilla University's legal aid services. The platform connects law school administrators, coordinators, lawyers, and clients in an integrated ecosystem for efficient legal case management.

## 🚀 Project Overview

DULAS provides specialized interfaces for different user roles, each with tailored functionality:

### Law School Administration
- Office management with capacity planning
- Coordinator assignment and management
- Lawyer workload and case assignment
- High-priority case handling
- Report management and analytics
- Communication hub for all stakeholders
- Premium service request management

### Coordinators
- Client registration and management
- Case registration with document handling
- Document review and client notifications
- Appointment scheduling with court-date reminders
- SMS notifications for clients
- Report generation and sharing

### Lawyers
- Case management dashboard
- Client communication tools
- Daily case activity tracking
- Report submission
- Appointment notifications

### Clients
- Self-registration with phone verification
- Service type selection (free legal aid or premium)
- Case submission with document uploads
- Payment processing for premium services
- Appointment tracking
- Case progress monitoring

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Notifications**: Email and SMS integration
- **AI Integration**: Gemini API for legal assistance

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/dulas.git
cd dulas
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Copy the `.env.example` file to `.env.local` and fill in your configuration values.

4. Generate Prisma client
```bash
npx prisma generate
```

5. Run the development server
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔒 Authentication

The system uses role-based authentication with four main user types:
- Law School Admin
- Coordinator
- Lawyer
- Client

Each role has specific permissions and access to different parts of the application.

## 📱 Mobile Responsiveness

DULAS is designed to work seamlessly across desktop and mobile devices, ensuring all users can access the system regardless of their device.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Dilla University Law School for their guidance and requirements
- All contributors who have helped shape this project
