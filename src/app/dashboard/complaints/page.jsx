 'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCommentDots, FaPlus, FaReply } from 'react-icons/fa';
import { Topbar } from '@/components/layout/topbar';
import { Panel } from '@/components/dashboard/panel';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { complaintCategories } from '@/lib/constants';

const emptyComplaint = { title: '', description: '', category: complaintCategories[0], image: '' };

export default function ComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyComplaint);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  const pendingCount = useMemo(() => items.filter((item) => item.status !== 'Resolved').length, [items]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get('/student/complaints');
        setItems(data.items || []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const submitComplaint = async (event) => {
    event.preventDefault();
    await api.post('/student/complaints', form);
    setOpen(false);
    setForm(emptyComplaint);
    const { data } = await api.get('/student/complaints');
    setItems(data.items || []);
  };

  const submitReply = async (event) => {
    event.preventDefault();
    await api.post(`/student/complaints/${selected._id}/reply`, { message: reply });
    setReply('');
    const { data } = await api.get('/student/complaints');
    setItems(data.items || []);
    const updated = data.items?.find((item) => item._id === selected._id);
    if (updated) setSelected(updated);
  };

  return (
    <div className="space-y-4 pb-8">
      <Topbar title="Complaints" subtitle="Ticket-style issue tracking with status updates" />
      <Panel title="Complaint Tracker" action={<Button onClick={() => setOpen(true)}><FaPlus className="mr-2" /> Create Complaint</Button>}>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Open Tickets</p><p className="mt-3 text-2xl font-semibold text-white">{pendingCount}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Resolved</p><p className="mt-3 text-2xl font-semibold text-white">{items.filter((item) => item.status === 'Resolved').length}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Ticket ID</p><p className="mt-3 text-2xl font-semibold text-white">Live</p></div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />) : items.map((item) => (
            <motion.article key={item._id} whileHover={{ y: -2 }} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{item.ticketId}</p>
                  <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{item.category}</p>
                </div>
                <span className="text-xs text-zinc-400">{item.status}</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" />
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => setSelected(item)}><FaCommentDots className="mr-2" /> Thread</Button>
              </div>
            </motion.article>
          ))}
        </div>
      </Panel>

      <Modal open={open} title="Create Complaint" description="Report campus issues with categories and attachments." onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitComplaint}>
          <Input placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <select className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
            {complaintCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <Textarea className="md:col-span-2" placeholder="Describe the issue" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <Input className="md:col-span-2" placeholder="Image URL (optional)" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} />
          <div className="md:col-span-2 flex justify-end"><Button type="submit">Submit Complaint</Button></div>
        </form>
      </Modal>

      <Modal open={Boolean(selected)} title={selected?.title || 'Complaint Thread'} description={selected?.ticketId || ''} onClose={() => setSelected(null)} footer={<Button onClick={() => setSelected(null)}>Close</Button>}>
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">{selected.description}</div>
            <div className="space-y-3">
              {(selected.thread || []).map((entry, index) => <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white"><span className="block text-xs uppercase tracking-[0.3em] text-zinc-500">{entry.authorRole}</span><p className="mt-2">{entry.message}</p></div>)}
            </div>
            <form className="grid gap-3" onSubmit={submitReply}>
              <Textarea placeholder="Reply to admin" value={reply} onChange={(event) => setReply(event.target.value)} />
              <div className="flex justify-end"><Button type="submit"><FaReply className="mr-2" /> Send Reply</Button></div>
            </form>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}