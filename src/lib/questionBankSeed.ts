import { QuestionItem } from '../types';

export const SEED_QUESTION_BANK: QuestionItem[] = [
  // Physics Questions
  {
    id: 'q-phy-1',
    subject: 'Physics',
    chapter: 'Kinematics',
    questionText: 'A particle starts from rest with a uniform acceleration of 2 m/s². The distance traveled by the particle in the 5th second is:',
    options: ['9 m', '10 m', '19 m', '25 m'],
    correctOptionIndex: 0,
    explanation: 'Distance in nth second: S_n = u + a/2 * (2n - 1). Here u = 0, a = 2, n = 5. S_5 = 0 + (2/2) * (2*5 - 1) = 9 meters.',
    difficulty: 'Easy',
    year: 'NEET 2022',
    isBookmarked: false
  },
  {
    id: 'q-phy-2',
    subject: 'Physics',
    chapter: 'Electrostatics',
    questionText: 'Two point charges +4q and +q are placed at a distance L apart. A third point charge Q is placed at the midpoint between them. For the system to be in equilibrium, the value of Q must be:',
    options: ['-q', '-4q/9', '+q/2', '-q/4'],
    correctOptionIndex: 1,
    explanation: 'For equilibrium of +q at the right end: k*(4q)*(q)/L^2 + k*Q*q/(L/2)^2 = 0 => 4q/L^2 + 4Q/L^2 = 0 => Q = -q/4 (or calculating exact position at 2L/3 gives Q = -4q/9).',
    difficulty: 'Hard',
    year: 'NEET 2021',
    isBookmarked: true
  },
  {
    id: 'q-phy-3',
    subject: 'Physics',
    chapter: 'Current Electricity',
    questionText: 'In a Wheatstone bridge circuit, P = 2 Ω, Q = 3 Ω, R = 6 Ω and S = 9 Ω. The current flowing through the galvanometer connected between the two junctions is:',
    options: ['Maximum', 'Zero', 'Depends on battery voltage', 'Infinite'],
    correctOptionIndex: 1,
    explanation: 'Since P/Q = 2/3 and R/S = 6/9 = 2/3, the bridge is balanced. Hence, no potential difference exists across the galvanometer and current is zero.',
    difficulty: 'Easy',
    year: 'NEET 2023',
    isBookmarked: false
  },

  // Chemistry Questions
  {
    id: 'q-chem-1',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding and Molecular Structure',
    questionText: 'Which of the following molecules has a square planar shape according to VSEPR theory?',
    options: ['SF4', 'XeF4', 'BF4-', 'SiF4'],
    correctOptionIndex: 1,
    explanation: 'XeF4 has 8 valence electrons on Xenon + 4 from Fluorine = 12 electrons = 6 electron pairs (4 bond pairs + 2 lone pairs). Sp3d2 hybridization with lone pairs at axial positions gives a square planar geometry.',
    difficulty: 'Moderate',
    year: 'NEET 2023',
    isBookmarked: true
  },
  {
    id: 'q-chem-2',
    subject: 'Chemistry',
    chapter: 'Some Basic Concepts of Chemistry',
    questionText: 'The number of moles of hydrogen gas produced when 5.4 g of aluminum reacts completely with excess aqueous NaOH is:',
    options: ['0.1 mol', '0.2 mol', '0.3 mol', '0.6 mol'],
    correctOptionIndex: 2,
    explanation: 'Reaction: 2Al + 2NaOH + 6H2O -> 2Na[Al(OH)4] + 3H2. Moles of Al = 5.4 / 27 = 0.2 mol. 2 mol Al yields 3 mol H2, so 0.2 mol Al yields (3/2)*0.2 = 0.3 mol H2.',
    difficulty: 'Moderate',
    year: 'NEET 2022',
    isBookmarked: false
  },
  {
    id: 'q-chem-3',
    subject: 'Chemistry',
    chapter: 'Some Basic Principles of Organic Chemistry',
    questionText: 'Which among the following carbocations is most stable due to maximum hyperconjugation and resonance?',
    options: ['(CH3)3C+', '(C6H5)3C+', 'CH3-CH2+', '(CH3)2CH+'],
    correctOptionIndex: 1,
    explanation: 'Triphenylmethyl carbocation (C6H5)3C+ is stabilized by extensive resonance delocalization across 3 benzene rings (9 canonical forms).',
    difficulty: 'Easy',
    year: 'NEET 2020',
    isBookmarked: false
  },

  // Botany Questions
  {
    id: 'q-bot-1',
    subject: 'Botany',
    chapter: 'Cell: The Unit of Life',
    questionText: 'Which of the following cell organelles is NOT enclosed by any membrane?',
    options: ['Lysosome', 'Ribosome', 'Peroxisome', 'Vacuole'],
    correctOptionIndex: 1,
    explanation: 'Ribosomes and centrosomes are non-membrane bound organelles found in both prokaryotic and eukaryotic cells.',
    difficulty: 'Easy',
    year: 'NEET 2021',
    isBookmarked: false
  },
  {
    id: 'q-bot-2',
    subject: 'Botany',
    chapter: 'Principles of Inheritance and Variation',
    questionText: 'In a cross between two heterozygous tall pea plants (Tt), what percentage of the offspring are expected to be homozygous tall?',
    options: ['25%', '50%', '75%', '100%'],
    correctOptionIndex: 0,
    explanation: 'Tt x Tt cross yields genotypes: 1 TT : 2 Tt : 1 tt. The homozygous tall (TT) proportion is 1/4 = 25%.',
    difficulty: 'Easy',
    year: 'NEET 2022',
    isBookmarked: false
  },
  {
    id: 'q-bot-3',
    subject: 'Botany',
    chapter: 'Photosynthesis in Higher Plants',
    questionText: 'The primary CO2 acceptor in C4 plants during the dark reactions is:',
    options: ['Ribulose 1,5-bisphosphate (RuBP)', 'Phosphoenolpyruvate (PEP)', 'Oxaloacetic acid (OAA)', 'Phosphoglyceric acid (PGA)'],
    correctOptionIndex: 1,
    explanation: 'In C4 plants, the primary CO2 acceptor is 3-carbon molecule Phosphoenolpyruvate (PEP) catalyzed by PEP carboxylase (PEPcase) in the mesophyll cells.',
    difficulty: 'Moderate',
    year: 'NEET 2023',
    isBookmarked: true
  },

  // Zoology Questions
  {
    id: 'q-zoo-1',
    subject: 'Zoology',
    chapter: 'Body Fluids and Circulation',
    questionText: 'In a standard ECG, the QRS complex represents:',
    options: ['Atrial depolarization', 'Ventricular depolarization', 'Ventricular repolarization', 'Atrial repolarization'],
    correctOptionIndex: 1,
    explanation: 'The P-wave represents atrial depolarization. The QRS complex represents ventricular depolarization which initiates ventricular contraction. The T-wave represents ventricular repolarization.',
    difficulty: 'Easy',
    year: 'NEET 2022',
    isBookmarked: false
  },
  {
    id: 'q-zoo-2',
    subject: 'Zoology',
    chapter: 'Human Health and Disease',
    questionText: 'The infectious stage of Plasmodium that enters the human body through the bite of an infected female Anopheles mosquito is:',
    options: ['Trophozoite', 'Sporozoite', 'Merozoite', 'Gametocyte'],
    correctOptionIndex: 1,
    explanation: 'Sporozoites are stored in the salivary glands of female Anopheles mosquito and injected into human bloodstream during the bite.',
    difficulty: 'Easy',
    year: 'NEET 2020',
    isBookmarked: false
  },
  {
    id: 'q-zoo-3',
    subject: 'Zoology',
    chapter: 'Excretory Products and Their Elimination',
    questionText: 'Which of the following hormone is responsible for facultative water reabsorption from the collecting duct of nephrons?',
    options: ['Aldosterone', 'Antidiuretic Hormone (ADH/Vasopressin)', 'Atrial Natriuretic Factor (ANF)', 'Renin'],
    correctOptionIndex: 1,
    explanation: 'ADH (Vasopressin) released from neurohypophysis increases water permeability of DCT and collecting duct, preventing diuresis.',
    difficulty: 'Moderate',
    year: 'NEET 2023',
    isBookmarked: true
  }
];
