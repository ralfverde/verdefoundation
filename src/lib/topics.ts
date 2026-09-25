import type { Topic } from './site';

/** Placeholder color per topic, as in the prototype. */
export const TOPIC_VARIANT: Record<Topic, '' | 'sand' | 'navy'> = {
  'Orientación migratoria': '',
  'Navegar el sistema': 'sand',
  'Conoce tus derechos': 'navy',
};

/** /eventos?tema=... deep link for a topic. */
export const topicQuery = (topic: string) => `?tema=${encodeURIComponent(topic)}`;
