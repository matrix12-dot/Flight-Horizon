import QRCode from 'qrcode';
import { AIRLINES, CABIN_LABELS } from '@/src/data/aviationData';
import { BookedTrip } from '@/src/types/aviation';
import { formatDateAr, formatPrice, getAirportByCode } from '@/src/utils/formatters';

export async function generateBoardingPassQrDataUrl(trip: BookedTrip): Promise<string> {
  const payload = JSON.stringify({
    pnr: trip.pnr,
    flight: trip.flight.flightNumber,
    from: trip.flight.origin,
    to: trip.flight.destination,
    date: trip.flight.departureDate,
    seats: trip.selectedSeats.join(','),
    passenger: trip.passengerDetails.fullName,
  });

  return QRCode.toDataURL(payload, {
    width: 320,
    margin: 1,
    color: {
      dark: '#070B19',
      light: '#F8FAFC',
    },
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function downloadBoardingPassPng(trip: BookedTrip): Promise<void> {
  const width = 1400;
  const height = 620;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const origin = getAirportByCode(trip.flight.origin);
  const dest = getAirportByCode(trip.flight.destination);
  const airline = AIRLINES[trip.flight.airlineCode];
  const qrDataUrl = await generateBoardingPassQrDataUrl(trip);

  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  // Outer canvas background
  ctx.fillStyle = '#070B19';
  ctx.fillRect(0, 0, width, height);

  // Main boarding pass card
  const cardX = 36;
  const cardY = 36;
  const cardW = width - 72;
  const cardH = height - 72;

  const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  bgGrad.addColorStop(0, '#0E172E');
  bgGrad.addColorStop(0.55, '#0B1224');
  bgGrad.addColorStop(1, '#0F1B35');

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = bgGrad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.stroke();

  // Top header bar inside card
  drawRoundedRect(ctx, cardX, cardY, cardW, 88, 28);
  ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
  ctx.fill();

  // Divider line under header
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + 88);
  ctx.lineTo(cardX + cardW, cardY + 88);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Vertical perforation line for stub on the left (RTL stub on left side)
  const stubDividerX = cardX + 360;
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(stubDividerX, cardY + 18);
  ctx.lineTo(stubDividerX, cardY + cardH - 18);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Header text - right side (main pass)
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 28px Cairo, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('أفق للطيران  |  بطاقة صعود إلكترونية', cardX + cardW - 40, cardY + 55);

  // Header text - flight info
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${trip.flight.flightNumber}  ·  ${airline?.nameEn || ''}`, stubDividerX + 36, cardY + 54);

  // Stub header
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 18px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('مرجع الحجز (PNR)', cardX + 180, cardY + 36);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 26px "IBM Plex Mono", monospace';
  ctx.fillText(trip.pnr, cardX + 180, cardY + 70);

  // Left Stub: QR Code container
  const qrSize = 230;
  const qrX = cardX + 180 - qrSize / 2;
  const qrY = cardY + 124;
  drawRoundedRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 20);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Stub footer details
  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 18px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('امسح الرمز عند بوابة الصعود', cardX + 180, cardY + 412);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 22px "IBM Plex Mono", monospace';
  ctx.fillText(
    `${trip.flight.origin}  →  ${trip.flight.destination}`,
    cardX + 180,
    cardY + 455
  );

  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 18px Cairo, sans-serif';
  ctx.fillText(
    `المقاعد: ${trip.selectedSeats.join(' , ')}`,
    cardX + 180,
    cardY + 495
  );

  // Main Pass Content (Right of stubDividerX)
  const mainRightX = cardX + cardW - 44;
  const mainLeftX = stubDividerX + 44;
  const mainCenterX = (mainRightX + mainLeftX) / 2;

  // Origin IATA (Right in RTL)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 64px "IBM Plex Mono", monospace';
  ctx.fillText(origin.code, mainRightX, cardY + 185);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 22px Cairo, sans-serif';
  ctx.fillText(origin.cityAr, mainRightX, cardY + 220);

  // Destination IATA (Left in RTL)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 64px "IBM Plex Mono", monospace';
  ctx.fillText(dest.code, mainLeftX, cardY + 185);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 22px Cairo, sans-serif';
  ctx.fillText(dest.cityAr, mainLeftX, cardY + 220);

  // Center flight path line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mainLeftX + 165, cardY + 168);
  ctx.lineTo(mainRightX - 165, cardY + 168);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillText(`${trip.flight.departureTime}  ←  ${trip.flight.arrivalTime}`, mainCenterX, cardY + 150);
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 18px Cairo, sans-serif';
  ctx.fillText(
    `${airline?.nameAr || ''} · ${CABIN_LABELS[trip.flight.cabinClass]}`,
    mainCenterX,
    cardY + 205
  );

  // Horizontal hairline
  ctx.beginPath();
  ctx.moveTo(mainLeftX, cardY + 265);
  ctx.lineTo(mainRightX, cardY + 265);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Grid of passenger and gate metadata
  const drawField = (
    label: string,
    value: string,
    x: number,
    y: number,
    align: CanvasTextAlign = 'right',
    accent = false
  ) => {
    ctx.textAlign = align;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 17px Cairo, sans-serif';
    ctx.fillText(label, x, y);
    ctx.fillStyle = accent ? '#38BDF8' : '#F8FAFC';
    ctx.font = 'bold 24px Cairo, sans-serif';
    ctx.fillText(value, x, y + 36);
  };

  drawField('اسم المسافر', trip.passengerDetails.fullName, mainRightX, cardY + 312, 'right');
  drawField('رقم الجواز', trip.passengerDetails.passportNumber, mainCenterX + 80, cardY + 312, 'right');
  drawField('تاريخ الإقلاع', formatDateAr(trip.flight.departureDate), mainLeftX, cardY + 312, 'left');

  drawField('رقم المقعد', trip.selectedSeats.join(' , '), mainRightX, cardY + 422, 'right', true);
  drawField('البوابة والمبنى', `${trip.flight.gate} · ${trip.flight.terminal}`, mainCenterX + 80, cardY + 422, 'right');
  drawField('وقت الصعود', trip.flight.boardingTime, mainLeftX, cardY + 422, 'left', true);

  // Subtle price watermark/receipt note in bottom left of main section
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = '500 16px Cairo, sans-serif';
  ctx.fillText(
    `إجمالي التذكرة: ${formatPrice(trip.totalPriceUsd, trip.currencyAtBooking)}`,
    mainLeftX,
    cardY + cardH - 22
  );

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `ofoq-boarding-pass-${trip.pnr}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
