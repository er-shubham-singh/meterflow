import { simulatorService } from '../services/simulatorService.js';

export class SimulatorController {
  static start(req, res, next) {
    try {
      const { rate, scenario } = req.body;
      const status = simulatorService.start(Number(rate) || 20, scenario || 'mixed');
      return res.status(200).json({ status: 'success', data: status });
    } catch (err) {
      next(err);
    }
  }

  static stop(req, res, next) {
    try {
      const status = simulatorService.stop();
      return res.status(200).json({ status: 'success', data: status });
    } catch (err) {
      next(err);
    }
  }

  static burst(req, res, next) {
    try {
      const { count, scenario, customerId } = req.body;
      const result = simulatorService.triggerBurst(
        Number(count) || 50,
        scenario || 'mixed',
        customerId || null
      );
      return res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  static getStatus(req, res, next) {
    try {
      const status = simulatorService.getStatus();
      return res.status(200).json({ status: 'success', data: status });
    } catch (err) {
      next(err);
    }
  }
}
