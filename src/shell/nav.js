/* shell/nav.js: the sidebar links per role: [address, label, icon]. Notifications are in the top bar's bell. */
export const NAV = {
  recruiter: [['/app', 'Dashboard', 'chart'], ['/app/jobs', 'Jobs', 'briefcase'], ['/app/jobs/new', 'Post a job', 'plus'],
    ['/app/ai', 'AI activity', 'sparkle']],
  seeker: [['/app', 'Dashboard', 'chart'], ['/app/profile', 'My profile', 'user'], ['/app/summary', 'Grand summary', 'shield'],
    ['/app/browse', 'Find jobs', 'search'], ['/app/applications', 'My applications', 'tasks']]
};
export const active = (href, path) => href === '/app' ? path === '/app' : path === href || path.startsWith(href + '/');
