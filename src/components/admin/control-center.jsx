'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowRight, FaBookOpen, FaCalendarAlt, FaClipboardList, FaEdit, FaPlus, FaPowerOff, FaTrash, FaUsers } from 'react-icons/fa';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { StatCard } from '@/components/dashboard/stat-card';
import { Panel } from '@/components/dashboard/panel';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { api } from '@/services/api';
import { chartSeries, complaints as demoComplaints, notices as demoNotices } from '@/lib/dashboard-data';
import { complaintCategories, courses, semesters } from '@/lib/constants';
import { cn, getCourseShortName } from '@/lib/utils';

const tabs = [
  { id: 'students', label: 'Students', icon: FaUsers },
  { id: 'notes', label: 'Notes', icon: FaBookOpen },
  { id: 'notices', label: 'Notices', icon: FaClipboardList },
  { id: 'complaints', label: 'Complaints', icon: FaArrowRight },
  { id: 'events', label: 'Events', icon: FaCalendarAlt }
];

const emptyStudentForm = { name: '', email: '', course: courses[0], semester: semesters[0], profileImage: '' };
const emptyNoteForm = { title: '', subject: '', course: courses[0], semester: semesters[0], fileUrl: '' };
const emptyNoticeForm = { title: '', description: '', targetCourse: 'Entire College', targetSemester: 'All Semesters', fileUrl: '', priority: 'Normal', pinned: false, scheduledFor: '' };
const emptyEventForm = { title: '', description: '', banner: '', eventDate: '', venue: '', priority: 'Normal' };

function Select({ className, ...props }) {
  return <select className={cn('w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition focus:border-indigo-400/40', className)} {...props} />;
}

function StatusPill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/10 bg-white/[0.05] text-zinc-300',
    success: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
    danger: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
    info: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100'
  };

  return <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em]', tones[tone] || tones.neutral)}>{children}</span>;
}

