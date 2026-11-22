import { describe, expect, it } from 'vitest';
import { articleAnswer, canReadOrder, requiresHuman, supportSelection, handoffInput } from './support';

describe('support safeguards', () => {
  const order = { user_id: 'customer-a', order_number: '4L-120', customer_email: 'buyer@example.com' };
  it('never exposes another customer order despite matching number and email', () => {
    expect(canReadOrder(order, 'customer-b', '4L-120', 'buyer@example.com')).toBe(false);
    expect(canReadOrder(order, 'customer-a', '4L-120', 'buyer@example.com')).toBe(true);
  });
  it('requires a matching order number and email', () => {
    expect(canReadOrder(order, 'customer-a', '4L-120', 'other@example.com')).toBe(false);
    expect(canReadOrder(order, 'customer-a', 'other', 'buyer@example.com')).toBe(false);
  });
  it('escalates requests for a person', () => { expect(requiresHuman('Quiero hablar con una persona')).toBe(true); });
  it('escalates frustration', () => { expect(requiresHuman('Estoy frustrado, no me ayuda')).toBe(true); });
  it('escalates when documentation does not contain an answer', () => { expect(articleAnswer({ articleIds: [], handoff: false }).handoff).toBe(true); });
  it('rejects undocumented article IDs', () => { expect(supportSelection.safeParse({ articleIds: ['invented-policy'], handoff: false }).success).toBe(false); });
  it('escalates medical treatment requests', () => { expect(requiresHuman('Qué dosis debo tomar para la diabetes')).toBe(true); });
  it('requires contact information and issue summary for escalation', () => { expect(handoffInput.safeParse({ conversationId: 'e9038a18-aa49-4623-93d6-80207ad095bc', requestId: 'e9038a18-aa49-4623-93d6-80207ad095bc', name: '', email: '', orderNumber: '', summary: '' }).success).toBe(false); });
});