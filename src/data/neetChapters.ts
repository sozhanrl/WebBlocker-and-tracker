export type NeetSubjectName = 'Physics' | 'Chemistry' | 'Botany' | 'Zoology';

export type NeetChapterStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Needs Revision';

export interface NeetChapterRecord {
  id: string;
  subject: NeetSubjectName;
  name: string;
  status: NeetChapterStatus;
  completion_percentage: number;
  questions_solved: number;
  correct_answers: number;
  incorrect_answers: number;
  revision_count: number;
  planned_date: string | null;
  completed_date: string | null;
  last_studied_date: string | null;
  notes: string;
  last_updated: string | null;
  class_level?: 'Class 11' | 'Class 12';
  weightage_percentage?: number;
}

export const PHYSICS_CHAPTERS: string[] = [
  'Physics and Measurement',
  'Kinematics',
  'Laws of Motion',
  'Work, Energy and Power',
  'Rotational Motion',
  'Gravitation',
  'Properties of Solids and Liquids',
  'Thermodynamics',
  'Kinetic Theory of Gases',
  'Oscillations and Waves',
  'Electrostatics',
  'Current Electricity',
  'Magnetic Effects of Current and Magnetism',
  'Electromagnetic Induction and Alternating Currents',
  'Electromagnetic Waves',
  'Optics',
  'Dual Nature of Matter and Radiation',
  'Atoms and Nuclei',
  'Electronic Devices',
  'Experimental Skills'
];

export const CHEMISTRY_CHAPTERS: string[] = [
  'Some Basic Concepts of Chemistry',
  'Atomic Structure',
  'Chemical Bonding and Molecular Structure',
  'Chemical Thermodynamics',
  'Equilibrium',
  'Redox Reactions and Electrochemistry',
  'Solutions',
  'Chemical Kinetics',
  'Classification of Elements and Periodicity',
  'p-Block Elements',
  'd- and f-Block Elements',
  'Coordination Compounds',
  'Purification and Characterisation of Organic Compounds',
  'Basic Principles of Organic Chemistry',
  'Hydrocarbons',
  'Organic Compounds Containing Halogens',
  'Organic Compounds Containing Oxygen',
  'Organic Compounds Containing Nitrogen',
  'Biomolecules',
  'Principles Related to Practical Chemistry'
];

export const BOTANY_CHAPTERS: string[] = [
  'The Living World',
  'Biological Classification',
  'Plant Kingdom',
  'Morphology of Flowering Plants',
  'Anatomy of Flowering Plants',
  'Cell: The Unit of Life',
  'Biomolecules',
  'Cell Cycle and Cell Division',
  'Transport in Plants',
  'Mineral Nutrition',
  'Photosynthesis in Higher Plants',
  'Respiration in Plants',
  'Plant Growth and Development',
  'Sexual Reproduction in Flowering Plants',
  'Principles of Inheritance and Variation',
  'Molecular Basis of Inheritance',
  'Evolution',
  'Biotechnology: Principles and Processes',
  'Biotechnology and Its Applications',
  'Organisms and Populations',
  'Ecosystem',
  'Biodiversity and Conservation'
];

export const ZOOLOGY_CHAPTERS: string[] = [
  'Animal Kingdom',
  'Structural Organisation in Animals',
  'Human Physiology',
  'Breathing and Exchange of Gases',
  'Body Fluids and Circulation',
  'Excretory Products and Elimination',
  'Locomotion and Movement',
  'Neural Control and Coordination',
  'Chemical Coordination and Integration',
  'Human Reproduction',
  'Reproductive Health',
  'Principles of Inheritance and Variation',
  'Molecular Basis of Inheritance',
  'Evolution',
  'Human Health and Disease',
  'Animal Husbandry',
  'Microbes in Human Welfare',
  'Biotechnology and Its Applications',
  'Organisms and Populations',
  'Ecosystem',
  'Biodiversity and Conservation'
];

export const ALL_NEET_CHAPTERS_DATA: NeetChapterRecord[] = [
  ...PHYSICS_CHAPTERS.map((name, index) => ({
    id: `phy-${index + 1}`,
    subject: 'Physics' as const,
    name,
    status: 'Not Started' as const,
    completion_percentage: 0,
    questions_solved: 0,
    correct_answers: 0,
    incorrect_answers: 0,
    revision_count: 0,
    planned_date: null,
    completed_date: null,
    last_studied_date: null,
    notes: '',
    last_updated: null,
    class_level: index < 10 ? 'Class 11' as const : 'Class 12' as const,
    weightage_percentage: index === 1 || index === 4 || index === 10 || index === 15 ? 8 : 4
  })),
  ...CHEMISTRY_CHAPTERS.map((name, index) => ({
    id: `chem-${index + 1}`,
    subject: 'Chemistry' as const,
    name,
    status: 'Not Started' as const,
    completion_percentage: 0,
    questions_solved: 0,
    correct_answers: 0,
    incorrect_answers: 0,
    revision_count: 0,
    planned_date: null,
    completed_date: null,
    last_studied_date: null,
    notes: '',
    last_updated: null,
    class_level: index < 9 ? 'Class 11' as const : 'Class 12' as const,
    weightage_percentage: index === 2 || index === 4 || index === 7 || index === 11 ? 7 : 4
  })),
  ...BOTANY_CHAPTERS.map((name, index) => ({
    id: `bot-${index + 1}`,
    subject: 'Botany' as const,
    name,
    status: 'Not Started' as const,
    completion_percentage: 0,
    questions_solved: 0,
    correct_answers: 0,
    incorrect_answers: 0,
    revision_count: 0,
    planned_date: null,
    completed_date: null,
    last_studied_date: null,
    notes: '',
    last_updated: null,
    class_level: index < 13 ? 'Class 11' as const : 'Class 12' as const,
    weightage_percentage: index === 5 || index === 10 || index === 14 || index === 15 ? 7 : 4
  })),
  ...ZOOLOGY_CHAPTERS.map((name, index) => ({
    id: `zoo-${index + 1}`,
    subject: 'Zoology' as const,
    name,
    status: 'Not Started' as const,
    completion_percentage: 0,
    questions_solved: 0,
    correct_answers: 0,
    incorrect_answers: 0,
    revision_count: 0,
    planned_date: null,
    completed_date: null,
    last_studied_date: null,
    notes: '',
    last_updated: null,
    class_level: index < 9 ? 'Class 11' as const : 'Class 12' as const,
    weightage_percentage: index === 0 || index === 4 || index === 9 || index === 14 ? 7 : 4
  }))
];
