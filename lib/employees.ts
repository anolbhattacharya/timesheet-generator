import { Employee } from '@/types';

// Task categories are tagged CAPEX (development-phase work capitalised as IP under
// AASB 138.57) or OPEX (maintenance / support work expensed as incurred, AASB 138.68).
// Every employee has both, so the generator can hit the 68% CAPEX / 32% OPEX target.
export const EMPLOYEES: Employee[] = [
  {
    id: 'sumit',
    name: 'Sumit',
    role: 'Backend/DevOps Engineer',
    location: 'India',
    skills: ['MongoDB', 'NodeJS', 'DevOps'],
    tasks: [
      // CAPEX — building new product capability
      { description: 'New API endpoint design and development', costType: 'CAPEX' },
      { description: 'Database schema design for new features', costType: 'CAPEX' },
      { description: 'Building new backend services and microservices', costType: 'CAPEX' },
      { description: 'CI/CD automation for new product modules', costType: 'CAPEX' },
      { description: 'Infrastructure architecture for new features', costType: 'CAPEX' },
      // OPEX — keeping live products running
      { description: 'Production monitoring and incident response', costType: 'OPEX' },
      { description: 'Bug fixing and hotfix deployment', costType: 'OPEX' },
      { description: 'Security patching and dependency updates', costType: 'OPEX' },
      { description: 'Routine database backups and maintenance', costType: 'OPEX' },
    ],
  },
  {
    id: 'abhishek',
    name: 'Abhishek',
    role: 'AI Developer',
    location: 'India',
    skills: ['Python', 'AI Development'],
    tasks: [
      // CAPEX
      { description: 'New AI model development and training', costType: 'CAPEX' },
      { description: 'Feature engineering for new capabilities', costType: 'CAPEX' },
      { description: 'Building new algorithms and data pipelines', costType: 'CAPEX' },
      { description: 'Development of new product AI features', costType: 'CAPEX' },
      { description: 'Building model evaluation frameworks', costType: 'CAPEX' },
      // OPEX
      { description: 'Retraining models on production data drift', costType: 'OPEX' },
      { description: 'Debugging model inference issues', costType: 'OPEX' },
      { description: 'Maintaining existing data pipelines', costType: 'OPEX' },
      { description: 'Production model monitoring and tuning', costType: 'OPEX' },
    ],
  },
  {
    id: 'dhirendra',
    name: 'Dhirendra',
    role: 'AI Developer',
    location: 'India',
    skills: ['Python', 'AI Development'],
    tasks: [
      // CAPEX
      { description: 'New AI model development and training', costType: 'CAPEX' },
      { description: 'Feature engineering for new capabilities', costType: 'CAPEX' },
      { description: 'Building new algorithms and data pipelines', costType: 'CAPEX' },
      { description: 'Development of new product AI features', costType: 'CAPEX' },
      { description: 'Building model evaluation frameworks', costType: 'CAPEX' },
      // OPEX
      { description: 'Retraining models on production data drift', costType: 'OPEX' },
      { description: 'Debugging model inference issues', costType: 'OPEX' },
      { description: 'Maintaining existing data pipelines', costType: 'OPEX' },
      { description: 'Production model monitoring and tuning', costType: 'OPEX' },
    ],
  },
  {
    id: 'rajan',
    name: 'Rajan',
    role: 'Frontend Developer',
    location: 'India',
    skills: ['CSS', 'React', 'Frontend'],
    tasks: [
      // CAPEX
      { description: 'New React feature and component development', costType: 'CAPEX' },
      { description: 'Building new UI flows and screens', costType: 'CAPEX' },
      { description: 'Implementing new design system components', costType: 'CAPEX' },
      { description: 'Frontend development for new product modules', costType: 'CAPEX' },
      { description: 'Developing new interactive data visualisations', costType: 'CAPEX' },
      // OPEX
      { description: 'Cross-browser bug fixes on live product', costType: 'OPEX' },
      { description: 'UI maintenance and minor style updates', costType: 'OPEX' },
      { description: 'Accessibility fixes on existing screens', costType: 'OPEX' },
      { description: 'Frontend performance troubleshooting', costType: 'OPEX' },
    ],
  },
  {
    id: 'mainak',
    name: 'Mainak',
    role: 'Product Manager & Tester',
    location: 'India',
    skills: ['Product Management', 'QA', 'Testing'],
    tasks: [
      // CAPEX — specifying and validating new features (testing that a new asset
      // functions as intended is a directly attributable dev cost, AASB 138.66)
      { description: 'Requirements and specification for new features', costType: 'CAPEX' },
      { description: 'Acceptance test design for new features', costType: 'CAPEX' },
      { description: 'Test automation development for new modules', costType: 'CAPEX' },
      { description: 'Functional testing of new feature development', costType: 'CAPEX' },
      { description: 'User story and roadmap definition for new products', costType: 'CAPEX' },
      // OPEX — keeping live products stable, plus general PM admin
      { description: 'Regression testing on live products', costType: 'OPEX' },
      { description: 'Bug triage and defect verification', costType: 'OPEX' },
      { description: 'Production release validation and support', costType: 'OPEX' },
      { description: 'Backlog grooming and sprint administration', costType: 'OPEX' },
    ],
  },
];
