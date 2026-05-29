import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

export function Modal({ open, title, description, onClose, children, footer }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-panel relative w-full max-w-3xl rounded-[28px] border border-white/10 shadow-glow"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
              </div>
              <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-zinc-300 transition hover:bg-white/10">
                <FaTimes />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer ? <div className="flex items-center justify-end gap-3 border-t border-white/5 px-5 py-4 sm:px-6">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}