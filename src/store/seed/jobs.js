/* store/seed/jobs.js: the demo's jobs, details in Markdown as a recruiter writes them */
export const JOBS = [
  { key: 'react', owner: 0, title: 'Frontend Developer (React)', category: 'Technology', expected: 2, years: 2, level: 'bachelor',
    skills: ['React', 'JavaScript', 'CSS', 'Git', 'Accessibility'], psych: { enabled: true, weight: 30 },
    details: `## About the role\nBuild the screens of our public service apps with **React** and Tailwind.\n\n## You will\n- Turn designs into fast, accessible pages\n- Review code and write tests\n- Work with designers and backend engineers\n\n## Requirements\n- 2 years with React and JavaScript\n- Good CSS and Git habits\n- Care for accessibility` },
  { key: 'data', owner: 0, title: 'Data Analyst', category: 'Technology', expected: 1, years: 2, level: 'bachelor',
    skills: ['SQL', 'Python', 'Power BI', 'Statistics'], psych: { enabled: false, weight: 0 },
    details: `## About the role\nTurn service data into dashboards and clear reports.\n\n## Requirements\n- SQL and Python\n- Power BI or a similar tool\n- A degree in statistics or a related field` },
  { key: 'acc', owner: 1, title: 'Accountant', category: 'Finance', expected: 1, years: 3, level: 'bachelor',
    skills: ['Accounting', 'IFRS', 'Excel', 'Tax'], psych: { enabled: true, weight: 20 },
    details: `## About the role\nKeep our books, prepare monthly reports and file taxes on time.\n\n## Requirements\n- 3 years in accounting\n- IFRS and tax rules\n- Strong Excel` }
];
/* who applied to what at the start: [job key, seeker email, psychometric score or null] */
export const APPLIED = [['react', 'diane@talentvetting.demo', 84], ['react', 'patrick@talentvetting.demo', 71], ['react', 'bosco@talentvetting.demo', 77],
  ['react', 'fabrice@talentvetting.demo', 63], ['react', 'grace@talentvetting.demo', null], ['data', 'aimee@talentvetting.demo', null],
  ['data', 'nadine@talentvetting.demo', null], ['acc', 'claudine@talentvetting.demo', 79], ['acc', 'samuel@talentvetting.demo', 88]];
