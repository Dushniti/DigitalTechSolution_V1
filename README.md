# DigitalTechSolution — Company Portfolio Website

A modern, fully responsive company portfolio website built with React 18, Vite, and Tailwind CSS. It showcases web development services with a dark/light design system, gradient aesthetics, Framer Motion animations, and a full Node.js/Express backend for contact form submissions.

---

## Features

- 🎨 **Modern Design** — Gradient backgrounds, pill badges, frosted glass effects, and consistent dark CTA banners across all sections
- 📱 **Fully Responsive** — Mobile-first layout optimised for all screen sizes including mobile footer and popup fixes
- ⚡ **Vite Powered** — Lightning-fast HMR development server and optimised production builds
- 🎭 **Framer Motion Animations** — `whileInView`, `whileHover`, `AnimatePresence`, and layout animations throughout
- 🎯 **SEO Optimised** — Dynamic meta tags via custom `useSEO` hook, `sitemap.xml`, and `robots.txt`
- 🔧 **Modular Components** — Fully self-contained, reusable React components
- 🔒 **Authentication System** — Secure JWT-based login with role-based access control (Admin, Employee, HR)
- 📊 **Admin & Employee Dashboard** — Comprehensive dashboard with HR, organization, and settings management
- 💼 **HR & Payroll Modules** — Complete leave, salary, regularization, and payroll management systems
- 📁 **Document Management** — File upload capabilities, user-specific retrieval, and secure deletion
- 📧 **Three Contact Forms** — General enquiry, Start a Project, and Schedule a Call — all with SMTP email integration and auto-reply
- ✅ **Form Validation** — Client-side validation with clear error messaging
- 🌊 **Animated Tech Background** — Canvas-based particle background (TechBackground)
- 💬 **Floating Buttons** — WhatsApp and Call floating action buttons
- 🛡️ **Legal Pages** — Privacy Policy and Terms of Service
- 👥 **Team Page** — Dedicated `/our-team` route with animated member cards
- 💼 **Careers Page** — Dedicated `/career` route with job portal backend integration
- 🔢 **Portal Modals** — Contact and login modals rendered via `createPortal` to correctly layer above all content

---

## Sections

| Route / Anchor | Component | Description |
|---|---|---|
| `#hero` | `Hero.jsx` | Animated hero with ROI-focused headline and CTA buttons |
| `#about` | `About.jsx` | Mission, stats (50+ clients, 100% satisfaction), and values |
| `#services` | `Services.jsx` | Service cards with feature chips, Learn More modal |
| — | `ServiceModal.jsx` | Full-screen service details modal (portal-based) |
| `#portfolio` | `Portfolio.jsx` | Filterable project grid with hover overlays |
| `#contact` | `Contact.jsx` | Contact form + info cards + business hours + project/schedule modals |
| `/our-team` | `OurTeam.jsx` | Team member cards with avatar, bio, and social links |
| `/career` | `Career.jsx` | Open positions and application info |
| `/dashboard` | `Dashboard.jsx` | Comprehensive dashboard with sub-modules (HR, Payroll, Documents, etc.) |
| `#/privacy-policy` | `PrivacyPolicy.jsx` | Privacy Policy page |
| `#/terms-of-service` | `TermsOfService.jsx` | Terms of Service page |
| — | `Footer.jsx` | Links, contact info, newsletter signup, bottom bar |

---

## Technologies Used

### Frontend
- **React 18** — Hooks-based component architecture
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Animations and transitions
- **Lucide React** — Icon library (uses `React.forwardRef` — assign to capitalized variable before use as JSX)
- **AOS** — Scroll-triggered animation library
- **react-dom `createPortal`** — Modal rendering outside component stacking contexts

### Backend (`/server`)
- **Node.js + Express** — REST API server
- **MongoDB & Mongoose** — Database for users, jobs, documents, leave, and salary records
- **JWT & bcryptjs** — Authentication and secure password hashing
- **Multer** — Middleware for handling multipart/form-data (file uploads)
- **Nodemailer / Resend** — SMTP email sending and email API integration
- **CORS** — Configured for local and production origins

