import { Session, Tutor } from "../models/index.js";

export const bookSession = async (req, res, next) => {
  try {
    const { tutorId, date, start, end, type, subject, notes } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can book sessions",
      });
    }

    // Validate tutorId
    if (!tutorId || tutorId === "undefined" || tutorId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(tutorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID format",
      });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (sessionDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Session date must be in the future",
      });
    }

    if (
      !start ||
      !end ||
      typeof start !== "string" ||
      typeof end !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Start and end times must be provided as strings",
      });
    }

    const dateStr = sessionDate.toISOString().split("T")[0];

    const startTime = new Date(`${dateStr}T${start}`);
    const endTime = new Date(`${dateStr}T${end}`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid time format. Please use HH:MM format for start and end times.",
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be later than start time",
      });
    }

    const timeSlot = `${start}-${end}`;

    const existingSession = await Session.findOne({
      tutorId,
      date: sessionDate,
      $or: [
        { startTime: startTime },
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
      status: { $ne: "canceled" },
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const session = await Session.create({
      studentId: req.user._id,
      tutorId,
      date: sessionDate,
      timeSlot,
      startTime,
      endTime,
      type,
      subject: subject || "General",
      amount: tutor.hourlyRate,
      status: "pending",
      paymentStatus: "pending",
      isApproved: false,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Session booked successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error in bookSession:", error);
    return next(error);
  }
};

export const getStudentSessions = async (req, res, next) => {
  try {
    if (req.user.role !== "student" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const studentId = req.params.id || req.user._id;
    console.log("Getting sessions for student:", studentId);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { studentId };
    if (req.query.status) {
      query.status = req.query.status;
    }

    console.log("Query for student sessions:", query);

    const sessions = await Session.find(query)
      .populate({
        path: "tutorId",
        populate: {
          path: "userId",
          select: "name email profilePicture",
        },
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${sessions.length} sessions for student`);

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: sessions,
    });
  } catch (error) {
    console.error("Error in getStudentSessions:", error);
    return next(error);
  }
};

export const getTutorSessions = async (req, res, next) => {
  try {
    const requestedTutorId = req.params.id;

    let tutorRecord = null;
    if (req.user.role === "tutor") {
      tutorRecord = await Tutor.findOne({ userId: req.user._id });
      console.log(
        "Found tutor record:",
        tutorRecord ? tutorRecord._id : "Not found"
      );

      if (!tutorRecord) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found",
        });
      }

      if (requestedTutorId && requestedTutorId !== tutorRecord._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own sessions",
        });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const tutorId = tutorRecord ? tutorRecord._id : requestedTutorId;
    console.log("Getting sessions for tutor:", tutorId);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { tutorId };
    if (req.query.status) {
      query.status = req.query.status;
    }

    console.log("Query for tutor sessions:", query);

    const sessions = await Session.find(query)
      .populate({
        path: "studentId",
        select: "name email profilePicture",
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${sessions.length} sessions for tutor`);

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: sessions,
    });
  } catch (error) {
    console.error("Error in getTutorSessions:", error);
    return next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const { date, timeSlot, type, status } = req.body;
    const sessionId = req.params.id;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const isStudent = req.user._id.toString() === session.studentId.toString();
    let isTutor = false;

    if (!isStudent && req.user.role !== "admin") {
      const tutorRecord = await Tutor.findOne({ userId: req.user._id });

      if (
        !tutorRecord ||
        tutorRecord._id.toString() !== session.tutorId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this session",
        });
      } else {
        isTutor = true;
      }
    }

    if (isStudent) {
      if (!["pending", "confirmed"].includes(session.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot modify a session that is ${session.status}`,
        });
      }

      if (date || timeSlot) {
        const newDate = date ? new Date(date) : session.date;
        const newTimeSlot = timeSlot || session.timeSlot;

        const existingSession = await Session.findOne({
          tutorId: session.tutorId,
          date: newDate,
          timeSlot: newTimeSlot,
          _id: { $ne: session._id },
          status: { $ne: "canceled" },
        });

        if (existingSession) {
          return res.status(400).json({
            success: false,
            message: "This time slot is already booked",
          });
        }

        if (date) session.date = newDate;
        if (timeSlot) session.timeSlot = newTimeSlot;
      }

      if (type) session.type = type;

      if (status === "canceled") {
        session.status = "canceled";
      }
    } else if (isTutor || req.user.role === "admin") {
      if (status) {
        if (status === "confirmed" && session.status === "pending") {
          session.isApproved = true;
          session.status = "confirmed";
        } else if (status === "completed" && session.status === "confirmed") {
          session.status = "completed";

          const tutor = await Tutor.findById(session.tutorId);
          tutor.earnings += session.amount;
          await tutor.save();
        } else if (
          status === "canceled" &&
          ["pending", "confirmed"].includes(session.status)
        ) {
          session.status = "canceled";
        } else {
          return res.status(400).json({
            success: false,
            message: `Cannot change status from ${session.status} to ${status}`,
          });
        }
      }
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const isStudent = req.user._id.toString() === session.studentId.toString();

    // Check if user is authorized to cancel the session
    if (!isStudent && req.user.role !== "admin") {
      const tutorRecord = await Tutor.findOne({ userId: req.user._id });

      if (
        !tutorRecord ||
        tutorRecord._id.toString() !== session.tutorId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this session",
        });
      }
      // User is authorized as the tutor for this session
    }

    if (!["pending", "confirmed"].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a session that is ${session.status}`,
      });
    }

    session.status = "canceled";
    await session.save();

    res.status(200).json({
      success: true,
      message: "Session canceled successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const handleSessionApproval = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const sessionId = req.params.id;

    if (isApproved === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please specify whether the session is approved",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const tutorRecord = await Tutor.findOne({ userId: req.user._id });

    if (
      !tutorRecord ||
      tutorRecord._id.toString() !== session.tutorId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to approve/decline this session",
      });
    }

    if (session.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve/decline a session that is ${session.status}`,
      });
    }

    if (isApproved) {
      session.isApproved = true;
      session.status = "confirmed";
    } else {
      session.status = "canceled";
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: isApproved ? "Session approved" : "Session declined",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

export const completeSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const tutorRecord = await Tutor.findOne({ userId: req.user._id });

    if (
      !tutorRecord ||
      tutorRecord._id.toString() !== session.tutorId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete this session",
      });
    }

    if (session.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a session that is ${session.status}`,
      });
    }

    session.status = "completed";

    tutorRecord.earnings += session.amount;
    await tutorRecord.save();

    session.paymentStatus = "completed";

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session marked as completed",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

export const getEarningsSummary = async (req, res, next) => {
  try {
    let tutorId;

    if (req.user.role === "tutor") {
      const tutorRecord = await Tutor.findOne({ userId: req.user._id });

      if (!tutorRecord) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found",
        });
      }

      tutorId = tutorRecord._id;
    } else if (req.user.role === "admin") {
      tutorId = req.params.id;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const totalEarnings = await Tutor.findById(tutorId).select("earnings");

    const completedSessions = await Session.find({
      tutorId,
      status: "completed",
      paymentStatus: "completed",
    });

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEarnings = completedSessions
      .filter((session) => new Date(session.updatedAt) >= oneWeekAgo)
      .reduce((sum, session) => sum + session.amount, 0);

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const monthlyEarnings = completedSessions
      .filter((session) => new Date(session.updatedAt) >= oneMonthAgo)
      .reduce((sum, session) => sum + session.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: totalEarnings.earnings,
        weeklyEarnings,
        monthlyEarnings,
        completedSessionsCount: completedSessions.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { tutorId, date, timeSlot } = req.query;

    if (!tutorId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Please provide tutorId, date, and timeSlot",
      });
    }

    // Validate tutorId
    if (!tutorId || tutorId === "undefined" || tutorId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(tutorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID format",
      });
    }

    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const [startStr, endStr] = timeSlot.split("-");
    if (!startStr || !endStr) {
      return res.status(400).json({
        success: false,
        message: "Invalid timeSlot format. Expected format: HH:MM-HH:MM",
      });
    }

    const dateStr = sessionDate.toISOString().split("T")[0];

    const startTime = new Date(`${dateStr}T${startStr}`);
    const endTime = new Date(`${dateStr}T${endStr}`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format in timeSlot",
      });
    }

    const existingSession = await Session.findOne({
      tutorId,
      date: sessionDate,
      timeSlot,
      status: { $ne: "canceled" },
    });

    res.status(200).json({
      success: true,
      isAvailable: !existingSession,
      existingSession: existingSession
        ? {
            id: existingSession._id,
            status: existingSession.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Error in checkAvailability:", error);
    return next(error);
  }
};

export const getCalendarSessions = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide startDate and endDate",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let query = {};

    if (req.user.role === "student") {
      query.studentId = req.user._id;
    } else if (req.user.role === "tutor") {
      const tutorRecord = await Tutor.findOne({ userId: req.user._id });

      if (!tutorRecord) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found",
        });
      }

      query.tutorId = tutorRecord._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    query.date = { $gte: start, $lte: end };

    const sessions = await Session.find(query)
      .populate({
        path: "studentId",
        select: "name email profilePicture",
      })
      .populate({
        path: "tutorId",
        populate: {
          path: "userId",
          select: "name email profilePicture",
        },
      });

    const calendarEvents = sessions.map((session) => ({
      id: session._id,
      title:
        req.user.role === "student"
          ? `Session with ${session.tutorId.userId.name}`
          : `Session with ${session.studentId.name}`,
      start: `${session.date.toISOString().split("T")[0]}T${
        session.timeSlot.split("-")[0]
      }:00`,
      end: `${session.date.toISOString().split("T")[0]}T${
        session.timeSlot.split("-")[1]
      }:00`,
      status: session.status,
      isApproved: session.isApproved,
      type: session.type,
    }));

    res.status(200).json({
      success: true,
      data: calendarEvents,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let matchCriteria;

    if (role === "tutor") {
      const tutor = await Tutor.findOne({ userId });
      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: "Tutor not found",
        });
      }

      matchCriteria = { tutorId: tutor._id };
    } else if (role === "student") {
      matchCriteria = { studentId: userId };
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const upcoming = await Session.countDocuments({
      ...matchCriteria,
      status: "confirmed",
      date: { $gte: new Date() },
    });

    const pending = await Session.countDocuments({
      ...matchCriteria,
      status: "pending",
    });

    const completed = await Session.countDocuments({
      ...matchCriteria,
      status: "completed",
    });

    const canceled = await Session.countDocuments({
      ...matchCriteria,
      status: "canceled",
    });

    return res.status(200).json({
      success: true,
      data: { upcoming, pending, completed, canceled },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessionDetails = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: "studentId",
        select: "name email profilePicture",
      })
      .populate({
        path: "tutorId",
        populate: { path: "userId", select: "name email profilePicture" },
      });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    return next(error);
  }
};
