# Tip-a-Creator

A Farcaster Mini App for tipping creators with USDC using Base Pay. Built with Next.js, Firebase, and OnchainKit.

## Features

- 💰 **USDC Tipping**: Send tips to creators using Base Pay
- 🔗 **Farcaster Integration**: Works as a Mini App within Base App and Farcaster frames
- 📱 **Mobile-First**: Optimized for mobile frame experience
- 🔔 **Push Notifications**: Real-time notifications when creators receive tips
- 📊 **Creator Dashboard**: Track tips received and supporter analytics
- 🎯 **Frame Embedding**: Shareable frames for easy tipping
- 🔐 **Secure**: Built with proper authentication and validation

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS
- **Backend**: Next.js App Router API Routes
- **Database**: Firestore (via Firebase Admin SDK)
- **Blockchain**: Base network, OnchainKit, Base Pay
- **Authentication**: MiniKit authentication
- **Notifications**: MiniKit notification API

### Farcaster Mini App
- The Farcaster Mini App manifest is served at `/.well-known/fc:miniapp:manifest`.
- It is rewritten to `public/manifest.json` via `next.config.mjs`.
- Make sure `public/manifest.json` contains your Mini App metadata before deployment.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Vercel account for deployment
- Base Pay client ID
- Farcaster developer account

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd tip-a-creator
   npm install
   ```

2. **Set up Firebase**
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Generate a service account key:
     - Go to Project Settings > Service Accounts
     - Click "Generate new private key"
     - Save the JSON file securely

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

   # Farcaster Manifest Configuration
   FARCASTER_MANIFEST_HEADER={"alg":"ES256","typ":"JWT"}
   FARCASTER_MANIFEST_PAYLOAD={"iss":"https://your-app.vercel.app","aud":"farcaster","exp":1234567890,"iat":1234567890,"sub":"https://your-app.vercel.app/.well-known/farcaster.json"}
   FARCASTER_MANIFEST_SIGNATURE=your-manifest-signature

   # Base Pay Configuration
   BASE_PAY_CLIENT_ID=your-base-pay-client-id

   # Deployment Configuration
   VERCEL_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

   # Notification Configuration
   NOTIFICATION_SECRET=your-notification-secret-key
   ```

4. **Set up Firestore security rules**
   - Go to Firestore Database > Rules in Firebase Console
   - Copy the rules from `scripts/firestore-rules.sql`
   - Publish the rules

5. **Create Firestore indexes**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Set your project
   firebase use your-firebase-project-id
   
   # Create indexes (run each command from scripts/firestore-indexes.sql)
   firebase firestore:indexes:create --collection-group=tips --field-config=tipperAddress,ASCENDING --field-config=createdAt,DESCENDING
   ```

6. **Seed the database (optional)**
   ```bash
   node scripts/seed-firestore.js
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Configure the project settings

2. **Set environment variables in Vercel**
   - Go to your project settings in Vercel
   - Add all environment variables from your `.env.local`
   - Make sure to set `VERCEL_URL` to your actual Vercel domain

3. **Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

### Register with Farcaster

1. **Prepare manifest**
   - Update `public/manifest.json` with your Mini App details (name, icons, URLs).

2. **Register your Mini App**
   - Submit your app manifest URL `https://your-domain/.well-known/fc:miniapp:manifest` to Farcaster for review.
   - Once approved, your app will be available in Base App.

## Usage

### For Users

1. **Connect Wallet**: Use MiniKit to connect your Base wallet
2. **Find Creators**: Browse top creators or search for specific handles
3. **Send Tips**: Select amount, add optional message, confirm with Base Pay
4. **Share**: Automatically compose a cast about your tip
5. **Track History**: View all tips sent in your history

### For Creators

1. **Receive Tips**: Get notified when users tip you
2. **Dashboard**: View total tips, supporter analytics, and recent activity
3. **Profile**: Share your profile link for easy tipping
4. **Notifications**: Enable push notifications for real-time updates

### Frame Integration

- **Shareable Frames**: Each creator has a shareable frame URL
- **Embed in Casts**: Frames can be embedded in Farcaster casts
- **Direct Tipping**: Users can tip directly from frames without leaving Farcaster

## API Reference

### Authentication

All API endpoints that modify data require MiniKit authentication:

```javascript
const authPayload = {
  message: "Sign in to Tip-a-Creator",
  signature: "0x...",
  address: "0x..."
}
```

### Endpoints

#### Tips

- `POST /api/tips` - Create a new tip
- `GET /api/tips?address=0x...` - Get tips for an address

#### Creators

- `GET /api/creators/top` - Get top creators by tips received
- `GET /api/creators/[handle]` - Get creator profile by handle

#### Notifications

- `POST /api/notifications/send` - Send notification to creator
- `GET /api/notifications?address=0x...` - Get notifications for address

#### Frame

- `GET /api/frame/metadata` - Get frame metadata
- `POST /api/frame/action` - Handle frame actions

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- TipModal.test.js
```

### Test Coverage

- API route validation and error handling
- Component rendering and user interactions
- Firebase integration mocking
- Frame metadata generation

## Development

### Project Structure

```
tip-a-creator/
├── components/          # React components
├── lib/                # Utility functions and configurations
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   └── frame/         # Frame-specific pages
├── public/            # Static assets
├── scripts/           # Database scripts and utilities
├── styles/            # CSS and styling
└── __tests__/         # Test files
```

#### Project Structure (App Router)
```
tip-a-creator/
├── app/                 # App Router pages and API routes
│   └── api/             # API endpoints (tips, creators, notifications)
├── components/          # React components
├── lib/                 # Utilities and configurations
├── public/              # Static assets (includes manifest.json)
├── scripts/             # Database scripts and utilities
├── styles/              # CSS and styling
└── __tests__/           # Test files
```

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check your service account key format
   - Ensure Firestore is enabled in your Firebase project
   - Verify environment variables are set correctly

2. **Frame Not Loading**
   - Check your manifest signature is valid
   - Ensure CORS headers are properly configured
   - Verify frame metadata is correctly formatted

3. **Base Pay Integration**
   - Confirm Base Pay client ID is correct
   - Check network configuration (Base mainnet)
   - Ensure user has sufficient USDC balance

4. **Notifications Not Working**
   - Verify MiniKit context is available
   - Check notification permissions are granted
   - Ensure notification secret is configured

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Community**: Join the Farcaster developer community for discussions

## Roadmap

- [ ] Multi-token support (ETH, other Base tokens)
- [ ] Recurring tips/subscriptions
- [ ] Creator verification system
- [ ] Advanced analytics and insights
- [ ] Mobile app version
- [ ] Integration with other social platforms

---

Built with ❤️ for the Farcaster and Base communities.
