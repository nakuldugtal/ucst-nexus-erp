 'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookmark, FaChevronDown, FaChevronUp, FaRegBookmark, FaSearch } from 'react-icons/fa';
import { Topbar } from '@/components/layout/topbar';
import { Panel } from '@/components/dashboard/panel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { api } from '@/services/api';

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem('ucst_notice_bookmarks') || '[]');
    setBookmarks(saved);
  }, []);

  useEffect(() => {
    async function loadNotices() {
      setLoading(true);
      try {
        const { data } = await api.get('/student/notices', { params: { search: query } });
        setNotices(data.items || []);
      } finally {
        setLoading(false);
      }
    }

    loadNotices();
  }, [query]);

  const visibleNotices = useMemo(() => notices, [notices]);

  const toggleBookmark = (notice) => {
    const next = bookmarks.some((item) => item._id === notice._id) ? bookmarks.filter((item) => item._id !== notice._id) : [...bookmarks, notice];
    setBookmarks(next);
    window.localStorage.setItem('ucst_notice_bookmarks', JSON.stringify(next));
  };

  return (
    <div className="space-y-4 pb-8">
      <Topbar title="Notices" subtitle="Targeted announcements for your course and semester" />
      <Panel title="Notice Board">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input placeholder="Search notices" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button onClick={() => setQuery('')}><FaSearch className="mr-2" /> Clear</Button>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />) : null}
          {!loading ? visibleNotices.map((notice) => {
            const bookmarked = bookmarks.some((item) => item._id === notice._id);
            const expanded = expandedId === notice._id;
            return (
              <motion.div key={notice._id} className={expanded ? 'rounded-3xl border border-indigo-400/20 bg-indigo-500/10 p-5' : 'rounded-3xl border border-white/10 bg-white/[0.03] p-5'}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button onClick={() => setExpandedId(expanded ? null : notice._id)} className="text-left">
                    <h3 className="text-lg font-semibold text-white">{notice.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{notice.targetCourse} · {notice.targetSemester}</p>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => toggleBookmark(notice)} className="px-3 py-2 text-xs">{bookmarked ? <FaBookmark className="mr-2" /> : <FaRegBookmark className="mr-2" />} Bookmark</Button>
                    <Button onClick={() => setExpandedId(expanded ? null : notice._id)} className="px-3 py-2 text-xs">{expanded ? <FaChevronUp className="mr-2" /> : <FaChevronDown className="mr-2" />} {expanded ? 'Collapse' : 'Open'}</Button>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded ? (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4 space-y-3 text-sm text-zinc-300">
                      <p>{notice.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{notice.priority || 'Normal'}</span>
                        {notice.pinned ? <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">Pinned</span> : null}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {notice.fileUrl ? <Button asChild href={notice.fileUrl} target="_blank" rel="noreferrer">Open Attachment</Button> : null}
                        <Button onClick={() => setSelectedNotice(notice)}>View Details</Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          }) : null}
        </div>
      </Panel>

      <Modal open={Boolean(selectedNotice)} title={selectedNotice?.title || 'Notice'} description="Notice details and attachment" onClose={() => setSelectedNotice(null)} footer={<Button onClick={() => setSelectedNotice(null)}>Close</Button>}>
        {selectedNotice ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">{selectedNotice.description}</div>
            {selectedNotice.fileUrl ? <div className="flex justify-end"><Button asChild href={selectedNotice.fileUrl} target="_blank" rel="noreferrer">Open Attachment</Button></div> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}