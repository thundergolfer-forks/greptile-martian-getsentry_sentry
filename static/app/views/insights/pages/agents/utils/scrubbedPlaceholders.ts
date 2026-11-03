import type {TraceItemDetailsMeta} from 'sentry/views/explore/hooks/useTraceItemDetails';
import {TraceItemMetaInfo} from 'sentry/views/explore/utils';
import {getStringAttr} from 'sentry/views/insights/pages/agents/utils/aiTraceNodes';
import type {AITraceSpanNode} from 'sentry/views/insights/pages/agents/utils/types';

/** Mirrors `sentry.search.eap.constants.META_ATTRIBUTE_PREFIX`. */
const META_ATTRIBUTE_PREFIX = 'sentry._meta.fields.attributes';

/** The attributes whose meta the conversation endpoint returns. */
const SCRUBBED_MESSAGE_ATTRIBUTES = [
  'gen_ai.input.messages',
  'gen_ai.output.messages',
  'gen_ai.tool.call.arguments',
  'gen_ai.tool.call.result',
];

// Relay's replacements are bracketed, like `[email]` or `[Filtered]`. A range that
// doesn't cover one doesn't line up with the value, so it's ignored.
const PLACEHOLDER_PATTERN = /^\[[^[\]\s]+\]$/;

export interface ScrubbedPlaceholder {
  remark: string;
  ruleId: string;
}

/** Replacement texts that Relay inserted, like `[email]`, with the rule that did it. */
export type ScrubbedPlaceholders = ReadonlyMap<string, ScrubbedPlaceholder>;

export const NO_SCRUBBED_PLACEHOLDERS: ScrubbedPlaceholders = new Map();

/** Turns the endpoint's `meta` into node attributes under their meta attribute names. */
export function getMetaAttributes(
  meta: TraceItemDetailsMeta | undefined
): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [attribute, record] of Object.entries(meta ?? {})) {
    attributes[`${META_ATTRIBUTE_PREFIX}.${attribute}`] = JSON.stringify(record);
  }
  return attributes;
}

/** The remarks' ranges point into the stored values, so `getValue` must return those. */
export function resolveScrubbedPlaceholders(
  meta: TraceItemDetailsMeta | undefined,
  getValue: (attribute: string) => unknown
): ScrubbedPlaceholders {
  if (!meta) {
    return NO_SCRUBBED_PLACEHOLDERS;
  }

  const metaInfo = new TraceItemMetaInfo(meta);
  const placeholders = new Map<string, ScrubbedPlaceholder>();
  for (const attribute of Object.keys(meta)) {
    const value = getValue(attribute);
    if (typeof value !== 'string') {
      continue;
    }
    for (const {ruleId, type, rangeStart, rangeEnd} of metaInfo.getRemarks(attribute)) {
      const text = value.slice(rangeStart, rangeEnd);
      if (PLACEHOLDER_PATTERN.test(text)) {
        placeholders.set(text, {remark: type, ruleId});
      }
    }
  }
  return placeholders;
}

/**
 * Resolve from the nodes as stored, before the transcript moves messages between
 * nodes, so the ranges still line up.
 */
export function getScrubbedPlaceholders(node: AITraceSpanNode): ScrubbedPlaceholders {
  const meta: TraceItemDetailsMeta = {};
  for (const attribute of SCRUBBED_MESSAGE_ATTRIBUTES) {
    const rawMeta = getStringAttr(node, `${META_ATTRIBUTE_PREFIX}.${attribute}`);
    if (!rawMeta) {
      continue;
    }
    try {
      meta[attribute] = JSON.parse(rawMeta);
    } catch {
      // Unreadable meta just doesn't mark anything.
    }
  }
  return resolveScrubbedPlaceholders(meta, attribute => getStringAttr(node, attribute));
}
