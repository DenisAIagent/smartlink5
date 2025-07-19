const SmartLink = require('../models/SmartLink');

class LinkService {
  async createLink(linkData) {
    try {
      // Vérifier si le slug existe déjà
      const existingLink = await SmartLink.findOne({ slug: linkData.slug });
      if (existingLink) {
        throw new Error('Slug already exists');
      }
      
      // Transformer la structure plate en structure imbriquée pour MongoDB
      const transformedData = {
        ...linkData,
        analytics: {
          gtmId: linkData.gtmId || '',
          ga4Id: linkData.ga4Id || '',
          googleAdsId: linkData.googleAdsId || ''
        }
      };
      
      // Supprimer les champs plats
      delete transformedData.gtmId;
      delete transformedData.ga4Id;
      delete transformedData.googleAdsId;
      
      // Créer le nouveau lien
      const newLink = new SmartLink(transformedData);
      const savedLink = await newLink.save();
      
      return savedLink;
    } catch (error) {
      throw error;
    }
  }
  
  async getAllLinks() {
    try {
      const links = await SmartLink.find().sort({ createdAt: -1 });
      return links;
    } catch (error) {
      throw error;
    }
  }
  
  async getLinkBySlug(slug) {
    try {
      const link = await SmartLink.findOne({ slug });
      return link;
    } catch (error) {
      throw error;
    }
  }
  
  async incrementView(slug) {
    try {
      const link = await SmartLink.findOneAndUpdate(
        { slug },
        { $inc: { 'clickStats.totalViews': 1 } },
        { new: true }
      );
      return link;
    } catch (error) {
      throw error;
    }
  }
  
  async incrementClick(slug, platform) {
    try {
      const link = await SmartLink.findOne({ slug });
      if (!link) {
        throw new Error('Link not found');
      }
      
      // Incrémenter le compteur pour la plateforme
      const currentClicks = link.clickStats.clicks.get(platform) || 0;
      link.clickStats.clicks.set(platform, currentClicks + 1);
      
      await link.save();
      return link;
    } catch (error) {
      throw error;
    }
  }
  
  async checkSlugAvailability(slug) {
    try {
      const existingLink = await SmartLink.findOne({ slug });
      return !existingLink;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new LinkService();

