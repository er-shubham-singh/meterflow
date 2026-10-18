import { memoryStore } from '../data/seed.js';

export const providerController = {
  /**
   * GET /api/v1/providers
   * List connected API providers and health
   */
  async listProviders(req, res) {
    try {
      const providers = Array.from(memoryStore.apiProviders.values());
      res.status(200).json({ success: true, data: providers });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default providerController;
