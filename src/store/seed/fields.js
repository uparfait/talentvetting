/* store/seed/fields.js: business categories (a recruiter picks one) and, per field, the skills and degrees the demo's
   people have, so matching and scoring have something real to compare. */
export const CATEGORIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Hospitality', 'Construction', 'Agriculture',
  'Retail', 'Logistics', 'Media', 'Public sector', 'Energy'];
export const FIELDS = {
  web: { degree: 'Computer Science', skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Git', 'REST APIs', 'Accessibility', 'Testing'] },
  data: { degree: 'Statistics', skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Statistics', 'Data cleaning', 'Pandas', 'Dashboards'] },
  finance: { degree: 'Accounting', skills: ['Accounting', 'IFRS', 'Excel', 'Payroll', 'Tax', 'Auditing', 'QuickBooks', 'Reporting'] },
  health: { degree: 'Nursing', skills: ['Patient care', 'First aid', 'Record keeping', 'Infection control', 'Teamwork'] },
  design: { degree: 'Graphic Design', skills: ['Figma', 'UI design', 'Branding', 'Illustrator', 'Prototyping', 'CSS'] }
};
export const SCHOOLS = ['University of Rwanda', 'Carnegie Mellon University Africa', 'African Leadership University', 'Kepler College',
  'INES Ruhengeri', 'Mount Kenya University'];
export const HOBBIES = ['football', 'chess', 'reading', 'photography', 'hiking', 'music', 'volunteering', 'cooking', 'basketball'];
