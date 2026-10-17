export class MeterView {
  static formatSingle(meter, aggregateData = null) {
    return {
      status: 'success',
      data: {
        id: meter.id,
        code: meter.code,
        name: meter.name,
        description: meter.description,
        eventType: meter.eventType,
        aggregationType: meter.aggregationType,
        valueProperty: meter.valueProperty,
        filterField: meter.filterField,
        filterValue: meter.filterValue,
        unit: meter.unit,
        active: meter.active,
        createdAt: meter.createdAt,
        currentAggregate: aggregateData ? {
          totalValue: aggregateData.value,
          unit: meter.unit,
          eventCount: aggregateData.eventCount,
          lastUpdated: aggregateData.lastUpdated
        } : null
      }
    };
  }

  static formatList(meters, aggregatesMap = {}, pagination = null) {
    return {
      status: 'success',
      count: meters.length,
      ...(pagination ? { pagination } : {}),
      data: meters.map(m => {
        const agg = aggregatesMap[m.code] || { value: 0, eventCount: 0 };
        return {
          id: m.id,
          code: m.code,
          name: m.name,
          description: m.description,
          eventType: m.eventType,
          aggregationType: m.aggregationType,
          valueProperty: m.valueProperty,
          filterField: m.filterField,
          filterValue: m.filterValue,
          unit: m.unit,
          active: m.active,
          currentValue: agg.value,
          eventCount: agg.eventCount
        };
      })
    };
  }
}
