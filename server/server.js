import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://digitaltechsolution.in',
      'https://www.digitaltechsolution.in'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dushyant.kumar1719@gmail.com',
      subject: `New Message From ${name}`,
      html: `
        <h3>Digital Tech Solution - New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(adminMailOptions);

    // Auto-response email to submitter (only if email is provided)
    if (email) {
      const autoResponseOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank You for Contacting Digital Tech Solution',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank You for Contacting Digital Tech Solution</h2>
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to Digital Tech Solution. We have received your message and appreciate your interest in our services.</p>
            <p>Our team will review your inquiry and get back to you as soon as possible.</p>
            <p>For your reference, here's a copy of your message:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p>${message}</p>
            </div>
            <p>If you need immediate assistance, feel free to call us.</p>
            <div style="margin-top: 30px;">
              <p style="margin: 0;">Best Regards,</p>
              <p style="margin: 5px 0; color: #2563eb; font-weight: bold;">Digital Tech Solution Team</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(autoResponseOptions);
    }

    res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });
  } catch (error) {
    console.error('Error in contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Project request endpoint
app.post('/api/project', async (req, res) => {
  try {
    const { name, email, phone, company, projectType, budget, timeline, requirements } = req.body;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dushyant.kumar1719@gmail.com',
      subject: `New Project Request from ${name}`,
      html: `
        <h3>New Project Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company || 'Not specified'}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Budget Range:</strong> ${budget}</p>
        <p><strong>Timeline:</strong> ${timeline}</p>
        <p><strong>Project Requirements:</strong></p>
        <p>${requirements}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: 'Project request submitted successfully! We will contact you shortly.'
    });
  } catch (error) {
    console.error('Error in project request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit project request. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Schedule call endpoint
app.post('/api/schedule', async (req, res) => {
  try {
    const { name, email, phone, date, time, purpose } = req.body;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dushyant.kumar1719@gmail.com',
      subject: `New Call Schedule Request from ${name}`,
      html: `
        <h3>New Call Schedule Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Preferred Date:</strong> ${date}</p>
        <p><strong>Preferred Time:</strong> ${time}</p>
        <p><strong>Purpose:</strong></p>
        <p>${purpose}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: 'Call scheduled successfully! We will contact you shortly.'
    });
  } catch (error) {
    console.error('Error in schedule request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule call. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Verify email configuration on startup
  await verifyEmailConfig();
});