---

## Team

| Name | Role |
|---|---|
| Dushyant Kumar | Founder & Full-Stack Developer |
| Nitika Jolly | Frontend Developer |
| Ishu Mathur | Backend Developer |

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Dushniti/DigitalTechSolution_V1.git
cd digitaltechsolution
```

2. Install dependencies for both frontend and backend:
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

3. Configure environment variables — create a `.env` file inside the `server/` directory:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
PORT=5000
```
> For Gmail, enable 2-Factor Authentication and generate an App Password from Google Account → Security → App passwords.

4. Start both servers:
```bash
# Terminal 1 — backend
cd server
npm start

# Terminal 2 — frontend
npm run dev
```

5. Open in browser:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Production Build

```bash
npm run build       # outputs to /dist
npm run preview     # preview the production build locally
```

---

## Project Structure

```
digitaltechsolution/
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Hero.css
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── ServiceModal.jsx
│   │   ├── Portfolio.jsx
│   │   ├── Contact.jsx
│   │   ├── Footer.jsx
│   │   ├── OurTeam.jsx
│   │   ├── Career.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── TermsOfService.jsx
│   │   ├── TechBackground.jsx
│   │   ├── WhatsAppFloat.jsx
│   │   ├── CallFloat.jsx
│   │   ├── LoginModal.jsx
│   │   ├── Dashboard.jsx
│   │   └── [Dashboard Modules...]
│   ├── hooks/
│   │   └── useSEO.js
│   ├── assets/
│   ├── App.jsx
│   ├── config.js
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env          ← not committed
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── eslint.config.js
├── package.json
├── vercel.json
└── README.md
```

---

## Customization

### Contact Information
Update in the following files:
- **`src/components/Contact.jsx`** — `contactInfo` array, business hours, modal forms
- **`src/components/Footer.jsx`** — email, phone, address, social links
- **`src/components/WhatsAppFloat.jsx`** / **`CallFloat.jsx`** — phone numbers

### Services & Portfolio
- Edit the `services` array at the top of `Services.jsx` (outside the component)
- Edit the `projects` array at the top of `Portfolio.jsx` (outside the component)

### Team Members
- Edit the `team` array at the top of `OurTeam.jsx`
- Avatar URLs use [DiceBear Initials API](https://www.dicebear.com/styles/initials/)

### Styling
- Global design tokens are in `tailwind.config.js`
- Custom CSS in `src/index.css`
- All components use Tailwind utility classes

---

## Key Implementation Notes

- **Lucide icons** are `React.forwardRef` objects — always assign to a capitalized variable (`const Icon = item.icon`) before using as JSX (`<Icon />`)
- **Contact modals** use `createPortal(modal, document.body)` to escape Framer Motion stacking contexts and render correctly above all page content
- **ServiceModal** uses the same portal pattern — see `ServiceModal.jsx`
- **Routing** is hash/pathname based (no React Router) — handled in `App.jsx` via `popstate` events

---

## Roadmap

- [x] Contact form backend integration
- [x] Multiple contact forms (General, Project, Schedule Call)
- [x] Form validation and error handling
- [x] Email notifications with auto-reply
- [x] SEO meta tags (dynamic per page)
- [x] Floating WhatsApp & Call buttons
- [x] Our Team page
- [x] Careers page
- [x] Legal pages (Privacy Policy, Terms of Service)
- [x] Portal-based modals (no stacking context issues)
- [x] Role-based Authentication & Login Modal
- [x] Admin & Employee Dashboard implementation
- [x] HR, Payroll, Leave, and Salary Management
- [x] Document Management with file uploads
- [x] Career Portal backend integration (Job Management)
- [ ] Blog / Articles section
- [ ] Testimonials section
- [ ] Dark mode toggle
- [x] Analytics integration (Dashboard role-based reporting)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Contact & Support

- **Email**: dushyant.kumar1719@gmail.com
- **Phone**: +91 7983614392
- **Address**: Ram Ghat Road, Aligarh (202001)

---

Built with ❤️ by the DigitalTechSolution Team
