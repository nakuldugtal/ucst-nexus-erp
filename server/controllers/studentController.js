import Complaint from '../models/Complaint.js';
import Event from '../models/Event.js';
import Notice from '../models/Notice.js';
import Note from '../models/Note.js';
import User from '../models/User.js';

function isTargetedForStudent(item, student) {
  const courseMatch = item.targetCourse === 'Entire College' || item.targetCourse === student.course;
  const semesterMatch = !item.targetSemester || item.targetSemester === 'All Semesters' || item.targetSemester === student.semester;
  return courseMatch && semesterMatch;
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function getNotices(req, res, next) {
  try {
    const student = await User.findById(req.user.id);
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ items: notices.filter((notice) => isTargetedForStudent(notice, student)) });
  } catch (error) {
    next(error);
  }
}

export async function getNotes(req, res, next) {
  try {
    const student = await User.findById(req.user.id);
    const items = await Note.find({ course: student.course, semester: student.semester }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function getComplaints(req, res, next) {
  try {
    const items = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 }).populate('assignedTo', 'name role');
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function createComplaint(req, res, next) {
  try {
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const complaint = await Complaint.create({
      ...req.body,
      ticketId,
      studentId: req.user.id,
      thread: [
        {
          authorRole: 'student',
          message: req.body.description
        }
      ]
    });
    res.status(201).json({ complaint });
  } catch (error) {
    next(error);
  }
}

export async function replyComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, studentId: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.thread.push({ authorRole: 'student', message: req.body.message });
    await complaint.save();

    const populated = await Complaint.findById(complaint._id).populate('assignedTo', 'name role');
    res.json({ complaint: populated });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const allowed = (({ name, email, profileImage }) => ({ name, email, profileImage }))(req.body);
    const user = await User.findByIdAndUpdate(req.user.id, allowed, { new: true }).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function registerEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.registrations.includes(req.user.id)) {
      event.registrations.push(req.user.id);
      await event.save();
    }

    res.json({ message: 'Event registration saved', event });
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req, res, next) {
  try {
    const events = await Event.find().sort({ eventDate: 1 });
    res.json({ items: events });
  } catch (error) {
    next(error);
  }
}