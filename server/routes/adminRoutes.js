import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  analytics,
  createEvent,
  createNotice,
  createStudent,
  deleteEvent,
  deleteNote,
  deleteNotice,
  deleteStudent,
  listComplaints,
  listEvents,
  listNotes,
  listNotices,
  listStudents,
  listComplaintThread,
  manageComplaint,
  replyComplaint,
  resetStudentPassword,
  updateStudent,
  updateEvent,
  updateNote,
  updateNotice,
  uploadNote
} from '../controllers/adminController.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/analytics', analytics);
router.get('/students', listStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/:id/reset-password', resetStudentPassword);
router.get('/complaints', listComplaints);
router.get('/complaints/:id', listComplaintThread);
router.patch('/complaints/:id', manageComplaint);
router.post('/complaints/:id/reply', replyComplaint);
router.get('/notes', listNotes);
router.post('/notes', uploadNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);
router.get('/notices', listNotices);
router.post('/notices', createNotice);
router.put('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);
router.get('/events', listEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;