function ToastStack({ items, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            className={cn('glass-panel rounded-2xl border px-4 py-3 text-sm shadow-glow', item.type === 'error' ? 'border-rose-400/20 text-rose-100' : 'border-emerald-400/20 text-emerald-100')}
            onClick={() => onDismiss(item.id)}
          >
            {item.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AdminLogin({ onLoggedIn }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedUserId = userId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUserId || !trimmedPassword) {
      setError('Enter the admin User ID and password.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { userId: trimmedUserId, password: trimmedPassword });
      if (data.user.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        return;
      }

      window.localStorage.setItem('ucst_token', data.token);
      window.localStorage.setItem('ucst_user', JSON.stringify(data.user));
      setError('');
      onLoggedIn();
    } catch (loginError) {
      setError(loginError?.response?.data?.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-panel w-full max-w-md rounded-[28px] border border-white/10 p-6 shadow-glow sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-indigo-200">
            <FaUsers />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Hidden Access</p>
            <h1 className="text-xl font-semibold text-white">UCST Core Panel</h1>
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-400">Administrator login only. Student accounts cannot enter the control center.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Admin User ID</label>
            <Input value={userId} onChange={(event) => { setUserId(event.target.value); if (error) setError(''); }} placeholder="Enter admin user ID" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Password</label>
            <Input type="password" value={password} onChange={(event) => { setPassword(event.target.value); if (error) setError(''); }} placeholder="Enter password" />
          </div>
          {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={loading || !userId.trim() || !password.trim()}>
            {loading ? 'Entering...' : 'Enter Control Center'}
            {!loading ? <FaArrowRight /> : null}
          </button>
        </form>
      </div>
    </main>
  );
}

function AccessDeniedCard() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-panel w-full max-w-md rounded-[28px] border border-white/10 p-6 text-center shadow-glow sm:p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">403</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Access Denied</h1>
        <p className="mt-3 text-sm text-zinc-400">This control center is restricted to administrator roles only. Please return to the student dashboard.</p>
      </div>
    </main>
  );
}

export function ControlCenter() {
  const { ready, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('students');
  const [toasts, setToasts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentMeta, setStudentMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [studentQuery, setStudentQuery] = useState({ search: '', course: '', semester: '', page: 1 });
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [notes, setNotes] = useState([]);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [studentModal, setStudentModal] = useState({ open: false, mode: 'create', data: emptyStudentForm, id: null, issuedPassword: '' });
  const [noteModal, setNoteModal] = useState({ open: false, mode: 'create', data: emptyNoteForm, id: null });
  const [noticeModal, setNoticeModal] = useState({ open: false, mode: 'create', data: emptyNoticeForm, id: null });
  const [eventModal, setEventModal] = useState({ open: false, mode: 'create', data: emptyEventForm, id: null });
  const [complaintModal, setComplaintModal] = useState({ open: false, data: null, reply: '', status: 'In Progress', priority: 'Medium' });

  const adminStats = useMemo(() => {
    if (!analytics?.totals) return [];
    return [
      { title: 'Total Students', value: String(analytics.totals.students ?? 0), delta: '+ Live', hint: 'Active records' },
      { title: 'Active Complaints', value: String(analytics.totals.complaints ?? 0), delta: '+ Live', hint: 'Ticket queue' },
      { title: 'Uploaded Notes', value: String(analytics.totals.notes ?? 0), delta: '+ Live', hint: 'Academic resources' },
      { title: 'Total Notices', value: String(analytics.totals.notices ?? 0), delta: '+ Live', hint: 'Published notices' }
    ];
  }, [analytics]);

  const pushToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  };

  const refreshAnalytics = async () => {
    const { data } = await api.get('/admin/analytics');
    setAnalytics(data);
  };

  const refreshStudents = async (nextQuery = studentQuery) => {
    setLoadingStudents(true);
    try {
      const { data } = await api.get('/admin/students', { params: nextQuery });
      setStudents(data.items || []);
      setStudentMeta(data.meta || { page: 1, pages: 1, total: 0 });
    } finally {
      setLoadingStudents(false);
    }
  };

  const refreshResources = async () => {
    setLoadingResources(true);
    try {
      const [notesResponse, noticesResponse, complaintsResponse, eventsResponse] = await Promise.all([
        api.get('/admin/notes'),
        api.get('/admin/notices'),
        api.get('/admin/complaints'),
        api.get('/admin/events')
      ]);
      setNotes(notesResponse.data.items || []);
      setNotices(noticesResponse.data.items || []);
      setComplaints(complaintsResponse.data.items || []);
      setEvents(eventsResponse.data.items || []);
    } finally {
      setLoadingResources(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshAnalytics(), refreshStudents(), refreshResources()]);
  };

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role === 'student') return;
    refreshAll().catch(() => pushToast('Failed to load admin data.', 'error'));
  }, [ready, user]);

  const openStudentModal = (mode, student = null) => {
    setStudentModal({
      open: true,
      mode,
      id: student?._id || null,
      issuedPassword: '',
      data: student
        ? {
            name: student.name || '',
            email: student.email || '',
            course: student.course || courses[0],
            semester: student.semester || semesters[0],
            profileImage: student.profileImage || ''
          }
        : emptyStudentForm
    });
  };

  const saveStudent = async (event) => {
    event.preventDefault();
    try {
      if (studentModal.mode === 'create') {
        const { data } = await api.post('/admin/students', studentModal.data);
        setStudentModal((current) => ({ ...current, issuedPassword: data.issuedPassword || '' }));
        pushToast(`Student created: ${data.student.rollNumber}`);
      } else {
        await api.put(`/admin/students/${studentModal.id}`, studentModal.data);
        pushToast('Student updated successfully.');
      }
      await refreshStudents(studentQuery);
      await refreshAnalytics();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Unable to save student.', 'error');
    }
  };

  const resetStudentPassword = async (studentId) => {
    try {
      const { data } = await api.post(`/admin/students/${studentId}/reset-password`);
      pushToast(`Password reset issued: ${data.issuedPassword}`);
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Unable to reset password.', 'error');
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm('Delete this student permanently?')) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      pushToast('Student deleted successfully.');
      await refreshStudents(studentQuery);
      await refreshAnalytics();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Unable to delete student.', 'error');
    }
  };

  const openNoteModal = (mode, note = null) => {
    setNoteModal({
      open: true,
      mode,
      id: note?._id || null,
      data: note ? {
        title: note.title || '',
        subject: note.subject || '',
        course: note.course || courses[0],
        semester: note.semester || semesters[0],
        fileUrl: note.fileUrl || ''
      } : emptyNoteForm
    });
  };

  const saveNote = async (event) => {
    event.preventDefault();
    try {
      if (noteModal.mode === 'create') await api.post('/admin/notes', noteModal.data);
      else await api.put(`/admin/notes/${noteModal.id}`, noteModal.data);
      pushToast(`Note ${noteModal.mode === 'create' ? 'uploaded' : 'updated'}.`);
      setNoteModal({ open: false, mode: 'create', data: emptyNoteForm, id: null });
      await refreshResources();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Unable to save note.', 'error');
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    await api.delete(`/admin/notes/${noteId}`);
    pushToast('Note deleted.');
    await refreshResources();
  };

  const openNoticeModal = (mode, notice = null) => {
    setNoticeModal({
      open: true,
      mode,
      id: notice?._id || null,
      data: notice ? {
        title: notice.title || '',
        description: notice.description || '',
        targetCourse: notice.targetCourse || 'Entire College',
        targetSemester: notice.targetSemester || 'All Semesters',
        fileUrl: notice.fileUrl || '',
        priority: notice.priority || 'Normal',
        pinned: Boolean(notice.pinned),
        scheduledFor: notice.scheduledFor ? String(notice.scheduledFor).slice(0, 16) : ''
      } : emptyNoticeForm
    });
  };

  const saveNotice = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...noticeModal.data, scheduledFor: noticeModal.data.scheduledFor || null };
      if (noteModal.mode === 'create' && false) {
        // no-op to keep build-time control flow predictable
      }
      if (noticeModal.mode === 'create') await api.post('/admin/notices', payload);
      else await api.put(`/admin/notices/${noticeModal.id}`, payload);
      pushToast(`Notice ${noticeModal.mode === 'create' ? 'published' : 'updated'}.`);
      setNoticeModal({ open: false, mode: 'create', data: emptyNoticeForm, id: null });
      await refreshResources();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Unable to save notice.', 'error');
    }
  };

  const deleteNotice = async (noticeId) => {
    if (!window.confirm('Delete this notice?')) return;
    await api.delete(`/admin/notices/${noticeId}`);
    pushToast('Notice deleted.');
    await refreshResources();
  };

  const openEventModal = (mode, eventItem = null) => {
    setEventModal({
      open: true,
      mode,
      id: eventItem?._id || null,
      data: eventItem ? {
        title: eventItem.title || '',
        description: eventItem.description || '',
        banner: eventItem.banner || '',
        eventDate: eventItem.eventDate ? String(eventItem.eventDate).slice(0, 10) : '',
        venue: eventItem.venue || '',
        priority: eventItem.priority || 'Normal'
      } : emptyEventForm
    });
  };

  const saveEvent = async (event) => {
    event.preventDefault();
    try {
      if (eventModal.mode === 'create') await api.post('/admin/events', eventModal.data);
      else await api.put(`/admin/events/${eventModal.id}`, eventModal.data);
      pushToast(`Event ${eventModal.mode === 'create' ? 'created' : 'updated'}.`);
      setEventModal({ open: false, mode: 'create', data: emptyEventForm, id: null });
      await refreshResources();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Unable to save event.', 'error');
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    await api.delete(`/admin/events/${eventId}`);
    pushToast('Event deleted.');
    await refreshResources();
  };

  const openComplaintModal = (complaint) => {
    setComplaintModal({
      open: true,
      data: complaint,
      reply: complaint?.adminReply || '',
      status: complaint?.status || 'In Progress',
      priority: complaint?.priority || 'Medium'
    });
  };

  const saveComplaintReply = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/admin/complaints/${complaintModal.data._id}/reply`, {
        message: complaintModal.reply,
        status: complaintModal.status,
        priority: complaintModal.priority
      });
      pushToast('Complaint updated successfully.');
      setComplaintModal({ open: false, data: null, reply: '', status: 'In Progress', priority: 'Medium' });
      await refreshResources();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Unable to update complaint.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">Loading secure portal...</div>;
  }

  if (user?.role === 'student') {
    return <AccessDeniedCard />;
  }

  if (!user) {
    return <AdminLogin onLoggedIn={() => window.location.reload()} />;
  }

  return (
    <>
      <ToastStack items={toasts} onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-4 p-4 lg:flex-row">
        <Sidebar role="admin" />
        <main className="flex-1 space-y-4 pb-8">
          <header className="glass-panel flex flex-col gap-4 rounded-[28px] border border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">UCST Nexus ERP</p>
              <h1 className="text-2xl font-semibold text-white">Control Center</h1>
              <p className="text-sm text-zinc-500">Enterprise-grade admin workflows for UCST College</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={refreshAll} className="border-white/10 bg-white/[0.04] text-white">Refresh Data</Button>
              <Button onClick={handleLogout} className="border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20">
                <FaPowerOff className="mr-2" /> Logout
              </Button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(adminStats.length ? adminStats : [
              { title: 'Total Students', value: '0', delta: 'Live', hint: 'Active records' },
              { title: 'Active Complaints', value: '0', delta: 'Live', hint: 'Ticket queue' },
              { title: 'Uploaded Notes', value: '0', delta: 'Live', hint: 'Academic resources' },
              { title: 'Total Notices', value: '0', delta: 'Live', hint: 'Published notices' }
            ]).map((stat) => <StatCard key={stat.title} {...stat} />)}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Panel title="Course Analytics">
              <OverviewChart data={analytics?.chart || chartSeries} />
            </Panel>
            <Panel title="Admin Activity">
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">Live MongoDB data is synced through the hidden admin APIs.</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">Use the tabs below to manage students, notes, notices, complaints, and events.</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">Action changes persist immediately and refresh the control center.</div>
              </div>
            </Panel>
          </section>

          <div className="flex flex-wrap gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn('flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition', activeTab === id ? 'border-indigo-400/30 bg-indigo-500/15 text-white' : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.07] hover:text-white')}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          {activeTab === 'students' ? (
            <Panel title="Student Management" action={<Button onClick={() => openStudentModal('create')}><FaPlus className="mr-2" /> Add Student</Button>}>
              <div className="grid gap-3 md:grid-cols-4">
                <Input placeholder="Search students" value={studentQuery.search} onChange={(event) => setStudentQuery((current) => ({ ...current, search: event.target.value }))} />
                <Select value={studentQuery.course} onChange={(event) => setStudentQuery((current) => ({ ...current, course: event.target.value }))}>
                  <option value="">All Courses</option>
                  {courses.map((course) => <option key={course} value={course}>{getCourseShortName(course)}</option>)}
                </Select>
                <Select value={studentQuery.semester} onChange={(event) => setStudentQuery((current) => ({ ...current, semester: event.target.value }))}>
                  <option value="">All Semesters</option>
                  {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
                </Select>
                <Button onClick={() => refreshStudents({ ...studentQuery, page: 1 })}>Apply Filters</Button>
              </div>

              <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/[0.03] text-zinc-400">
                      <tr>
                        <th className="px-5 py-4">Student</th>
                        <th className="px-5 py-4">Course</th>
                        <th className="px-5 py-4">Semester</th>
                        <th className="px-5 py-4">Roll Number</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingStudents ? (
                        <tr><td className="px-5 py-6 text-zinc-500" colSpan={6}>Loading students...</td></tr>
                      ) : students.length ? students.map((student) => (
                        <tr key={student._id} className="border-t border-white/5">
                          <td className="px-5 py-4">
                            <div className="font-medium text-white">{student.name}</div>
                            <div className="text-xs text-zinc-500">{student.email}</div>
                          </td>
                          <td className="px-5 py-4 text-zinc-300">{getCourseShortName(student.course)}</td>
                          <td className="px-5 py-4 text-zinc-300">{student.semester}</td>
                          <td className="px-5 py-4 text-zinc-300">{student.rollNumber}</td>
                          <td className="px-5 py-4"><StatusPill tone={student.mustChangePassword ? 'warning' : 'success'}>{student.mustChangePassword ? 'Password Reset Pending' : 'Active'}</StatusPill></td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Button onClick={() => openStudentModal('edit', student)} className="px-3 py-2 text-xs"><FaEdit className="mr-2" /> Edit</Button>
                              <Button onClick={() => resetStudentPassword(student._id)} className="border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 hover:bg-amber-500/20">Reset</Button>
                              <Button onClick={() => deleteStudent(student._id)} className="border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/20"><FaTrash className="mr-2" /> Delete</Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td className="px-5 py-6 text-zinc-500" colSpan={6}>No students found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                <span>Total {studentMeta.total || 0} students</span>
                <div className="flex items-center gap-2">
                  <Button disabled={studentQuery.page <= 1} onClick={() => { const page = Math.max(1, studentQuery.page - 1); setStudentQuery((current) => ({ ...current, page })); refreshStudents({ ...studentQuery, page }); }}>Prev</Button>
                  <span>Page {studentMeta.page || 1} of {studentMeta.pages || 1}</span>
                  <Button disabled={studentQuery.page >= studentMeta.pages} onClick={() => { const page = Math.min(studentMeta.pages, studentQuery.page + 1); setStudentQuery((current) => ({ ...current, page })); refreshStudents({ ...studentQuery, page }); }}>Next</Button>
                </div>
              </div>
            </Panel>
          ) : null}

          {activeTab === 'notes' ? (
            <Panel title="Notes Management" action={<Button onClick={() => openNoteModal('create')}><FaPlus className="mr-2" /> Upload Notes</Button>}>
              <div className="grid gap-3 md:grid-cols-3">
                <Input placeholder="Search notes" onChange={(event) => api.get('/admin/notes', { params: { search: event.target.value } }).then(({ data }) => setNotes(data.items || []))} />
                <Select onChange={(event) => api.get('/admin/notes', { params: { course: event.target.value } }).then(({ data }) => setNotes(data.items || []))}>
                  <option value="">All Courses</option>
                  {courses.map((course) => <option key={course} value={course}>{getCourseShortName(course)}</option>)}
                </Select>
                <Select onChange={(event) => api.get('/admin/notes', { params: { semester: event.target.value } }).then(({ data }) => setNotes(data.items || []))}>
                  <option value="">All Semesters</option>
                  {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
                </Select>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(loadingResources ? [] : notes).map((note) => (
                  <div key={note._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{getCourseShortName(note.course)} · {note.semester}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{note.title}</h3>
                      </div>
                      <StatusPill tone="info">PDF</StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">{note.subject}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button onClick={() => openNoteModal('edit', note)} className="px-3 py-2 text-xs"><FaEdit className="mr-2" /> Edit</Button>
                      <Button asChild href={note.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs">Preview</Button>
                      <Button onClick={() => deleteNote(note._id)} className="border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/20">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {activeTab === 'notices' ? (
            <Panel title="Notice Management" action={<Button onClick={() => openNoticeModal('create')}><FaPlus className="mr-2" /> Create Notice</Button>}>
              <div className="grid gap-4 xl:grid-cols-2">
                {(loadingResources ? demoNotices : notices).map((notice) => (
                  <div key={notice._id || notice.title} className={cn('rounded-3xl border p-5', notice.pinned ? 'border-indigo-400/30 bg-indigo-500/10' : 'border-white/10 bg-white/[0.03]')}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <StatusPill tone={notice.priority === 'Urgent' ? 'danger' : notice.priority === 'Important' ? 'warning' : 'neutral'}>{notice.priority || notice.type || 'Notice'}</StatusPill>
                          {notice.pinned ? <StatusPill tone="info">Pinned</StatusPill> : null}
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-white">{notice.title}</h3>
                        <p className="mt-2 text-sm text-zinc-500">{notice.description || notice.scope}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button onClick={() => openNoticeModal('edit', notice)} className="px-3 py-2 text-xs"><FaEdit className="mr-2" /> Edit</Button>
                      {notice.fileUrl ? <Button asChild href={notice.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs">Attachment</Button> : null}
                      {notice._id ? <Button onClick={() => deleteNotice(notice._id)} className="border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/20">Delete</Button> : null}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {activeTab === 'complaints' ? (
            <Panel title="Complaint Management">
              <div className="grid gap-3 md:grid-cols-4">
                <Input placeholder="Search complaints" onChange={(event) => api.get('/admin/complaints', { params: { search: event.target.value } }).then(({ data }) => setComplaints(data.items || []))} />
                <Select onChange={(event) => api.get('/admin/complaints', { params: { status: event.target.value } }).then(({ data }) => setComplaints(data.items || []))}>
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </Select>
                <Select onChange={(event) => api.get('/admin/complaints', { params: { category: event.target.value } }).then(({ data }) => setComplaints(data.items || []))}>
                  <option value="">All Categories</option>
                  {complaintCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </Select>
                <Select onChange={(event) => api.get('/admin/complaints', { params: { priority: event.target.value } }).then(({ data }) => setComplaints(data.items || []))}>
                  <option value="">All Priorities</option>
                  {['Low', 'Medium', 'High', 'Critical'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </Select>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {(loadingResources ? demoComplaints : complaints).map((complaint) => (
                  <div key={complaint._id || complaint.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{complaint.ticketId || 'TICKET'}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{complaint.title}</h3>
                        <p className="mt-2 text-sm text-zinc-500">{complaint.description || complaint.category}</p>
                      </div>
                      <StatusPill tone={complaint.status === 'Resolved' ? 'success' : complaint.status === 'In Progress' ? 'warning' : 'neutral'}>{complaint.status}</StatusPill>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
                      <StatusPill>{complaint.category}</StatusPill>
                      <StatusPill>{complaint.priority || 'Medium'}</StatusPill>
                    </div>
                    {complaint._id ? <Button onClick={() => openComplaintModal(complaint)} className="mt-4 px-3 py-2 text-xs"><FaEdit className="mr-2" /> Open Thread</Button> : null}
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {activeTab === 'events' ? (
            <Panel title="Event Management" action={<Button onClick={() => openEventModal('create')}><FaPlus className="mr-2" /> Create Event</Button>}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(loadingResources ? [] : events).map((eventItem) => (
                  <div key={eventItem._id || eventItem.title} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                    <div className="h-36 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">{eventItem.title}</h3>
                        <StatusPill tone={eventItem.priority === 'Featured' ? 'info' : 'neutral'}>{eventItem.priority || 'Normal'}</StatusPill>
                      </div>
                      <p className="mt-2 text-sm text-zinc-500">{eventItem.description}</p>
                      <p className="mt-2 text-sm text-zinc-500">{eventItem.eventDate ? new Date(eventItem.eventDate).toLocaleDateString() : ''} {eventItem.venue ? `· ${eventItem.venue}` : ''}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button onClick={() => openEventModal('edit', eventItem)} className="px-3 py-2 text-xs"><FaEdit className="mr-2" /> Edit</Button>
                        {eventItem._id ? <Button onClick={() => deleteEvent(eventItem._id)} className="border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/20">Delete</Button> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </main>
      </div>

      <Modal
        open={studentModal.open}
        title={studentModal.mode === 'create' ? 'Add Student' : 'Edit Student'}
        description="Create credentials, assign course and semester, and manage profile image."
        onClose={() => setStudentModal({ open: false, mode: 'create', data: emptyStudentForm, id: null, issuedPassword: '' })}
        footer={
          <>
            <Button onClick={() => setStudentModal({ open: false, mode: 'create', data: emptyStudentForm, id: null, issuedPassword: '' })}>Cancel</Button>
            <Button onClick={saveStudent}><FaPlus className="mr-2" /> Save Student</Button>
          </>
        }
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveStudent}>
          <Input placeholder="Student name" value={studentModal.data.name} onChange={(event) => setStudentModal((current) => ({ ...current, data: { ...current.data, name: event.target.value } }))} />
          <Input placeholder="Student email" value={studentModal.data.email} onChange={(event) => setStudentModal((current) => ({ ...current, data: { ...current.data, email: event.target.value } }))} />
          <Select value={studentModal.data.course} onChange={(event) => setStudentModal((current) => ({ ...current, data: { ...current.data, course: event.target.value } }))}>
            {courses.map((course) => <option key={course} value={course}>{course}</option>)}
          </Select>
          <Select value={studentModal.data.semester} onChange={(event) => setStudentModal((current) => ({ ...current, data: { ...current.data, semester: event.target.value } }))}>
            {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
          </Select>
          <Input className="md:col-span-2" placeholder="Profile image URL" value={studentModal.data.profileImage} onChange={(event) => setStudentModal((current) => ({ ...current, data: { ...current.data, profileImage: event.target.value } }))} />
        </form>
        {studentModal.issuedPassword ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">Issued password: {studentModal.issuedPassword}</div> : null}
      </Modal>

      <Modal
        open={noteModal.open}
        title={noteModal.mode === 'create' ? 'Upload Notes' : 'Edit Notes'}
        description="Store PDF note resources with semester and course targeting."
        onClose={() => setNoteModal({ open: false, mode: 'create', data: emptyNoteForm, id: null })}
        footer={<><Button onClick={() => setNoteModal({ open: false, mode: 'create', data: emptyNoteForm, id: null })}>Cancel</Button><Button onClick={saveNote}><FaPlus className="mr-2" /> Save Note</Button></>}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveNote}>
          <Input placeholder="Note title" value={noteModal.data.title} onChange={(event) => setNoteModal((current) => ({ ...current, data: { ...current.data, title: event.target.value } }))} />
          <Input placeholder="Subject" value={noteModal.data.subject} onChange={(event) => setNoteModal((current) => ({ ...current, data: { ...current.data, subject: event.target.value } }))} />
          <Select value={noteModal.data.course} onChange={(event) => setNoteModal((current) => ({ ...current, data: { ...current.data, course: event.target.value } }))}>
            {courses.map((course) => <option key={course} value={course}>{course}</option>)}
          </Select>
          <Select value={noteModal.data.semester} onChange={(event) => setNoteModal((current) => ({ ...current, data: { ...current.data, semester: event.target.value } }))}>
            {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
          </Select>
          <Input className="md:col-span-2" placeholder="PDF URL" value={noteModal.data.fileUrl} onChange={(event) => setNoteModal((current) => ({ ...current, data: { ...current.data, fileUrl: event.target.value } }))} />
        </form>
      </Modal>

      <Modal
        open={noticeModal.open}
        title={noticeModal.mode === 'create' ? 'Create Notice' : 'Edit Notice'}
        description="Target a course, semester, or the entire college with attachments and priority."
        onClose={() => setNoticeModal({ open: false, mode: 'create', data: emptyNoticeForm, id: null })}
        footer={<><Button onClick={() => setNoticeModal({ open: false, mode: 'create', data: emptyNoticeForm, id: null })}>Cancel</Button><Button onClick={saveNotice}><FaPlus className="mr-2" /> Save Notice</Button></>}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveNotice}>
          <Input placeholder="Notice title" value={noticeModal.data.title} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, title: event.target.value } }))} />
          <Select value={noticeModal.data.priority} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, priority: event.target.value } }))}>
            {['Normal', 'Important', 'Urgent'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </Select>
          <Textarea className="md:col-span-2" placeholder="Notice description" value={noticeModal.data.description} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, description: event.target.value } }))} />
          <Select value={noticeModal.data.targetCourse} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, targetCourse: event.target.value } }))}>
            <option value="Entire College">Entire College</option>
            {courses.map((course) => <option key={course} value={course}>{course}</option>)}
          </Select>
          <Select value={noticeModal.data.targetSemester} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, targetSemester: event.target.value } }))}>
            <option value="All Semesters">All Semesters</option>
            {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
          </Select>
          <Input placeholder="Attachment URL" value={noticeModal.data.fileUrl} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, fileUrl: event.target.value } }))} />
          <Input placeholder="Schedule for (ISO datetime optional)" value={noticeModal.data.scheduledFor} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, scheduledFor: event.target.value } }))} />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white md:col-span-2">
            <input type="checkbox" checked={Boolean(noticeModal.data.pinned)} onChange={(event) => setNoticeModal((current) => ({ ...current, data: { ...current.data, pinned: event.target.checked } }))} />
            Pin this notice to the top
          </label>
        </form>
      </Modal>

      <Modal
        open={eventModal.open}
        title={eventModal.mode === 'create' ? 'Create Event' : 'Edit Event'}
        description="Publish campus events with banners, venue, and featured priority."
        onClose={() => setEventModal({ open: false, mode: 'create', data: emptyEventForm, id: null })}
        footer={<><Button onClick={() => setEventModal({ open: false, mode: 'create', data: emptyEventForm, id: null })}>Cancel</Button><Button onClick={saveEvent}><FaPlus className="mr-2" /> Save Event</Button></>}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveEvent}>
          <Input placeholder="Event title" value={eventModal.data.title} onChange={(event) => setEventModal((current) => ({ ...current, data: { ...current.data, title: event.target.value } }))} />
          <Select value={eventModal.data.priority} onChange={(event) => setEventModal((current) => ({ ...current, data: { ...current.data, priority: event.target.value } }))}>
            {['Normal', 'Featured'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </Select>
          <Textarea className="md:col-span-2" placeholder="Event description" value={eventModal.data.description} onChange={(event) => setEventModal((current) => ({ ...current, data: { ...current.data, description: event.target.value } }))} />
          <Input placeholder="Banner URL" value={eventModal.data.banner} onChange={(event) => setEventModal((current) => ({ ...current, data: { ...current.data, banner: event.target.value } }))} />
          <Input type="date" value={eventModal.data.eventDate} onChange={(event) => setEventModal((current) => ({ ...current, data: { ...current.data, eventDate: event.target.value } }))} />
          <Input className="md:col-span-2" placeholder="Venue" value={eventModal.data.venue} onChange={(event) => setEventModal((current) => ({ ...current, data: { ...current.data, venue: event.target.value } }))} />
        </form>
      </Modal>

      <Modal
        open={complaintModal.open}
        title={complaintModal.data ? `Complaint ${complaintModal.data.ticketId}` : 'Complaint Thread'}
        description="Review the complaint timeline, admin response, and status.">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-lg font-semibold text-white">{complaintModal.data?.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{complaintModal.data?.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill>{complaintModal.data?.category}</StatusPill>
              <StatusPill>{complaintModal.data?.ticketId}</StatusPill>
            </div>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={saveComplaintReply}>
            <Select value={complaintModal.status} onChange={(event) => setComplaintModal((current) => ({ ...current, status: event.target.value }))}>
              {['Pending', 'In Progress', 'Resolved'].map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
            <Select value={complaintModal.priority} onChange={(event) => setComplaintModal((current) => ({ ...current, priority: event.target.value }))}>
              {['Low', 'Medium', 'High', 'Critical'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </Select>
            <Textarea className="md:col-span-2" placeholder="Admin reply" value={complaintModal.reply} onChange={(event) => setComplaintModal((current) => ({ ...current, reply: event.target.value }))} />
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" onClick={() => setComplaintModal({ open: false, data: null, reply: '', status: 'In Progress', priority: 'Medium' })}>Close</Button>
              <Button type="submit">Save Reply</Button>
            </div>
          </form>
          <div className="space-y-3">
            {(complaintModal.data?.thread || []).map((entry, index) => (
              <div key={`${entry.createdAt || index}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                  <span>{entry.authorRole}</span>
                  <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</span>
                </div>
                <p className="mt-3 text-sm text-white">{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}