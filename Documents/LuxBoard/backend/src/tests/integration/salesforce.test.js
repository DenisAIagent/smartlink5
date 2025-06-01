const { expect } = require('chai');
const salesforceService = require('../../services/salesforceService');
const salesforceConfigService = require('../../services/salesforceConfigService');
const redis = require('../../config/redis');

describe('Salesforce Integration Tests', () => {
  before(async () => {
    // Configuration de test
    await salesforceConfigService.updateConfig({
      instanceUrl: process.env.TEST_SALESFORCE_URL,
      clientId: process.env.TEST_SALESFORCE_CLIENT_ID,
      clientSecret: process.env.TEST_SALESFORCE_CLIENT_SECRET,
      username: process.env.TEST_SALESFORCE_USERNAME,
      password: process.env.TEST_SALESFORCE_PASSWORD,
      securityToken: process.env.TEST_SALESFORCE_SECURITY_TOKEN,
      isActive: true
    });
  });

  after(async () => {
    // Nettoyage
    await redis.flushall();
  });

  describe('Vendor Management', () => {
    let testVendorId;

    it('should create a new vendor', async () => {
      const vendorData = {
        name: 'Test Vendor',
        type: 'Restaurant',
        status: 'Active',
        description: 'Test vendor description',
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        phone: '0123456789',
        website: 'https://test.com',
        contactFirstName: 'John',
        contactLastName: 'Doe',
        contactEmail: 'john@test.com',
        contactPhone: '0123456789',
        contactTitle: 'Manager'
      };

      const result = await salesforceService.createVendor(vendorData);
      expect(result).to.have.property('accountId');
      expect(result).to.have.property('contactId');
      expect(result).to.have.property('opportunityId');
      testVendorId = result.accountId;
    });

    it('should retrieve vendor details', async () => {
      const vendor = await salesforceService.getVendor(testVendorId);
      expect(vendor).to.have.property('Name', 'Test Vendor');
      expect(vendor).to.have.property('Type', 'Restaurant');
      expect(vendor).to.have.property('Status', 'Active');
    });

    it('should update vendor information', async () => {
      const updateData = {
        Name: 'Updated Test Vendor',
        Description: 'Updated description'
      };

      const result = await salesforceService.updateVendor(testVendorId, updateData);
      expect(result).to.be.true;

      const updatedVendor = await salesforceService.getVendor(testVendorId);
      expect(updatedVendor).to.have.property('Name', 'Updated Test Vendor');
      expect(updatedVendor).to.have.property('Description', 'Updated description');
    });

    it('should search vendors', async () => {
      const searchResults = await salesforceService.searchVendors('Test');
      expect(searchResults).to.be.an('array');
      expect(searchResults.length).to.be.greaterThan(0);
      expect(searchResults[0]).to.have.property('Name');
    });
  });

  describe('Case Management', () => {
    let testCaseId;

    it('should create a new case', async () => {
      const caseData = {
        vendorId: testVendorId,
        subject: 'Test Case',
        description: 'Test case description',
        priority: 'High'
      };

      const result = await salesforceService.createCase(caseData);
      expect(result).to.have.property('id');
      testCaseId = result.id;
    });

    it('should update case status', async () => {
      const result = await salesforceService.updateCaseStatus(testCaseId, 'In Progress');
      expect(result).to.be.true;

      const cases = await salesforceService.getVendorCases(testVendorId);
      const updatedCase = cases.find(c => c.Id === testCaseId);
      expect(updatedCase).to.have.property('Status', 'In Progress');
    });

    it('should retrieve vendor cases', async () => {
      const cases = await salesforceService.getVendorCases(testVendorId);
      expect(cases).to.be.an('array');
      expect(cases.length).to.be.greaterThan(0);
      expect(cases[0]).to.have.property('Subject');
      expect(cases[0]).to.have.property('Status');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid vendor ID', async () => {
      try {
        await salesforceService.getVendor('invalid-id');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Impossible de récupérer le prestataire');
      }
    });

    it('should handle invalid case ID', async () => {
      try {
        await salesforceService.updateCaseStatus('invalid-id', 'New');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Impossible de mettre à jour le statut du cas');
      }
    });
  });
}); 