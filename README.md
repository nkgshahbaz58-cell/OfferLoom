# Netflix Clone - OfferLoom

A modern, responsive Netflix-style movie discovery application built with cutting-edge web technologies. This project showcases a beautiful streaming platform interface with dynamic movie data from The Movie Database (TMDB) API.

## Project Overview

This Netflix clone is designed for **offerloom.shop** and features:

- Browse trending, popular, and top-rated movies
- Browse movies by genre (Action, Comedy, Horror, Sci-Fi)
- Currently playing movies
- Responsive design optimized for desktop, tablet, and mobile
- Smooth animations and transitions
- Movie details modal with full information
- Search functionality
- Dynamic data fetching from TMDB API

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher) or **yarn**
- **TMDB API Key** - Register at [The Movie Database](https://www.themoviedb.org/settings/api) to get a free API key

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OfferLoom
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **PostCSS & Autoprefixer** - CSS processing

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with your TMDB API credentials:

```env
# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
TMDB_API_BASE=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# App Configuration
NEXT_PUBLIC_APP_NAME=Netflix Clone
NEXT_PUBLIC_APP_DESCRIPTION=Your source for movies and shows
```

Replace `your_tmdb_api_key_here` with your actual TMDB API key from https://www.themoviedb.org/settings/api

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm start` - Run production build
- `npm run lint` - Run ESLint to check code quality

## Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_TMDB_API_KEY` | String | Your TMDB API key (public, visible in browser) |
| `TMDB_API_BASE` | String | TMDB API base URL |
| `NEXT_PUBLIC_TMDB_IMAGE_BASE` | String | TMDB image base URL for movie posters |
| `NEXT_PUBLIC_APP_NAME` | String | Application name |
| `NEXT_PUBLIC_APP_DESCRIPTION` | String | Application description |

## Project Structure

```
OfferLoom/
├── app/
│   ├── layout.tsx          # Root layout with navbar and footer
│   ├── page.tsx            # Home page with movie categories
│   ├── dashboard/page.tsx  # Dashboard page
│   └── offers/page.tsx     # Offers page
├── components/
│   ├── Navbar.tsx          # Navigation header
│   ├── HeroBanner.tsx      # Featured movie banner
│   ├── MovieRow.tsx        # Horizontal movie carousel
│   ├── MovieCard.tsx       # Individual movie card
│   ├── MovieModal.tsx      # Movie details modal
│   ├── SearchBar.tsx       # Search functionality
│   ├── Footer.tsx          # Footer component
│   ├── LoadingSkeleton.tsx # Loading skeleton screens
│   ├── Button.tsx          # Reusable button component
│   ├── Card.tsx            # Reusable card component
│   ├── Header.tsx          # Generic header component
├── lib/
│   ├── tmdb.ts             # TMDB API client & methods
│   ├── types.ts            # TypeScript type definitions
│   ├── constants.ts        # Application constants
│   └── utils.ts            # Utility functions
├── styles/
│   ├── globals.css         # Global styles
│   ├── components.css      # Component-specific styles
│   ├── layout.css          # Layout styles
│   └── pages.css           # Page-specific styles
├── public/                 # Static assets
├── .env.local              # Environment variables (local only)
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── package.json            # Dependencies and scripts
```

## Features

### 1. Movie Discovery
- **Trending Now** - Currently trending movies
- **Popular Movies** - Most popular movies
- **Top Rated** - Highest rated movies
- **Now Playing** - Movies currently in theaters

### 2. Genre Browsing
- Action movies
- Comedy movies
- Horror movies
- Sci-Fi movies

### 3. Movie Details
- Click any movie card to view detailed information
- Movie overview and synopsis
- Release date and ratings
- High-quality poster images
- Related movies

### 4. Search Functionality
- Search for movies by title
- Real-time search results
- Responsive search interface

### 5. Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Desktop-enhanced features

### 6. Smooth Animations
- Hover effects on movie cards
- Modal entrance animations
- Carousel transitions
- Loading skeletons

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with server-side rendering |
| **React 18** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Advanced animations and transitions |
| **TMDB API** | Movie data source |
| **PostCSS** | CSS transformation tool |
| **Autoprefixer** | Automatic CSS vendor prefixes |
| **ESLint** | Code quality and consistency |

## API Integration

The project uses The Movie Database (TMDB) API to fetch:
- Trending movies
- Popular movies
- Top-rated movies
- Movies by genre
- Movie details and metadata
- Movie posters and images

All API interactions are handled in `/lib/tmdb.ts` with proper error handling and caching strategies.

## Deployment Guide

### Deploy to Vercel (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Complete Netflix clone setup"
git push origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project" and select your GitHub repository

4. Add environment variables in Vercel:
   - `NEXT_PUBLIC_TMDB_API_KEY` - Your TMDB API key
   - `TMDB_API_BASE` - https://api.themoviedb.org/3
   - `NEXT_PUBLIC_TMDB_IMAGE_BASE` - https://image.tmdb.org/t/p
   - `NEXT_PUBLIC_APP_NAME` - Netflix Clone
   - `NEXT_PUBLIC_APP_DESCRIPTION` - Your source for movies and shows

5. Click "Deploy" - Vercel will handle the rest!

### Environment Configuration in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required environment variables
4. Redeploy the project for changes to take effect

### Alternative Deployment Options

- **Netlify** - Connect GitHub repository and add environment variables
- **AWS Amplify** - Similar to Vercel workflow
- **Self-hosted** - Build and run on your own server

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **"TMDB error: 401" during build**
   - Ensure your `NEXT_PUBLIC_TMDB_API_KEY` is valid
   - Check that the API key has proper permissions
   - Verify the environment variable is set correctly

2. **Movies not loading**
   - Check your internet connection
   - Verify API key is active
   - Check browser console for error messages
   - Ensure TMDB API service is operational

3. **Images not displaying**
   - Confirm `NEXT_PUBLIC_TMDB_IMAGE_BASE` is set correctly
   - Check image URLs in network tab of browser DevTools
   - Verify Next.js image optimization is working

4. **TypeScript errors**
   - Run `npm install` to ensure all types are installed
   - Check that your Node.js version matches requirements
   - Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Development Tips

- Use React Developer Tools browser extension for component inspection
- Enable Next.js debug output: `DEBUG=* npm run dev`
- Check browser Console and Network tabs for API responses
- Use TypeScript strict mode for better type safety
- Test responsive design using browser DevTools

## Performance Optimization

- **Image Optimization** - Next.js automatically optimizes images
- **Code Splitting** - Automatic route-based code splitting
- **Lazy Loading** - Components load only when needed
- **Caching** - API responses are cached appropriately
- **Production Build** - Optimized bundle size and load times

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- User authentication system
- Watch lists and favorites
- User ratings and reviews
- Personalized recommendations
- Dark/Light theme toggle
- Advanced filtering options
- Streaming provider integration
- Watchlist persistence

## Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with detailed description

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review TMDB API documentation at https://www.themoviedb.org/docs/api

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [TMDB API Documentation](https://www.themoviedb.org/docs/api)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

Built with ❤️ for offerloom.shop | Netflix Clone | © 2024
