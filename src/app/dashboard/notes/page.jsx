 'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaFilter, FaRegBookmark, FaSearch } from 'react-icons/fa';
import { Topbar } from '@/components/layout/topbar';
import { Panel } from '@/components/dashboard/panel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { api } from '@/services/api';
import { courses, semesters } from '@/lib/constants';
import { getCourseShortName } from '@/lib/utils';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ search: '', course: '', semester: '' });
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem('ucst_note_bookmarks') || '[]');
    setBookmarks(saved);
  }, []);

  useEffect(() => {
    async function loadNotes() {
      setLoading(true);
      try {
        const { data } = await api.get('/student/notes', { params: query });
        setNotes(data.items || []);
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [query]);

  const visibleNotes = useMemo(() => notes, [notes]);

  const toggleBookmark = (note) => {
    const next = bookmarks.some((item) => item._id === note._id) ? bookmarks.filter((item) => item._id !== note._id) : [...bookmarks, note];
    setBookmarks(next);
    window.localStorage.setItem('ucst_note_bookmarks', JSON.stringify(next));
  };

  return (
    <div className="space-y-4 pb-8">
      <Topbar title="Notes & PYQs" subtitle="Course and semester filtered academic resources" />
      <Panel title="Resources" action={<div className="flex gap-2"><Button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-white/10' : ''}>Grid</Button><Button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-white/10' : ''}>List</Button></div>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="Search notes and PYQs" value={query.search} onChange={(event) => setQuery((current) => ({ ...current, search: event.target.value }))} />
          <select className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" value={query.course} onChange={(event) => setQuery((current) => ({ ...current, course: event.target.value }))}>
            <option value="">All Courses</option>
            {courses.map((course) => <option key={course} value={course}>{getCourseShortName(course)}</option>)}
          </select>
          <select className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" value={query.semester} onChange={(event) => setQuery((current) => ({ ...current, semester: event.target.value }))}>
            <option value="">All Semesters</option>
            {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
          </select>
          <Button onClick={() => setQuery({ search: '', course: '', semester: '' })}><FaFilter className="mr-2" /> Clear Filters</Button>
        </div>

        {loading ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />)}</div> : null}

        {!loading ? (
          <div className={viewMode === 'grid' ? 'mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'mt-5 space-y-3'}>
            {visibleNotes.map((note) => {
              const bookmarked = bookmarks.some((item) => item._id === note._id);
              return (
                <motion.article key={note._id} whileHover={{ y: -2 }} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{note.course}</p>
                      <h3 className="mt-3 text-lg font-semibold text-white">{note.title}</h3>
                      <p className="mt-2 text-sm text-zinc-500">{note.subject} · {note.semester}</p>
                    </div>
                    <button onClick={() => toggleBookmark(note)} className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10">
                      <FaRegBookmark className={bookmarked ? 'text-indigo-300' : ''} />
                    </button>
                  </div>
                  <div className="mt-5 flex gap-3 text-sm">
                    <Button onClick={() => setSelected(note)}><FaBookOpen className="mr-2" /> Preview</Button>
                    <Button asChild href={note.fileUrl} target="_blank" rel="noreferrer" className="border-indigo-400/20 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/20">Download</Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : null}
      </Panel>

      <Modal open={Boolean(selected)} title={selected?.title || 'Note Preview'} description="PDF resource preview" onClose={() => setSelected(null)} footer={<Button onClick={() => setSelected(null)}>Close</Button>}>
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">{selected.subject} · {selected.course} · {selected.semester}</div>
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-sm text-zinc-500">PDF preview is linked to the uploaded file at {selected.fileUrl || 'an attached file URL'}.</div>
            <div className="flex justify-end">
              <Button asChild href={selected.fileUrl} target="_blank" rel="noreferrer">Open PDF</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}