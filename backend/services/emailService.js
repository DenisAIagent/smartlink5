// services/emailService.js - Service d'emailing
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendSmartLinkCreated(userEmail, smartLink) {
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1DB954, #1ed760); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SmartLink créé avec succès! 🎉</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <img src="${smartLink.artwork}" style="width: 80px; height: 80px; border-radius: 8px; margin-right: 20px;" alt="Artwork">
            <div>
              <h2 style="margin: 0; color: #2d3748; font-size: 20px;">${smartLink.title}</h2>
              <p style="margin: 5px 0; color: #718096; font-size: 16px;">${smartLink.artist}</p>
            </div>
          </div>
          
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #4a5568; font-weight: 600;">Votre SmartLink:</p>
            <p style="margin: 5px 0; font-family: Monaco, monospace; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
              ${process.env.BASE_URL}/l/${smartLink.slug}
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin-bottom: 10px;">Plateformes détectées (${smartLink.platforms?.length || 0}):</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${(smartLink.platforms || []).map(platform => `
                <span style="background: #e2e8f0; padding: 5px 10px; border-radius: 4px; font-size: 12px; color: #4a5568;">
                  ${platform.name}
                </span>
              `).join('')}
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.BASE_URL}/analytics/${smartLink.id}" 
               style="background: #1DB954; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Voir les Analytics
            </a>
          </div>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"SmartLink" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `SmartLink créé: ${smartLink.artist} - ${smartLink.title}`,
      html
    });
  }

  async sendWeeklyReport(userEmail, reportData) {
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Rapport Hebdomadaire 📊</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Semaine du ${reportData.startDate} au ${reportData.endDate}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 8px;">
              <h3 style="margin: 0; color: #1DB954; font-size: 28px;">${reportData.totalViews}</h3>
              <p style="margin: 5px 0 0; color: #718096;">Total Vues</p>
            </div>
            <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 8px;">
              <h3 style="margin: 0; color: #1DB954; font-size: 28px;">${reportData.totalClicks}</h3>
              <p style="margin: 5px 0 0; color: #718096;">Total Clics</p>
            </div>
          </div>
          
          <h3 style="color: #2d3748; margin-bottom: 15px;">Top SmartLinks:</h3>
          ${(reportData.topLinks || []).map((link, index) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center;">
                <span style="background: #1DB954; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">
                  ${index + 1}
                </span>
                <div>
                  <h4 style="margin: 0; color: #2d3748;">${link.title}</h4>
                  <p style="margin: 2px 0; color: #718096; font-size: 14px;">${link.artist}</p>
                  <p style="margin: 2px 0; color: #1DB954; font-size: 12px;">${link.views} vues • ${link.clicks} clics</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"SmartLink" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Rapport Hebdomadaire SmartLink - ${reportData.totalViews} vues cette semaine`,
      html
    });
  }
}

module.exports = { EmailService };