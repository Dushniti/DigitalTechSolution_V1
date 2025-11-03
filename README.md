# DigitalTechSolution - Company Portfolio Website

A modern, responsive company portfolio website built with React, Vite, and Tailwind CSS. This website showcases web development services with a clean, professional design and smooth animations.

## Features

- 🎨 **Modern Design**: Clean, professional layout with modern UI/UX principles
- 📱 **Fully Responsive**: Optimized for all devices and screen sizes
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and build times
- 🎭 **Smooth Animations**: Framer Motion animations for enhanced user experience
- 🎯 **SEO Optimized**: Proper meta tags and semantic HTML structure
- 🔧 **Modular Components**: Reusable React components for easy maintenance
- 📧 **Contact Forms**: Multiple contact forms with SMTP email integration
- 🔄 **Auto-Response**: Automatic thank you emails to form submitters
- 📞 **Phone Integration**: Mandatory phone number collection for better lead tracking

## Sections

1. **Navbar/Header** - Company logo and navigation menu
2. **Hero Section** - Eye-catching banner with call-to-action
3. **About Us** - Company description, mission, and values
4. **Services** - Showcase of offered services
5. **Portfolio** - Project showcase with filtering
6. **Contact** - Contact form and company information
7. **Footer** - Social links, quick links, and newsletter signup

## Technologies Used

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for React
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Dushniti/DigitalTechSolution_V1.git
cd digitaltechsolution
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. Set up environment variables:
   - Create a `.env` file in the server directory
   - Add the following variables:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   PORT=3000
   ```
   Note: For Gmail, you need to use an App Password. Enable 2-factor authentication and generate an App Password from your Google Account settings.

4. Start both servers:
```bash
# Start the backend server (in server directory)
cd server
npm start

# Start the frontend development server (in another terminal)
cd ..
npm run dev
```

5. Open your browser and navigate to:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
digitaltechsolution/
├── public/
│   ├── favicon.svg
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Portfolio.jsx
│   │   ├── Contact.jsx
│   │   ├── ServiceModal.jsx
│   │   └── Footer.jsx
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx
│   ├── main.jsx
│   ├── config.js
│   └── index.css
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── README.md
```

## Customization

### Colors
The primary color scheme can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... other shades
  }
}
```

### Content
Update the content in each component file to match your company's information:
- Company name and logo
- Services offered
- Portfolio projects
- Contact information
- Social media links

### Styling
The website uses Tailwind CSS utility classes. You can modify the styling by:
- Updating classes in component files
- Adding custom CSS in `src/index.css`
- Extending the Tailwind configuration

## Features to Add

- [x] Contact form backend integration
- [ ] Blog section
- [ ] Testimonials section
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Analytics integration
- [x] Performance optimizations
- [x] Email notifications system
- [x] Multiple contact forms (General, Project, Schedule Call)
- [x] Form validation and error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions, please contact:
- Email: hello@digitaltechsolution.com
- Phone: +91 9761325797

---

Built with ❤️ by DigitalTechSolution Team
