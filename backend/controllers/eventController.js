import { Event } from '../models/Event.js';
import { EventView } from '../views/eventView.js';
import { meteringEngine } from '../services/meteringEngine.js';

/**
 * ==============================================================================
 * 📡 EVENT CONTROLLER (MVC)
 * ==============================================================================
 * Handles high-throughput event ingestion, batch processing, telemetry stats,
 * and Server-Sent Events (SSE) live streaming using Mongoose Event model.
 * ==============================================================================
 */
export class EventController {
  /**
   * POST /api/v1/events
   * Ingests a single billable telemetry event
   */
  static async ingestSingle(req, res, next) {
    try {
      const { customerId, eventType, properties, timestamp, idempotencyKey } = req.body;

      if (!customerId || !eventType) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed: customerId and eventType are required fields'
        });
      }

      const result = await meteringEngine.processEvent({
        customerId,
        eventType,
        properties: properties || {},
        timestamp: timestamp || new Date().toISOString(),
        idempotencyKey
      });

      if (result.duplicate) {
        return res.status(200).json({
          status: 'ignored',
          message: result.message,
          idempotencyKey: result.idempotencyKey
        });
      }

      return res.status(201).json({
        ...EventView.formatSingle(result.event),
        affectedMeters: result.affectedMeters,
        latencyMs: result.latencyMs
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/events/batch
   * Ingests high-throughput batch of events (up to 2,000 per request)
   */
  static async ingestBatch(req, res, next) {
    try {
      const { events } = req.body;
      if (!Array.isArray(events)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid payload: "events" must be an array'
        });
      }

      if (events.length > 2000) {
        return res.status(413).json({
          status: 'error',
          message: 'Batch limit exceeded: Maximum 2,000 events per batch'
        });
      }

      const result = await meteringEngine.processBatch(events);
      return res.status(200).json(
        EventView.formatBatchResponse(result.ingested, result.duplicates, result.durationMs)
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/events
   * Retrieves recent events from MongoDB / in-memory cache
   */
  static async getRecentEvents(req, res, next) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 200);
      const skip = (page - 1) * limit;
      const customerId = req.query.customerId || null;
      const eventType = req.query.eventType || null;

      // Query from MongoDB Event collection or engine cache
      const filter = {};
      if (customerId) filter.customerId = customerId;
      if (eventType && eventType !== 'ALL') {
        filter.eventType = new RegExp(`^${eventType}`);
      }

      let events = [];
      let total = 0;

      try {
        events = await Event.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
        total = await Event.countDocuments(filter);
      } catch {
        // Fallback to engine's buffer
        let allBuffered = meteringEngine.getRecentEvents(500, customerId);
        if (eventType && eventType !== 'ALL') {
          allBuffered = allBuffered.filter(e => e.eventType?.startsWith(eventType));
        }
        total = allBuffered.length;
        events = allBuffered.slice(skip, skip + limit);
      }

      return res.status(200).json(EventView.formatList(events, total, page, limit));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/events/stream
   * Real-time Server-Sent Events (SSE) telemetry pipeline
   */
  static streamEvents(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Subscribed to live event listener' })}\n\n`);

    meteringEngine.registerSseClient(res);
  }

  /**
   * GET /api/v1/events/telemetry
   * Current ingestion rates, events/sec, latency, and counts
   */
  static getTelemetry(req, res, next) {
    try {
      const telemetry = meteringEngine.getTelemetry();
      return res.status(200).json(EventView.formatTelemetry(telemetry));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/events/reset
   * Resets all usage counters, event history, and idempotency states
   */
  static async resetUsage(req, res, next) {
    try {
      await meteringEngine.resetAllUsage();
      return res.status(200).json({
        status: 'success',
        message: 'All usage metrics, event history, and idempotency guards reset successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default EventController;
