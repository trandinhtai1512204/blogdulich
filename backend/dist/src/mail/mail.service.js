"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
let MailService = class MailService {
    resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    async sendBookingConfirmation(data) {
        const nights = Math.floor((data.checkOut.getTime() - data.checkIn.getTime()) / 86400000);
        await this.resend.emails.send({
            from: 'TripViet <no-reply@tripviet.vn>',
            to: data.toEmail,
            subject: `✅ Đặt phòng thành công - ${data.hotelName}`,
            html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
            <p style="color: white; font-size: 28px; margin: 0;">✈️</p>
            <h1 style="color: white; font-size: 20px; margin: 8px 0 0; font-weight: 700;">Đặt phòng thành công!</h1>
          </div>

          <p style="color: #374151; font-size: 15px;">Xin chào <strong>${data.toName}</strong>,</p>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Booking của bạn đã được xác nhận. Dưới đây là thông tin chi tiết:
          </p>

          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; font-size: 16px; margin: 0 0 16px; font-weight: 700;">${data.hotelName}</h2>

            <div style="display: grid; gap: 10px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-size: 13px;">📅 Nhận phòng</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">
                  ${data.checkIn.toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-size: 13px;">📅 Trả phòng</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">
                  ${data.checkOut.toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-size: 13px;">🌙 Số đêm</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">
                  ${nights} đêm
                </span>
              </div>

              <div style="border-top: 1px solid #f3f4f6; padding-top: 10px; display: flex; justify-content: space-between;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 700;">Tổng thanh toán</span>
                <span style="color: #7c3aed; font-size: 16px; font-weight: 800;">
                  $${data.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL}/my-bookings"
              style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; display: inline-block;">
              Xem booking của tôi →
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            TripViet · Đặt phòng khách sạn thông minh
          </p>
        </div>
      `,
        });
    }
    async sendVerificationEmail(data) {
        await this.resend.emails.send({
            from: 'TripViet <no-reply@tripviet.vn>',
            to: data.toEmail,
            subject: '✉️ Xác thực email của bạn - TripViet',
            html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
            <p style="color: white; font-size: 28px; margin: 0;">✉️</p>
            <h1 style="color: white; font-size: 20px; margin: 8px 0 0; font-weight: 700;">Xác thực email</h1>
          </div>

          <p style="color: #374151; font-size: 15px;">
            Xin chào <strong>${data.toName}</strong>,
          </p>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Cảm ơn bạn đã đăng ký TripViet! Vui lòng xác thực email trong vòng <strong>24 giờ</strong>.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.verifyUrl}"
              style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; display: inline-block;">
              Xác thực email →
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Link hết hạn sau 24 giờ. Nếu bạn không đăng ký, hãy bỏ qua email này.
          </p>
        </div>
      `,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map