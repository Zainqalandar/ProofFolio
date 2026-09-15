# ProofFolio — Project Proposal
### Freelancers ke liye Testimonial Collector (MERN Stack)

---

## 1. Project Overview

**ProofFolio** ek platform hai jahan freelancers apne completed projects ki **case studies** bana sakte hain (screenshots ke sath) aur har case study ke liye ek **unique public link** generate hoti hai. Ye link client ko bheji jati hai — client **bina login/signup** ke seedha testimonial submit kar sakta hai. Freelancer us testimonial ko **review/approve** karta hai, tabhi wo freelancer ke public profile par show hota hai.

Ye essentially ek **social proof collection tool** hai — freelancers ke liye trust-building automate karta hai.

---

## 2. Problem Statement

- Freelancers ke paas clients se testimonials lena mushkil hota hai — WhatsApp/email pe manga hua text scattered rehta hai
- Client ko account banane ko kaha jaye to zyada log ignore kar dete hain
- Freelancer ke paas koi centralized, presentable jagah nahi hoti jahan wo apna proof-of-work + client feedback dono ek sath dikha sake
- Fake ya self-written testimonials ka trust issue hota hai — verified/moderated flow chahiye

**ProofFolio is problem ko ek clean workflow mein solve karta hai:** case study banao → link share karo → client submit kare → freelancer approve kare → public profile pe live ho.

---

## 3. Objectives (Learning Goals)

| # | Concept | Kahan Apply Hoga |
|---|---------|-------------------|
| 1 | **Multer + Cloudinary** | Screenshot/image upload handling (case study proof images) |
| 2 | **crypto module (secure random token)** | Har case study ke liye unique, guessable-na-ho-sake shareable link |
| 3 | **Public vs Protected routes** | Client submission route public hai, freelancer dashboard protected |
| 4 | **Pagination/Filtering** | Public profile par multiple case studies/testimonials list karna |
| 5 | **Moderation Workflow (state-machine)** | `pending → approved / rejected` |
| 6 | **(Bonus) AI Integration** | Long testimonial se ek short, punchy highlight line generate karna |

---

## 4. Tech Stack

**Frontend**
- React.js (Vite)
- React Router (public + protected routes split)
- Axios
- Context API (auth state)
- Tailwind CSS

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcrypt.js (freelancer auth only — client side no auth)
- Multer (file parsing middleware)
- Cloudinary SDK (image storage/CDN)
- crypto (Node built-in — token generation)
- (Bonus) OpenAI/Claude API for highlight generation

**Dev Tools**
- Postman
- MongoDB Atlas
- Cloudinary free tier
- dotenv, Git/GitHub

---

## 5. Database Schema (Mongoose Models)

### `User` Model (Freelancer)
```js
{
  name: String,
  email: { type: String, unique: true, required: true },
  password: String, // bcrypt hashed
  bio: String,
  profileSlug: { type: String, unique: true }, // e.g. "ahmed-dev"
  createdAt: Date
}
```

### `CaseStudy` Model
```js
{
  freelancer: { type: ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  screenshots: [String],       // Cloudinary URLs
  shareToken: { type: String, unique: true, required: true }, // crypto.randomBytes
  createdAt: Date
}
```

### `Testimonial` Model
```js
{
  caseStudy: { type: ObjectId, ref: 'CaseStudy', required: true },
  freelancer: { type: ObjectId, ref: 'User', required: true },
  clientName: String,
  clientEmail: String,
  clientCompany: String,
  message: String,
  aiHighlight: String,          // bonus: short AI-generated summary
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: Date,
  reviewedAt: Date
}
```

**Relation Logic:**
- `CaseStudy.freelancer` → `User`
- `Testimonial.caseStudy` → `CaseStudy`, `Testimonial.freelancer` → `User`
- Public profile page `.populate()` se saare approved testimonials + case studies fetch karega

---

## 6. Secure Shareable Link Logic (crypto)

```js
const crypto = require('crypto');

const shareToken = crypto.randomBytes(16).toString('hex');
// e.g. "a3f9c1e8b2d4f7a0c9e1b3d5f7a9c1e3"

// Public link banta hai:
// https://prooffolio.app/submit/a3f9c1e8b2d4f7a0c9e1b3d5f7a9c1e3
```

- Ye token guess nahi kiya ja sakta (128-bit randomness)
- Client is link ko open kare to sirf us specific case study ka submission form dikhe — koi aur data expose na ho
- Token `CaseStudy` document mein unique store hota hai, lookup O(1) index se

