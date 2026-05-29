export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function getCourseShortName(course = '') {
  return course.replace(/\(.*?\)/g, '').replace(/Bachelor of /g, '').trim();
}