/* shell/nav.js: the sidebar groups per role: [group, [[address, label, icon, hint], …]]. The recruiter's Create button
   (Post a job) sits above them; notifications are in the top bar's bell; the account is in the avatar menu. */
export const NAV = {
  recruiter: [['Hiring', [['/app', 'Dashboard', 'chart', 'Your jobs and candidates at a glance'], ['/app/jobs', 'Jobs', 'briefcase', 'Every job you posted, its pipeline and results']]],
    ['Account', [['/app/account', 'My account', 'user', 'Your details and password'], ['/app/notices', 'Notifications', 'bell', 'Messages about your jobs']]]],
  seeker: [['My career', [['/app', 'Dashboard', 'chart', 'Your profile and applications at a glance'], ['/app/profile', 'My profile', 'user', 'Your education, skills and links'],
    ['/app/summary', 'Grand summary', 'shield', 'Everything verified about you, with sources']]],
    ['Jobs', [['/app/browse', 'Find jobs', 'search', 'Open jobs you can apply to'], ['/app/applications', 'My applications', 'tasks', 'Every application and its stage']]],
    ['Account', [['/app/account', 'My account', 'key', 'Your details and password'], ['/app/notices', 'Notifications', 'bell', 'Messages about your applications']]]]
};
export const active = (href, path) => href === '/app' ? path === '/app' : path === href || path.startsWith(href + '/');
