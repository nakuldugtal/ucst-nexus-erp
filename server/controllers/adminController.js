import Complaint from '../models/Complaint.js';
import Event from '../models/Event.js';
import Notice from '../models/Notice.js';
import Note from '../models/Note.js';
import User from '../models/User.js';
import { generatePassword, hashPassword } from '../utils/password.js';

function createRollNumber(course, semester, sequence = 1) {
  const courseKey = course.replace(/[^A-Z]/gi, '').slice(0, 4).toUpperCase();
  const semesterKey = semester.replace(/[^0-9]/g, '') || '0';
  return `UCST/${courseKey}/${semesterKey}/${String(sequence).padStart(3, '0')}`;
}

function createTicketId() {
  return `TKT-${Date.now().toString(36).toUpperCase()}`;
}

function buildPagination(page = 1, limit = 20) {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function analytics(req, res, next) {
  try {
    const [students, complaints, notes, notices, events] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Complaint.countDocuments(),
      Note.countDocuments(),
      Notice.countDocuments(),
      Event.countDocuments()
    ]);

    res.json({
      totals: { students, complaints, notes, notices, events },
      chart: [
        { name: 'Jan', students: 100, complaints: 22 },
        { name: 'Feb', students: 120, complaints: 18 },
        { name: 'Mar', students: 133, complaints: 28 },
        { name: 'Apr', students: 152, complaints: 17 },
        { name: 'May', students: 172, complaints: 12 }
      ]
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req, res, next) {
  try {
    const { name, email, course, semester, profileImage = '' } = req.body;

    if (!name || !email || !course || !semester) {
      return res.status(400).json({ message: 'Name, email, course, and semester are required' });
    }

    const count = await User.countDocuments({ course, semester, role: 'student' });
    const rollNumber = createRollNumber(course, semester, count + 1);
    const plainPassword = generatePassword();
    const password = await hashPassword(plainPassword);

    const student = await User.create({
      name,
      rollNumber,
      email,
      password,
      role: 'student',
      course,
      semester,
      profileImage,
      mustChangePassword: true
    });

    res.status(201).json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        course: student.course,
        semester: student.semester
      },
      issuedPassword: plainPassword
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ student });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function resetStudentPassword(req, res, next) {
  try {
    const plainPassword = generatePassword();
    const password = await hashPassword(plainPassword);
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { password, mustChangePassword: true },
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json({ student, issuedPassword: plainPassword });
  } catch (error) {
    next(error);
  }
}

export async function listStudents(req, res, next) {
  try {
    const { search = '', course = '', semester = '', page = 1, limit = 20 } = req.query;
    const { skip, limit: pageSize, page: currentPage } = buildPagination(page, limit);

    const query = { role: 'student' };

    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (search) {
      const term = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ name: term }, { rollNumber: term }, { email: term }];
    }

    const [items, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).select('-password'),
      User.countDocuments(query)
    ]);

    res.json({ items, meta: { page: currentPage, limit: pageSize, total, pages: Math.max(Math.ceil(total / pageSize), 1) } });
  } catch (error) {
    next(error);
  }
}

export async function createNotice(req, res, next) {
  try {
    const notice = await Notice.create({
      ...req.body,
      createdBy: req.user.id,
      scheduledFor: req.body.scheduledFor || null,
      pinned: Boolean(req.body.pinned)
    });
    res.status(201).json({ notice });
  } catch (error) {
    next(error);
  }
}

export async function updateNotice(req, res, next) {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ notice });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotice(req, res, next) {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function uploadNote(req, res, next) {
  try {
    const note = await Note.create({ ...req.body, uploadedBy: req.user.id });
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ note });
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function manageComplaint(req, res, next) {
  try {
    const payload = { ...req.body };

    if (payload.reply) {
      payload.adminReply = payload.reply;
      delete payload.reply;
    }

    if (payload.replyMessage) {
      payload.thread = undefined;
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, payload, { new: true }).populate('studentId', 'name rollNumber course semester');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ complaint });
  } catch (error) {
    next(error);
  }
}

export async function replyComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.thread.push({ authorRole: 'admin', message: req.body.message });
    complaint.adminReply = req.body.message;
    if (req.body.status) complaint.status = req.body.status;
    if (req.body.priority) complaint.priority = req.body.priority;
    if (req.body.assignedTo) complaint.assignedTo = req.body.assignedTo;
    await complaint.save();

    const populated = await Complaint.findById(complaint._id).populate('studentId', 'name rollNumber course semester');
    res.json({ complaint: populated });
  } catch (error) {
    next(error);
  }
}

export async function listComplaintThread(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('studentId', 'name rollNumber course semester');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ complaint });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function listComplaints(req, res, next) {
  try {
    const { search = '', status = '', category = '', priority = '' } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      const term = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ title: term }, { description: term }, { ticketId: term }];
    }

    const items = await Complaint.find(query).populate('studentId', 'name rollNumber course semester').sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function listNotes(req, res, next) {
  try {
    const { search = '', course = '', semester = '', subject = '' } = req.query;
    const query = {};
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;
    if (search) {
      const term = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ title: term }, { subject: term }];
    }

    const items = await Note.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function listNotices(req, res, next) {
  try {
    const { search = '', course = '', semester = '' } = req.query;
    const query = {};
    if (course) query.targetCourse = course;
    if (semester) query.targetSemester = semester;
    if (search) {
      const term = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ title: term }, { description: term }];
    }

    const items = await Notice.find(query).sort({ pinned: -1, createdAt: -1 }).populate('createdBy', 'name role');
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function listEvents(req, res, next) {
  try {
    const { search = '' } = req.query;
    const query = {};
    if (search) {
      const term = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ title: term }, { description: term }, { venue: term }];
    }

    const items = await Event.find(query).sort({ eventDate: 1 }).populate('createdBy', 'name role');
    res.json({ items });
  } catch (error) {
    next(error);
  }
}