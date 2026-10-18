import { gatewayService } from '../services/gatewayService.js';

export const gatewayController = {
  /**
   * POST /api/v1/gateway/proxy
   * Universal API Gateway execution endpoint for playground and apps
   */
  async handleProxy(req, res) {
    try {
      const authHeader = req.headers.authorization || '';
      const apiKeyFromHeader = authHeader.replace(/^Bearer\s+/i, '');
      const { apiKey: apiKeyFromBody, provider, method, endpoint, headers, body } = req.body;

      const apiKey = apiKeyFromHeader || apiKeyFromBody;

      const result = await gatewayService.processRequest({
        apiKey,
        provider,
        method,
        endpoint,
        headers,
        body
      });

      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      return res.status(500).json({
        error: {
          message: error.message || 'Gateway Internal Execution Error',
          type: 'gateway_error'
        }
      });
    }
  }
};

export default gatewayController;
