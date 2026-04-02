import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingConfirmationEmail = async (to, booking) => {
  const mailOptions = {
    from: `"Hayday Hotel" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Booking Confirmation - Hayday Hotel',
    html: `
      <h1>Thank you for your booking!</h1>
      <p>Your booking is confirmed.</p>
      <p><strong>Room:</strong> ${booking.room.name}</p>
      <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toDateString()}</p>
      <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toDateString()}</p>
      <p><strong>Total Price:</strong> ${booking.totalPrice} ETB</p>
      <p>We look forward to hosting you!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};