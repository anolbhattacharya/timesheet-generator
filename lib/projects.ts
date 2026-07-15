import { Project } from '@/types';

// Three active products. allocationWeight is the share of each person's time that
// should land on the product across the period (must sum to 1).
// A future product will be added later; not modelled yet.
export const PROJECTS: Project[] = [
  {
    code: 'SPARK',
    name: 'Spark',
    description: 'AI Search Discovery Platform',
    allocationWeight: 0.3,
  },
  {
    code: 'RADIATE',
    name: 'Radiate',
    description: 'GEO Optimization Tool',
    allocationWeight: 0.1,
  },
  {
    code: 'EMBER',
    name: 'Ember',
    description: 'Alpha release — tested by internal users',
    allocationWeight: 0.6,
  },
];
