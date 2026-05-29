 'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaChartLine, FaClipboardList, FaDownload, FaRegBell, FaStar, FaTasks } from 'react-icons/fa';
import { Topbar } from '@/components/layout/topbar';
import { StatCard } from '@/components/dashboard/stat-card';
import { Panel } from '@/components/dashboard/panel';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { chartSeries } from '@/lib/dashboard-data';

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [notes, setNotes] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileResponse, noticesResponse, notesResponse, complaintsResponse, eventsResponse] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/notices'),
          api.get('/student/notes'),
          api.get('/student/complaints'),
          api.get('/student/events')
        ]);

        setProfile(profileResponse.data.user);
        setNotices(noticesResponse.data.items || []);
        setNotes(notesResponse.data.items || []);
        setComplaints(complaintsResponse.data.items || []);
        setEvents(eventsResponse.data.items || []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = useMemo(() => [
    { title: 'Attendance', value: '92%', delta: '+4.1%', hint: 'This semester' },
    { title: 'Semester', value: profile?.semester || 'Sem 4', delta: 'Active', hint: profile?.course || 'Current enrollment' },
    { title: 'Total Notices', value: String(notices.length || 0), delta: '+ Live', hint: 'Relevant notices' },
    { title: 'Pending Complaints', value: String(complaints.filter((item) => item.status !== 'Resolved').length || 0), delta: '- Live', hint: 'Open support tickets' }
  ], [complaints, notices.length, profile?.course, profile?.semester]);

  return (
    <div className="space-y-4 pb-8">
      <Topbar title="Student Dashboard" subtitle="Personalized university workflow, notices, notes, complaints, and events" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />) : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel title="Semester Momentum">
          <OverviewChart data={chartSeries} />
        </Panel>
        <Panel title="Quick Actions">
          <div className="grid gap-3">
            {[
              ['View Notices', FaRegBell],
              ['Open Notes', FaBookOpen],
              ['Track Complaints', FaClipboardList],
              ['Review Progress', FaChartLine]
            ].map(([label, Icon]) => (
              <button key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/8" onClick={() => window.scrollTo({ top: 9999, behavior: 'smooth' })}>
                <Icon className="text-indigo-200" />
                {label}
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Latest Notices">
          <div className="space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />) : notices.slice(0, 4).map((notice) => (
              <motion.article key={notice._id} whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{notice.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{notice.description}</p>
                  </div>
                  <button onClick={() => setSelectedActivity({ type: 'notice', item: notice })} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:bg-white/10">Open</button>
                </div>
              </motion.article>
            ))}
          </div>
        </Panel>

        <Panel title="Complaint Tracking">
          <div className="space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />) : complaints.slice(0, 4).map((item) => (
              <motion.button key={item._id} whileHover={{ y: -2 }} onClick={() => setSelectedActivity({ type: 'complaint', item })} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{item.category} · {item.ticketId}</p>
                  </div>
                  <span className="text-xs text-zinc-400">{item.status}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Recent Notes & PYQs">
          <div className="space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />) : notes.slice(0, 4).map((note) => (
              <motion.button key={note._id} whileHover={{ y: -2 }} onClick={() => setSelectedActivity({ type: 'note', item: note })} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{note.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{note.subject} · {note.semester}</p>
                  </div>
                  <FaDownload className="text-zinc-500" />
                </div>
              </motion.button>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming Events">
          <div className="space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />) : events.slice(0, 4).map((event) => (
              <motion.button key={event._id} whileHover={{ y: -2 }} onClick={() => setSelectedActivity({ type: 'event', item: event })} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{event.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''} {event.venue ? `· ${event.venue}` : ''}</p>
                  </div>
                  <FaTasks className="text-zinc-500" />
                </div>
              </motion.button>
            ))}
          </div>
        </Panel>
      </section>

      <Modal
        open={Boolean(selectedActivity)}
        title={selectedActivity?.item?.title || 'Activity'}
        description={selectedActivity?.type ? `${selectedActivity.type.toUpperCase()} DETAILS` : ''}
        onClose={() => setSelectedActivity(null)}
      >
        {selectedActivity ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
              {selectedActivity.type === 'notice' ? selectedActivity.item.description : null}
              {selectedActivity.type === 'complaint' ? selectedActivity.item.description : null}
              {selectedActivity.type === 'note' ? `${selectedActivity.item.subject} · ${selectedActivity.item.course}` : null}
              {selectedActivity.type === 'event' ? selectedActivity.item.description : null}
            </div>
            {selectedActivity.type === 'complaint' ? <div className="space-y-3">{(selectedActivity.item.thread || []).map((entry, index) => <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white"><span className="block text-xs uppercase tracking-[0.3em] text-zinc-500">{entry.authorRole}</span><p className="mt-2">{entry.message}</p></div>)}</div> : null}
            <div className="flex justify-end">
              <Button onClick={() => setSelectedActivity(null)}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}