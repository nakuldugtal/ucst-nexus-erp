 'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRegCalendarCheck } from 'react-icons/fa';
import { Topbar } from '@/components/layout/topbar';
import { Panel } from '@/components/dashboard/panel';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [registered, setRegistered] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem('ucst_event_registrations') || '[]');
    setRegistered(saved);
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const { data } = await api.get('/student/events');
        setEvents(data.items || []);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const register = async (eventItem) => {
    await api.post(`/student/events/${eventItem._id}/register`);
    const next = registered.includes(eventItem._id) ? registered : [...registered, eventItem._id];
    setRegistered(next);
    window.localStorage.setItem('ucst_event_registrations', JSON.stringify(next));
  };

  const countdown = useMemo(() => {
    if (!selected?.eventDate) return null;
    const diff = Math.max(new Date(selected.eventDate).getTime() - Date.now(), 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`;
  }, [selected]);

  return (
    <div className="space-y-4 pb-8">
      <Topbar title="Events" subtitle="Discover university events and register instantly" />
      <Panel title="Campus Events">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />) : events.map((event) => {
            const isRegistered = registered.includes(event._id);
            return (
              <motion.article key={event._id} whileHover={{ y: -3 }} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                <div className="h-36 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{new Date(event.eventDate).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm text-zinc-500">{event.venue || 'Campus Venue'}</p>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => setSelected(event)}><FaCalendarAlt className="mr-2" /> Details</Button>
                    <Button onClick={() => register(event)} className={isRegistered ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100'}>
                      <FaRegCalendarCheck className="mr-2" /> {isRegistered ? 'Registered' : 'Register'}
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </Panel>

      <Modal open={Boolean(selected)} title={selected?.title || 'Event'} description={selected?.venue || ''} onClose={() => setSelected(null)} footer={<Button onClick={() => setSelected(null)}>Close</Button>}>
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">{selected.description}</div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><FaClock className="text-indigo-200" /> <p className="mt-2 text-sm text-zinc-300">Countdown: {countdown}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><FaMapMarkerAlt className="text-indigo-200" /> <p className="mt-2 text-sm text-zinc-300">Venue: {selected.venue || 'Campus Venue'}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><FaRegCalendarCheck className="text-indigo-200" /> <p className="mt-2 text-sm text-zinc-300">Priority: {selected.priority || 'Normal'}</p></div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}