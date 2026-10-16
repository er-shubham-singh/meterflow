export class EventView {
  static formatSingle(event) {
    return {
      status: 'success',
      data: {
        id: event.id,
        customerId: event.customerId,
        eventType: event.eventType,
        properties: event.properties,
        timestamp: event.timestamp,
        idempotencyKey: event.idempotencyKey,
        processedAt: event.processedAt
      }
    };
  }

  static formatList(events, total, page = 1, limit = 50) {
    return {
      status: 'success',
      data: events.map(e => ({
        id: e.id,
        customerId: e.customerId,
        eventType: e.eventType,
        properties: e.properties,
        timestamp: e.timestamp,
        processedAt: e.processedAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        count: events.length,
        total
      }
    };
  }

  static formatBatchResponse(ingestedCount, duplicatesDropped, durationMs) {
    return {
      status: 'success',
      message: `Successfully processed batch of events`,
      summary: {
        ingested: ingestedCount,
        duplicatesDropped,
        durationMs: Number(durationMs.toFixed(2)),
        throughputPerSec: durationMs > 0 ? Math.round((ingestedCount / durationMs) * 1000) : ingestedCount
      }
    };
  }

  static formatTelemetry(metrics) {
    return {
      status: 'success',
      telemetry: {
        totalIngested: metrics.totalIngested,
        totalDuplicatesDropped: metrics.totalDuplicatesDropped,
        eventsPerSecond: metrics.eventsPerSecond,
        averageLatencyMs: metrics.averageLatencyMs,
        activeStreams: metrics.activeStreams,
        uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
        timestamp: new Date().toISOString()
      }
    };
  }
}
