export const programOptions = [
  { id: 'BSA', name: 'Bachelor of Science in Accountancy' },
  { id: 'BSBIO', name: 'Bachelor of Science in Biology' },
  { id: 'BSCE', name: 'Bachelor of Science in Civil Engineering' },
  { id: 'BSCPE', name: 'Bachelor of Science in Computer Engineering' },
  { id: 'BSCS', name: 'Bachelor of Science in Computer Science' },
  { id: 'BSDC', name: 'Bachelor of Science in Development Communication' },
  { id: 'BSECE', name: 'Bachelor of Science in Electronics Engineering' },
  { id: 'BSENTREP-TOURISM', name: 'Bachelor of Science in Entrepreneurship Specialized Track on Tourism' },
  { id: 'BSIS', name: 'Bachelor of Science in Information Systems' },
  { id: 'BSIT', name: 'Bachelor of Science in Information Technology' },
  { id: 'BSMATH', name: 'Bachelor of Science in Mathematics' },
  { id: 'BSN', name: 'Bachelor of Science in Nursing' },
  { id: 'BSPSYCH', name: 'Bachelor of Science in Psychology' },
  { id: 'BSTM', name: 'Bachelor of Science in Tourism Management' },
  { id: 'BSBA-AIM', name: 'Bachelor of Science in Business Administration major in Accounting Information Management' },
  { id: 'BSBA-BF', name: 'Bachelor of Science in Business Administration major in Banking and Finance' },
  { id: 'BSBA-BMHP', name: 'Bachelor of Science in Business Administration major in Business Management Honors Program' },
  { id: 'BSBA-FMA', name: 'Bachelor of Science in Business Administration major in Financial Management and Accounting' },
  { id: 'BSBA-LM', name: 'Bachelor of Science in Business Administration major in Legal Management' },
  { id: 'BSBA-MGT', name: 'Bachelor of Science in Business Administration major in Management' },
  { id: 'BSBA-MM', name: 'Bachelor of Science in Business Administration major in Marketing Management' },
  { id: 'BACOMM', name: 'Bachelor of Arts in Communication' },
  { id: 'BAECON', name: 'Bachelor of Arts in Economics' },
  { id: 'BAELS', name: 'Bachelor of Arts in English Language Studies' },
  { id: 'BALIT', name: 'Bachelor of Arts in Literature' },
  { id: 'BAPHILO', name: 'Bachelor of Arts in Philosophy' },
  { id: 'BAPOLS', name: 'Bachelor of Arts in Political Science' },
  { id: 'BARVE', name: 'Bachelor of Arts in Religious and Values Education' },
  { id: 'BECED', name: 'Bachelor of Early Childhood Education' },
  { id: 'BEED', name: 'Bachelor of Elementary Education' },
  { id: 'BET-CPET', name: 'Bachelor of Engineering Technology - Computer Engineering Technology' },
  { id: 'BLIS', name: 'Bachelor of Library Information Science' },
  { id: 'BPED', name: 'Bachelor of Physical Education' },
  { id: 'BSED', name: 'Bachelor of Secondary Education' },
  { id: 'BSNED', name: 'Bachelor of Special Needs Education' },
];

const programNameById = new Map(programOptions.map((program) => [program.id, program.name]));

export function formatProgramName(programId: string) {
  const programName = programNameById.get(programId);

  return programName ? `${programId} - ${programName}` : programId;
}
