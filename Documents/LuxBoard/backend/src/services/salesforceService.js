const jsforce = require('jsforce');
const config = require('../config/salesforce');

class SalesforceService {
  constructor() {
    this.conn = new jsforce.Connection({
      loginUrl: config.loginUrl
    });
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await this.conn.login(config.username, config.password + config.securityToken);
      this.initialized = true;
      console.log('Connexion Salesforce établie avec succès');
    } catch (error) {
      console.error('Erreur de connexion Salesforce:', error);
      throw new Error('Impossible de se connecter à Salesforce');
    }
  }

  async createVendor(vendorData) {
    await this.initialize();

    try {
      // Création du compte prestataire
      const account = await this.conn.sobject('Account').create({
        Name: vendorData.name,
        Type: 'Vendor',
        Industry: vendorData.industry,
        BillingStreet: vendorData.address,
        BillingCity: vendorData.city,
        BillingPostalCode: vendorData.postalCode,
        Phone: vendorData.phone,
        Website: vendorData.website,
        Description: vendorData.description
      });

      // Création du contact principal
      const contact = await this.conn.sobject('Contact').create({
        AccountId: account.id,
        FirstName: vendorData.contactFirstName,
        LastName: vendorData.contactLastName,
        Email: vendorData.contactEmail,
        Phone: vendorData.contactPhone,
        Title: vendorData.contactTitle
      });

      // Création de l'opportunité
      const opportunity = await this.conn.sobject('Opportunity').create({
        AccountId: account.id,
        Name: `Nouveau partenariat - ${vendorData.name}`,
        StageName: 'Prospecting',
        CloseDate: new Date(),
        Type: 'New Business',
        Description: vendorData.description
      });

      return {
        accountId: account.id,
        contactId: contact.id,
        opportunityId: opportunity.id
      };
    } catch (error) {
      console.error('Erreur lors de la création du prestataire:', error);
      throw new Error('Impossible de créer le prestataire dans Salesforce');
    }
  }

  async updateVendor(vendorId, vendorData) {
    await this.initialize();

    try {
      const result = await this.conn.sobject('Account').update({
        Id: vendorId,
        ...vendorData
      });

      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prestataire:', error);
      throw new Error('Impossible de mettre à jour le prestataire dans Salesforce');
    }
  }

  async getVendor(vendorId) {
    await this.initialize();

    try {
      const vendor = await this.conn.sobject('Account')
        .retrieve(vendorId)
        .include('Contacts');

      return vendor;
    } catch (error) {
      console.error('Erreur lors de la récupération du prestataire:', error);
      throw new Error('Impossible de récupérer le prestataire depuis Salesforce');
    }
  }

  async searchVendors(query) {
    await this.initialize();

    try {
      const result = await this.conn.query(`
        SELECT Id, Name, Type, Industry, Phone, Website, Description,
               (SELECT Id, FirstName, LastName, Email, Phone, Title FROM Contacts)
        FROM Account
        WHERE Type = 'Vendor'
        AND (Name LIKE '%${query}%'
        OR Industry LIKE '%${query}%'
        OR Description LIKE '%${query}%')
        ORDER BY Name
        LIMIT 10
      `);

      return result.records;
    } catch (error) {
      console.error('Erreur lors de la recherche des prestataires:', error);
      throw new Error('Impossible de rechercher les prestataires dans Salesforce');
    }
  }

  async createCase(caseData) {
    await this.initialize();

    try {
      const caseRecord = await this.conn.sobject('Case').create({
        AccountId: caseData.vendorId,
        ContactId: caseData.contactId,
        Subject: caseData.subject,
        Description: caseData.description,
        Priority: caseData.priority,
        Origin: 'Web',
        Status: 'New',
        Type: 'Vendor Request'
      });

      return caseRecord;
    } catch (error) {
      console.error('Erreur lors de la création du cas:', error);
      throw new Error('Impossible de créer le cas dans Salesforce');
    }
  }

  async updateCaseStatus(caseId, status) {
    await this.initialize();

    try {
      const result = await this.conn.sobject('Case').update({
        Id: caseId,
        Status: status
      });

      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du cas:', error);
      throw new Error('Impossible de mettre à jour le statut du cas dans Salesforce');
    }
  }

  async getVendorCases(vendorId) {
    await this.initialize();

    try {
      const result = await this.conn.query(`
        SELECT Id, CaseNumber, Subject, Description, Status, Priority, CreatedDate
        FROM Case
        WHERE AccountId = '${vendorId}'
        ORDER BY CreatedDate DESC
      `);

      return result.records;
    } catch (error) {
      console.error('Erreur lors de la récupération des cas:', error);
      throw new Error('Impossible de récupérer les cas depuis Salesforce');
    }
  }
}

module.exports = new SalesforceService(); 