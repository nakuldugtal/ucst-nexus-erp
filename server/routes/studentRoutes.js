import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createComplaint, getComplaints, getEvents, getNotes, getNotices, getProfile, registerEvent, replyComplaint, updateProfile } from '../controllers/studentController.js';

const router = Router();

router.get('/profile', authenticate, authorize('student'), getProfile);
router.patch('/profile', authenticate, authorize('student'), updateProfile);
router.get('/notices', authenticate, authorize('student'), getNotices);
router.get('/notes', authenticate, authorize('student'), getNotes);
router.get('/complaints', authenticate, authorize('student'), getComplaints);
router.post('/complaints', authenticate, authorize('student'), createComplaint);
router.post('/complaints/:id/reply', authenticate, authorize('student'), replyComplaint);
router.get('/events', authenticate, authorize('student'), getEvents);
router.post('/events/:id/register', authenticate, authorize('student'), registerEvent);

export default router;