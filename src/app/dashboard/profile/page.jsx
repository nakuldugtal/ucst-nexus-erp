 'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaQrcode, FaShieldAlt, FaStar } from 'react-icons/fa';
import { Topbar } from '@/components/layout/topbar';
import { Panel } from '@/components/dashboard/panel';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', profileImage: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    async function load() {
      const [profileResponse, complaintsResponse, notesResponse, eventsResponse] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/complaints'),
        api.get('/student/notes'),
        api.get('/student/events')
      ]);
      const user = profileResponse.data.user;
      setProfile(user);
      setForm({ name: user.name || '', email: user.email || '', profileImage: user.profileImage || '' });
      setComplaints(complaintsResponse.data.items || []);
      setNotes(notesResponse.data.items || []);
      setEvents(eventsResponse.data.items || []);
    }

    load();
  }, []);

  const analytics = useMemo(() => ({
    pendingComplaints: complaints.filter((item) => item.status !== 'Resolved').length,
    notesCount: notes.length,
    eventsCount: events.length
  }), [complaints, events.length, notes.length]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const { data } = await api.patch('/student/profile', form);
    setProfile(data.user);
    setEditOpen(false);
  };

  const changePassword = async (event) => {
    event.preventDefault();
    await api.post('/auth/change-password', passwordForm);
    setPasswordOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '' });
  };

  return (
    <div className="space-y-4 pb-8">
      <Topbar title="Profile" subtitle="Student identity, course, semester, and credentials" />
      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Identity Card">
          <div className="flex flex-col items-center text-center">
            <motion.div whileHover={{ scale: 1.02 }} className="flex h-32 w-32 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.04] text-4xl text-zinc-400 shadow-glow">
              {(profile?.name || 'UC').slice(0, 2).toUpperCase()}
            </motion.div>
            <h3 className="mt-4 text-2xl font-semibold text-white">{profile?.name || 'Student Name'}</h3>
            <p className="mt-1 text-sm text-zinc-500">{profile?.course || 'Course'} · {profile?.semester || 'Semester'}</p>
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.35em] text-zinc-500">{profile?.rollNumber || 'UCST/ROLL/000'}</div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Attendance</p><p className="mt-3 text-2xl font-semibold text-white">92%</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Semester History</p><p className="mt-3 text-2xl font-semibold text-white">4 Terms</p></div>
          </div>
        </Panel>

        <Panel title="Student Details" action={<Button onClick={() => setEditOpen(true)}><FaEdit className="mr-2" /> Edit Profile</Button>}>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Roll Number', profile?.rollNumber || ''],
              ['Email', profile?.email || ''],
              ['Course', profile?.course || ''],
              ['Semester', profile?.semester || '']
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{label}</p>
                <p className="mt-3 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Pending Complaints</p><p className="mt-3 text-2xl font-semibold text-white">{analytics.pendingComplaints}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Notes</p><p className="mt-3 text-2xl font-semibold text-white">{analytics.notesCount}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Events</p><p className="mt-3 text-2xl font-semibold text-white">{analytics.eventsCount}</p></div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => setPasswordOpen(true)}><FaShieldAlt className="mr-2" /> Change Password</Button>
            <Button className="border-indigo-400/20 bg-indigo-500/10 text-indigo-100"> <FaQrcode className="mr-2" /> QR ID Card</Button>
          </div>
        </Panel>
      </div>

      <Panel title="Academic Summary">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Achievements</p><p className="mt-3 text-lg font-semibold text-white">Top 10% in BCA Semester 4</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Academic Analytics</p><p className="mt-3 text-lg font-semibold text-white">GPA trend stable and improving</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Profile Status</p><p className="mt-3 text-lg font-semibold text-white">Active and verified</p></div>
        </div>
      </Panel>

      <Modal open={editOpen} title="Edit Profile" description="Update your public student profile fields." onClose={() => setEditOpen(false)} footer={<Button onClick={() => setEditOpen(false)}>Close</Button>}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveProfile}>
          <Input placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <Input className="md:col-span-2" placeholder="Avatar URL" value={form.profileImage} onChange={(event) => setForm((current) => ({ ...current, profileImage: event.target.value }))} />
          <div className="md:col-span-2 flex justify-end"><Button type="submit">Save Profile</Button></div>
        </form>
      </Modal>

      <Modal open={passwordOpen} title="Change Password" description="Update your account password." onClose={() => setPasswordOpen(false)} footer={<Button onClick={() => setPasswordOpen(false)}>Close</Button>}>
        <form className="grid gap-4" onSubmit={changePassword}>
          <Input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
          <Input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
          <div className="flex justify-end"><Button type="submit">Update Password</Button></div>
        </form>
      </Modal>
    </div>
  );
}