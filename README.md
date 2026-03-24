# ChurnSentinel

> **Live at [offerloom.shop](https://offerloom.shop)** (deploy to Vercel/Railway with custom domain)

Customer churn early-warning system for Stripe-powered SaaS businesses. Monitor payment failures, track at-risk customers, and prevent revenue loss with real-time alerts.

## Features

- **Risk Scoring**: Automatically calculate churn risk (0-100) based on payment failures, cancellations, and downgrades
- **Dashboard**: View MRR, active subscriptions, trials, and at-risk customers at a glance
- **Real-time Alerts**: Get notified via Slack or email when customers show churn signals
- **Weekly Reports**: Receive automated revenue risk summaries
- **Stripe Integration**: Seamless webhook integration for real-time data sync

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Magic Link + GitHub OAuth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Alerts**: Slack webhooks + Resend email

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Docker (for local Postgres)
- Stripe account

### Local Development

1. **Clone and install dependencies**

```bash
git clone https://github.com/nkgshahbaz58-cell/OfferLoom.git
cd OfferLoom
pnpm install
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/churnsentinel"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

3. **Start the database**

```bash
docker compose up -d
```

4. **Initialize the database**

```bash
pnpm db:push
pnpm db:seed  # Optional: seed with demo data
```

5. **Start the development server**

```bash
pnpm dev
```

Visit http://localhost:3000

### Setting Up Stripe Webhooks

1. **Install Stripe CLI**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with scoop)
scoop install stripe
```

2. **Forward webhooks to localhost**

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. **Copy the webhook signing secret** (starts with `whsec_`) to your `.env`

4. **Test events**

```bash
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.updated
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard
4. Add a Postgres database (Vercel Postgres or external)
5. Deploy!

**Environment Variables for Vercel:**
```
DATABASE_URL=your-postgres-connection-string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_... (optional)
```

### Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Add a PostgreSQL database service
4. Add a new service from your GitHub repo
5. Set environment variables
6. Railway will auto-deploy on push

**railway.toml** (optional, for custom build):
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "pnpm db:push && pnpm start"
```

### Deploy to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create:
   - A PostgreSQL database
   - A Web Service from your repo
3. Set environment variables
4. Add build command: `pnpm install && pnpm db:generate && pnpm build`
5. Add start command: `pnpm db:push && pnpm start`

### Deploy with Docker

```bash
# Build the image
docker build -t churn-sentinel .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e STRIPE_SECRET_KEY="..." \
  churn-sentinel
```

### Configure Production Stripe Webhooks

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `customer.created`
   - `customer.updated`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.paid`
4. Copy the signing secret to your environment variables

## Risk Scoring Rules

| Rule | Points | Condition |
|------|--------|-----------|
| Recent Payment Failure | +40 | Invoice payment failed in last 7 days |
| Cancel at Period End | +30 | Subscription set to cancel |
| Multiple Failures | +20 | 2+ payment failures in 30 days |
| Recent Downgrade | +10 | Downgraded plan in last 30 days |

Score is capped at 100. Higher scores = higher churn risk.

## Project Structure

```
churn-sentinel/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Login pages
│   │   ├── (dashboard)/   # Dashboard pages
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   └── ui/            # shadcn/ui components
│   └── lib/               # Utilities
│       ├── auth.ts        # NextAuth config
│       ├── db.ts          # Prisma client
│       ├── risk-scoring.ts # Risk calculation
│       ├── alerts.ts      # Slack/email alerts
│       └── stripe.ts      # Stripe utilities
├── scripts/
│   ├── seed.ts            # Database seeding
│   └── weekly-report.ts   # Weekly report cron
├── __tests__/             # Unit tests
├── .github/workflows/     # CI/CD
├── docker-compose.yml     # Local development
└── Dockerfile             # Production container
```

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checker
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed demo data
```

## What's Next

Future enhancements planned:

- [ ] **Intercom/Zendesk Integration**: Import support ticket data as churn signals
- [ ] **Usage Tracking**: Track product usage metrics and incorporate into risk scoring
- [ ] **ML Scoring**: Machine learning model for more accurate churn prediction
- [ ] **Save Playbooks**: Generate personalized retention playbooks per customer
- [ ] **Team Collaboration**: Comments, assignments, and customer notes
- [ ] **Billing**: Self-service subscription for ChurnSentinel itself
- [ ] **API**: Public API for custom integrations
- [ ] **Mobile App**: iOS/Android apps for on-the-go monitoring

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see [LICENSE](LICENSE) for details.