---

## 7. Moderation Workflow (State-Machine)

```
Testimonial Status:   pending ──► approved  (public profile pe show)
                          │
                          └────► rejected   (hidden, freelancer ke pass reason optional)
```

**Flow:**
1. Client link open kare → form fill kare (naam, company, message) → submit
2. `Testimonial.status = 'pending'` ban kar save ho
3. Freelancer apne dashboard mein "Pending Testimonials" dekhe → Approve/Reject
4. Approve hone par hi wo testimonial public profile (`/profile/:slug`) par visible ho

---

## 8. Core Features (MVP)

### Authentication (Freelancer only)
- Signup/Login (JWT)
- Protected dashboard routes

### Case Study Management
- Create case study (title, description, screenshot upload via Multer → Cloudinary)
- Auto-generate secure `shareToken` on creation
- Copy-to-clipboard shareable link
- Edit/Delete case study

### Public Submission (No Login)
- `/submit/:token` — public route
- Client form: naam, email (optional), company, testimonial message
- Submit → status `pending`

### Moderation Dashboard (Protected)
- List of pending testimonials with Approve/Reject buttons
- Approved/Rejected history tab

### Public Profile Page
- `/profile/:slug` — public, SEO-friendly
- Freelancer bio + case studies + approved testimonials
- **Pagination/filtering** (e.g. filter by case study, sort by date)

---

## 9. Bonus Feature — AI-Generated Highlight

Jab client testimonial submit kare (ya freelancer approve kare), backend AI API call kare:
- Input: full testimonial text
- Output: 1-line punchy highlight (e.g. *"Delivered 2 weeks early with flawless communication."*)
- Ye highlight card-view mein bold dikhaya jaye, full message "Read more" ke peeche

Real-world pattern: **long user-generated content → AI summarization for UI display.**

---

## 10. API Endpoints (Suggested Structure)

```
Auth
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me                       (protected)

Case Studies
POST   /api/case-studies                  (protected, multipart/form-data)
GET    /api/case-studies/my               (protected)
PUT    /api/case-studies/:id              (protected)
DELETE /api/case-studies/:id              (protected)

Public Submission
GET    /api/public/case-study/:token      (fetch case study info for form)
POST   /api/public/testimonial/:token     (client submits — no auth)

Testimonials (Moderation)
GET    /api/testimonials/pending          (protected)
PATCH  /api/testimonials/:id/approve      (protected)
PATCH  /api/testimonials/:id/reject       (protected)
POST   /api/testimonials/:id/ai-highlight (bonus, protected)

Public Profile
GET    /api/public/profile/:slug          (paginated approved testimonials + case studies)
```

---

## 11. Suggested 1–1.5 Week Timeline

| Day | Focus |
|-----|-------|
| **Day 1** | Project setup, MongoDB Atlas, Cloudinary account, folder structure |
| **Day 2** | User model + JWT auth + protected middleware |
| **Day 3** | CaseStudy model + Multer/Cloudinary upload + crypto token generation |
| **Day 4** | Public submission route + Testimonial model + form (frontend) |
| **Day 5** | Moderation dashboard (approve/reject) + status logic |
| **Day 6** | Public profile page + pagination/filtering |
| **Day 7** | Bonus AI highlight feature + UI polish |
| **Day 8 (buffer)** | Testing, bug fixes, deployment |

---

## 12. Deployment Plan
- **Backend:** Render / Railway
- **Frontend:** Vercel / Netlify
- **Database:** MongoDB Atlas
- **Images:** Cloudinary (free tier)

---

## 13. Stretch Goals (Agar time bache)
- Custom branding per freelancer (color theme, logo on profile)
- Embed widget (case study/testimonial embed on freelancer's own website via iframe)
- Email notification to freelancer jab naya testimonial submit ho (Nodemailer)
- Star rating field alongside text testimonial
- Export testimonials as PDF/image card for social sharing

---

## 14. Skills Demonstrated on Resume

> "Built a full-stack MERN application with public and authenticated route separation, secure token-based shareable links using Node's crypto module, image upload pipeline via Multer and Cloudinary, a moderation state-machine for user-generated content, and paginated public profile rendering. Integrated an AI API to auto-generate concise testimonial highlights."

---

**Next Step:** Agar chaho to main is proposal ke basis par actual folder structure + starter code (Multer/Cloudinary config, crypto token logic, moderation routes) bhi bana sakta hoon.