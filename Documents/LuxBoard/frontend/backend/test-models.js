const mongoose = require('mongoose');
require('dotenv').config();

// Importer les modèles
const User = require('./models/User');
const Provider = require('./models/Provider');
const Offer = require('./models/Offer');
const Event = require('./models/Event');

const testModels = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion MongoDB réussie');

    // Test du modèle User
    console.log('\n🧪 Test du modèle User...');
    const testUser = new User({
      email: 'test@luxboard.com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    });

    // Valider sans sauvegarder
    await testUser.validate();
    console.log('✅ Modèle User valide');
    console.log('   - Nom complet:', testUser.fullName);
    console.log('   - Initiales:', testUser.initials);
    console.log('   - Permission admin:', testUser.hasPermission('admin'));

    // Test du modèle Provider
    console.log('\n🧪 Test du modèle Provider...');
    const testProvider = new Provider({
      name: 'Restaurant Le Test',
      type: 'restaurant',
      description: 'Un restaurant de test pour valider le modèle',
      address: {
        street: '123 Rue de Test',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      contact: {
        email: 'contact@restaurant-test.com',
        phone: '0123456789'
      },
      pricing: {
        level: '€€€',
        description: 'Cuisine gastronomique'
      },
      tags: ['gastronomique', 'paris', 'test'],
      createdBy: testUser._id
    });

    await testProvider.validate();
    console.log('✅ Modèle Provider valide');
    console.log('   - Adresse complète:', testProvider.fullAddress);

    // Test du modèle Offer
    console.log('\n🧪 Test du modèle Offer...');
    const testOffer = new Offer({
      title: 'Offre de test - 20% de réduction',
      description: 'Une offre de test pour valider le modèle',
      provider: testProvider._id,
      type: 'discount',
      value: {
        type: 'percentage',
        amount: 20,
        description: '20% de réduction sur l\'addition'
      },
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      conditions: 'Valable du lundi au jeudi, hors jours fériés',
      code: 'TEST20',
      maxUses: 100,
      tags: ['reduction', 'test'],
      createdBy: testUser._id
    });

    await testOffer.validate();
    console.log('✅ Modèle Offer valide');
    console.log('   - Statut:', testOffer.status);
    console.log('   - Est valide:', testOffer.isValid);
    console.log('   - Expire bientôt:', testOffer.expiresSoon);

    // Test du modèle Event
    console.log('\n🧪 Test du modèle Event...');
    const testEvent = new Event({
      title: 'Événement de test',
      description: 'Un événement de test pour valider le modèle',
      type: 'conference',
      dates: [{
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // Dans 8 jours
        description: 'Première session'
      }],
      location: {
        name: 'Centre de Conférences Test',
        address: '456 Avenue de Test',
        city: 'Paris',
        postalCode: '75002',
        country: 'France'
      },
      pricing: {
        isFree: false,
        basePrice: 150,
        currency: 'EUR',
        description: 'Tarif standard'
      },
      capacity: {
        max: 100
      },
      organizer: {
        name: 'LuxBoard Events',
        description: 'Organisateur d\'événements de luxe'
      },
      tags: ['conference', 'test', 'luxe'],
      createdBy: testUser._id
    });

    await testEvent.validate();
    console.log('✅ Modèle Event valide');
    console.log('   - Adresse complète:', testEvent.fullAddress);
    console.log('   - Est à venir:', testEvent.isUpcoming);
    console.log('   - Est complet:', testEvent.isFull);
    console.log('   - Prochaine date:', testEvent.nextDate);

    console.log('\n🎉 Tous les modèles sont valides !');

  } catch (error) {
    console.error('❌ Erreur lors du test des modèles:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
};

// Exécuter les tests
testModels();

