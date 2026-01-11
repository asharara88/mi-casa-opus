// ============================================
// EVENT LOG SPINE - APPEND-ONLY AUDIT TRAIL
// ============================================

import { EventLogEntry, UserRole } from '@/types/bos';

// Simple hash function for demo (production would use crypto)
function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

// In-memory event log (would be database in production)
let eventLog: EventLogEntry[] = [];
let lastEventHash: string | null = null;

const RULE_SET_VERSION = '1.0.0';

export function createEventLogEntry(
  actorUserId: string,
  actorRole: UserRole,
  entityType: string,
  entityId: string,
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  decision: 'ALLOWED' | 'BLOCKED',
  blockReasons: string[] = []
): EventLogEntry {
  const timestamp = new Date().toISOString();
  
  const eventData = {
    timestamp,
    actor_user_id: actorUserId,
    actor_role: actorRole,
    entity_ref: { entity_type: entityType, entity_id: entityId },
    action,
    before,
    after,
    rule_set_version: RULE_SET_VERSION,
    decision,
    block_reasons: blockReasons,
    prev_event_hash: lastEventHash,
  };
  
  const eventHash = generateHash(JSON.stringify(eventData));
  const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const entry: EventLogEntry = {
    event_id: eventId,
    ...eventData,
    event_hash: eventHash,
  };
  
  eventLog.push(entry);
  lastEventHash = eventHash;
  
  return entry;
}

export function getEventLog(): EventLogEntry[] {
  return [...eventLog];
}

export function getEventsByEntity(entityType: string, entityId: string): EventLogEntry[] {
  return eventLog.filter(
    e => e.entity_ref.entity_type === entityType && e.entity_ref.entity_id === entityId
  );
}

export function getEventsByActor(actorUserId: string): EventLogEntry[] {
  return eventLog.filter(e => e.actor_user_id === actorUserId);
}

export function verifyEventChain(): { valid: boolean; brokenAt?: string } {
  let prevHash: string | null = null;
  
  for (const event of eventLog) {
    if (event.prev_event_hash !== prevHash) {
      return { valid: false, brokenAt: event.event_id };
    }
    prevHash = event.event_hash;
  }
  
  return { valid: true };
}

// Initialize with some demo events
export function initializeDemoEventLog() {
  createEventLogEntry(
    'SYSTEM',
    'Operator',
    'BrokerageContext',
    'BRK-001',
    'SYSTEM_INITIALIZED',
    null,
    { brokerage_id: 'BRK-001', trade_name: 'Mi Casa Real Estate' },
    'ALLOWED'
  );
}
