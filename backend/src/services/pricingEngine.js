// Simple dynamic pricing: weekends +20%, holidays +30%, long stay discount (>3 nights -10%, >7 nights -15%)
const HOLIDAYS = [
  '01-01', // New Year
  '05-05', // Ethiopian Easter (approximate - you can expand)
  '09-11', // Ethiopian New Year
  '12-25', // Christmas
];

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday and Saturday (Ethiopia weekend)
};

const isHoliday = (date) => {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return HOLIDAYS.includes(mmdd);
};

export const calculatePrice = (
  basePricePerNight,
  checkIn,
  checkOut
) => {
  let total = 0;
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  let currentDate = new Date(checkIn);

  for (let i = 0; i < nights; i++) {
    let nightlyPrice = basePricePerNight;
    if (isWeekend(currentDate)) nightlyPrice *= 1.2; // +20%
    if (isHoliday(currentDate)) nightlyPrice *= 1.3; // +30%
    total += nightlyPrice;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Long stay discount
  if (nights >= 7) total *= 0.85; // 15% off for 7+ nights
  else if (nights >= 3) total *= 0.9; // 10% off for 3+ nights

  return Math.round(total);
};