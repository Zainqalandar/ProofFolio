# ProofFolio

ProofFolio is a full-stack social-proof portfolio platform for freelancers, designers, and developers. Users can turn completed work into case studies, collect client testimonials through shareable links, approve the feedback they want to publish, and present everything on a public profile.

Visitors do not need an account to browse public profiles, explore projects, or submit a testimonial through a case-study link.

The project is organized as a monorepo with a Next.js frontend and an Express/MongoDB backend.

## Features

- JWT-based freelancer registration and login
- Protected dashboard for managing case studies and testimonials
- Case study creation with up to five screenshot uploads
- Cloudinary image storage for project screenshots and profile pictures
- Secure client testimonial links generated with Node's `crypto` module
- Public testimonial submission without client signup
- Testimonial moderation workflow: pending, approved, and rejected
- AI-powered project-story enhancement using Google Gemini
- AI-generated testimonial highlights for concise public proof
- Public freelancer profiles with paginated and filterable testimonials
- Public Explore directory showing registered profiles and their latest projects
- Owner-only profile editing for name and bio
- Owner-only profile picture upload and update
- Responsive UI built with Tailwind CSS

## Tech stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- Lucide React icons

### Backend

- Node.js and Express 5
- TypeScript
- MongoDB with Mongoose
- JWT and bcryptjs authentication
- Multer and Cloudinary for image uploads
- Google Gemini API for AI writing assistance

## Project structure

```text
ProofFolio/
├── backend/
│   └── src/
│       ├── configs/        # MongoDB and Cloudinary configuration
│       ├── constants/      # HTTP status constants
│       ├── controllers/    # Auth, case study, testimonial, and public handlers
│       ├── middleware/     # JWT protection and upload middleware
│       ├── models/         # User, CaseStudy, and Testimonial schemas
│       ├── routes/         # Express API routes
│       ├── services/       # Gemini service integrations
│       └── server.ts
├── frontend/
│   ├── app/                # Next.js routes and pages
│   ├── components/         # Shared UI components
│   ├── context/            # Notification context
│   ├── types/              # Frontend API types
│   └── utils/              # Axios, auth, and API helpers
└── README.md
```

## Requirements

- Node.js 20.9+
- npm
- MongoDB, local or MongoDB Atlas
- Cloudinary account for image uploads
- Gemini API key for AI features

## Local setup

Install dependencies in both workspaces:

```bash
cd ProofFolio/backend
npm install

cd ../frontend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/prooffolio
JWT_SECRET=replace-with-a-long-random-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000/api
```

Start the backend and frontend in separate terminals:

```bash
# Terminal 1
cd ProofFolio/backend
npm run dev
```

```bash
# Terminal 2
cd ProofFolio/frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API runs at [http://localhost:5000](http://localhost:5000).

## Main public pages

- `/` — ProofFolio landing page
- `/explore` — public directory of profiles and projects
- `/profile/:slug` — public freelancer profile
- `/submit/:token` — public testimonial submission page

Authenticated users can access the dashboard and case-study management pages after signing in.

## API overview

All API routes are prefixed with `/api`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Create a freelancer account |
| POST | `/api/auth/login` | No | Sign in and receive a JWT |
| GET | `/api/auth/me` | Yes | Get the current user |
| PUT | `/api/auth/profile-picture` | Yes | Upload or update the owner's profile picture |
| POST | `/api/case-studies` | Yes | Create a case study with screenshots |
| GET | `/api/case-studies/my` | Yes | Get the authenticated user's case studies |
| PUT | `/api/case-studies/:id` | Yes | Update an owned case study |
| DELETE | `/api/case-studies/:id` | Yes | Delete an owned case study and its testimonials |
| POST | `/api/case-studies/enhance-description` | Yes | Improve a project story with Gemini |
| GET | `/api/testimonials/pending` | Yes | View testimonials waiting for review |
| PATCH | `/api/testimonials/:id/approve` | Yes | Approve a testimonial |
| PATCH | `/api/testimonials/:id/reject` | Yes | Reject a testimonial |
| POST | `/api/testimonials/:id/ai-highlight` | Yes | Generate a short AI highlight |
| GET | `/api/public/case-study/:token` | No | Get public case-study details |
| POST | `/api/public/testimonial/:token` | No | Submit client feedback without login |
| GET | `/api/public/profiles` | No | Browse public profiles with pagination |
| GET | `/api/public/profile/:slug` | No | Get a public profile, projects, and testimonials |
| PUT | `/api/public/profile/:slug` | Yes | Update the authenticated owner's name and bio |

The public profile endpoint supports testimonial pagination, sorting, and case-study filtering:

```text
/api/public/profile/zain-qalandar-shah?page=1&limit=6&sort=newest&caseStudy=CASE_STUDY_ID
```

The public directory supports pagination:

```text
/api/public/profiles?page=1&limit=9
```

## Core workflow

```text
Sign up / sign in
        ↓
Create a case study with screenshots
        ↓
Share the generated client link
        ↓
Client submits a testimonial without an account
        ↓
Freelancer approves or rejects the testimonial
        ↓
Approved proof appears on the public profile
```

## Data relationships

- A `CaseStudy` belongs to one `User` through `freelancer`.
- A `Testimonial` belongs to a `CaseStudy` and its freelancer.
- A case study receives a unique `shareToken` for public client submissions.
- Only approved testimonials are shown on public profiles.
- Profile updates and profile-picture updates require the authenticated owner.

## Scripts

### Frontend

```bash
npm run dev       # Start the Next.js development server
npm run build     # Create a production build
npm run start     # Start the production server
npm run lint      # Run ESLint
```

### Backend

```bash
npm run dev       # Start the TypeScript API with reload
npm run build     # Compile the backend to dist/
npm run start     # Start the compiled API
npm run typecheck # Run TypeScript checks without emitting files
```

## Future improvements

- Email notifications when new testimonials are submitted
- Star ratings and richer testimonial metadata
- Custom profile themes and branding
- Search and category filters in the public directory
- Social sharing cards for public profiles
- Analytics for profile visits and testimonial links
- Deployment with Vercel, Render, MongoDB Atlas, and Cloudinary
