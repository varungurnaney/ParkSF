# ParkSF - Fair Parking in San Francisco

A community-first parking app with ultra-low transaction fees—just $0.05 instead of SFMTA's $0.35-0.39 per transaction.

## 🎯 Mission

San Franciscans already pay some of the highest living costs in the country—yet even something as basic as street parking comes with a growing burden. As of July 2025, the SFMTA increased the "Mobile Parking Payment Convenience Fee" from $0.10 to $0.35–$0.39 per transaction. This is nearly 4x the previous fee and disproportionately affects everyday residents simply trying to comply with parking rules.

Our project aims to fix that.

## ✨ Features

### Core Features
- **License Plate + Duration**: Simple, frictionless parking sessions
- **Ultra-Low Fees**: Pay just $0.05 instead of $0.35-0.39
- **Real-Time Availability**: Interactive map with live parking spot data
- **Cost Savings Calculator**: See exactly how much you save vs SFMTA
- **Session Management**: Real-time countdown timer and session tracking
- **Receipt Download**: Get detailed receipts for your parking sessions

### User Experience
- **No Account Required**: Just enter license plate and go
- **Privacy-First**: No personal information collected
- **Mobile-Optimized**: Beautiful, responsive design
- **Step-by-Step Flow**: Clear, intuitive parking process

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ParkSF.git
   cd ParkSF
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Frontend (Next.js 14)
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main application
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable components
│   │   ├── LicensePlateInput.tsx
│   │   ├── DurationSelector.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── SessionConfirmation.tsx
│   │   └── ParkingMap.tsx
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── package.json
```

### Key Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icons
- **Stripe** - Payment processing (ready for integration)

## 📱 User Flow

1. **Enter License Plate**
   - Simple text input with validation
   - Privacy-focused messaging

2. **Select Duration**
   - Preset options (15min, 30min, 1hr, 2hr, 4hr, All day)
   - Custom duration option
   - Real-time cost calculation

3. **Choose Parking Spot**
   - Interactive map with available spots
   - Real-time availability updates
   - Spot details and restrictions

4. **Complete Payment**
   - Secure payment form
   - Cost breakdown and savings display
   - Processing simulation

5. **Session Confirmation**
   - Real-time countdown timer
   - Session details and receipt
   - Download receipt option

## 💰 Cost Comparison

| Service | Fee | Savings |
|---------|-----|---------|
| SFMTA | $0.35-0.39 | - |
| ParkSF | $0.05 | **$0.30-0.34** |

**Example**: For a 1-hour parking session at $2.50/hr:
- **SFMTA Total**: $2.50 + $0.37 = $2.87
- **ParkSF Total**: $2.50 + $0.05 = $2.55
- **You Save**: $0.32 per transaction

## 🔧 Development

### Project Structure
```
ParkSF/
├── frontend/              # Next.js frontend application
├── backend/               # Node.js backend (future)
├── shared/                # Shared types and utilities (future)
├── docs/                  # Documentation (future)
└── README.md
```

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Environment Variables
Create a `.env.local` file in the frontend directory:
```env
# Stripe (for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Mapbox (for real maps)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...

# SFMTA API (for real data)
SFMTA_API_KEY=your_api_key_here
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch
3. Environment variables configured in Vercel dashboard

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🔮 Future Features

### Phase 2 (Post-MVP)
- [ ] Real SFMTA API integration
- [ ] Stripe payment processing
- [ ] Real-time parking data
- [ ] Push notifications
- [ ] Session extensions
- [ ] Community features

### Phase 3 (Scale)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Neighborhood partnerships
- [ ] Multi-city expansion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- SFMTA for providing parking infrastructure
- San Francisco community for feedback and support
- Open source contributors who made this possible

## 📞 Contact

- **Website**: [parksf.app](https://parksf.app) (coming soon)
- **Email**: hello@parksf.app
- **Twitter**: [@ParkSF](https://twitter.com/ParkSF)

---

**Made with ❤️ for San Francisco** 