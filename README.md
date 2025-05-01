# Plasma Memes

<p align="center">
  <img src="public/plasma-logo.png" alt="Plasma Memes Logo" width="120" height="120" />
</p>

<p align="center">
  A curated collection of memes from the Plasma community.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Features

- 🖼️ Pinterest-style meme gallery with infinite scrolling
- 🔒 Admin-only upload privileges with secure authentication
- 📱 Fully responsive design for all devices
- 🚀 Optimized image loading and caching for performance
- 💾 Supabase integration for database and storage
- 🌙 Beautiful dark theme UI with Tailwind CSS
- 🔍 Timeline view with category filtering
- 📊 Admin dashboard for content management

## Demo

Visit the live demo: [https://plasmamemes.xyz/](https://plasmamemes.xyz/)

### Admin Access

To access the admin dashboard:
- URL: `/admin`
- Username: `admin`
- Password: `plasma123`

![Plasma Memes Screenshot](docs/screenshot.png)

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **UI**: [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- **Database & Storage**: [Supabase](https://supabase.io/)
- **Authentication**: Custom admin authentication with cookies
- **Deployment**: [Vercel](https://vercel.com)
- **Image Optimization**: Next.js Image component with custom optimization
- **State Management**: React hooks and context

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account (free tier works fine)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/plasma-memes.git
   cd plasma-memes
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

4. Set up your Supabase database:
   - Create a new project in Supabase
   - Run the SQL setup script from `scripts/setup-database.sql`
   - Enable Storage and create a bucket named "memes"

5. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

## Database Schema

The application uses a single table in Supabase:

\`\`\`sql
CREATE TABLE memes (
  id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Deployment

### Deploy on Vercel

The easiest way to deploy your Plasma Memes app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Add the environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Plasma community for inspiration
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide Icons](https://lucide.dev/) for the icon set
