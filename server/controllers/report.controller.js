import { Report, Session, Tutor, User } from "../models/index.js";

export const getAllReports = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access reports",
      });
    }

    const { type } = req.query;

    const query = {};
    if (type) query.type = type;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reports,
    });
  } catch (error) {
    return next(error);
  }
};

export const generateReport = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can generate reports",
      });
    }

    const { type, startDate, endDate } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide report type, start date and end date",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let reportData = {};

    switch (type) {
      case "subject_popularity":
        reportData = await generateSubjectPopularityReport(start, end);
        break;
      case "session_completion":
        reportData = await generateSessionCompletionReport(start, end);
        break;
      case "user_growth":
        reportData = await generateUserGrowthReport(start, end);
        break;
      case "platform_usage_by_city":
        reportData = await generateCityUsageReport(start, end);
        break;
      case "earnings_summary":
        reportData = await generateEarningsSummaryReport(start, end);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
    }

    const report = await Report.create({
      type,
      data: reportData,
      timeRange: {
        start,
        end,
      },
    });

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      data: report,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSubjectsReport = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access reports",
      });
    }

    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const reportData = await generateSubjectPopularityReport(start, end);

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessionsReport = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access reports",
      });
    }

    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const reportData = await generateSessionCompletionReport(start, end);

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return next(error);
  }
};

export const getLocationsReport = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access reports",
      });
    }

    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const reportData = await generateCityUsageReport(start, end);

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return next(error);
  }
};

export const getGrowthReport = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access reports",
      });
    }

    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const reportData = await generateUserGrowthReport(start, end);

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return next(error);
  }
};

export const exportReportData = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can export reports",
      });
    }

    const { type } = req.params;
    const { format = "json", startDate, endDate } = req.query;

    if (!["json", "csv"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Format must be 'json' or 'csv'",
      });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let reportData = {};

    switch (type) {
      case "subjects":
        reportData = await generateSubjectPopularityReport(start, end);
        break;
      case "sessions":
        reportData = await generateSessionCompletionReport(start, end);
        break;
      case "growth":
        reportData = await generateUserGrowthReport(start, end);
        break;
      case "locations":
        reportData = await generateCityUsageReport(start, end);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
    }

    if (format === "csv") {
      let csv = "";

      switch (type) {
        case "subjects":
          csv = "Subject,Count\n";
          for (const [subject, count] of Object.entries(
            reportData.subjectCounts
          )) {
            csv += `${subject},${count}\n`;
          }
          break;
        case "sessions":
          csv = "Status,Count,Percentage\n";
          for (const [status, data] of Object.entries(
            reportData.statusCounts
          )) {
            csv += `${status},${data.count},${data.percentage}%\n`;
          }
          break;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${type}_report.csv`
      );
      res.status(200).send(csv);
    } else {
      res.status(200).json({
        success: true,
        data: reportData,
      });
    }
  } catch (error) {
    return next(error);
  }
};

async function generateSubjectPopularityReport(startDate, endDate) {
  const tutors = await Tutor.find();

  const subjectCounts = {};
  tutors.forEach((tutor) => {
    tutor.subjects.forEach((subject) => {
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
  });

  const sessions = await Session.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).populate({
    path: "tutorId",
    select: "subjects",
  });

  const subjectSessions = {};
  sessions.forEach((session) => {
    if (session.tutorId && session.tutorId.subjects) {
      session.tutorId.subjects.forEach((subject) => {
        subjectSessions[subject] = (subjectSessions[subject] || 0) + 1;
      });
    }
  });

  return {
    subjectCounts,
    subjectSessions,
    totalSubjects: Object.keys(subjectCounts).length,
    mostPopular: Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([subject, count]) => ({ subject, count })),
  };
}

async function generateSessionCompletionReport(startDate, endDate) {
  const sessions = await Session.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const statusCounts = {
    pending: { count: 0, percentage: 0 },
    confirmed: { count: 0, percentage: 0 },
    completed: { count: 0, percentage: 0 },
    canceled: { count: 0, percentage: 0 },
  };

  sessions.forEach((session) => {
    if (statusCounts[session.status]) {
      statusCounts[session.status].count++;
    }
  });

  const totalSessions = sessions.length;

  for (const status in statusCounts) {
    statusCounts[status].percentage =
      totalSessions > 0
        ? Math.round((statusCounts[status].count / totalSessions) * 100)
        : 0;
  }

  return {
    totalSessions,
    statusCounts,
    completionRate:
      totalSessions > 0
        ? Math.round((statusCounts.completed.count / totalSessions) * 100)
        : 0,
    cancellationRate:
      totalSessions > 0
        ? Math.round((statusCounts.canceled.count / totalSessions) * 100)
        : 0,
  };
}

async function generateUserGrowthReport(startDate, endDate) {
  const users = await User.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const usersByMonth = {};
  const usersByRole = {
    student: 0,
    tutor: 0,
    admin: 0,
  };

  users.forEach((user) => {
    usersByRole[user.role]++;

    const month = user.createdAt.toISOString().slice(0, 7);
    usersByMonth[month] = (usersByMonth[month] || 0) + 1;
  });

  const sortedMonths = Object.keys(usersByMonth).sort();
  const growthByMonth = sortedMonths.map((month) => ({
    month,
    count: usersByMonth[month],
  }));

  return {
    totalUsers: users.length,
    usersByRole,
    growthByMonth,
  };
}

async function generateCityUsageReport(startDate, endDate) {
  const users = await User.find({
    location: { $exists: true, $ne: "" },
  });

  const cityUsage = {};

  users.forEach((user) => {
    if (user.location) {
      cityUsage[user.location] = (cityUsage[user.location] || 0) + 1;
    }
  });

  const sessions = await Session.find({
    createdAt: { $gte: startDate, $lte: endDate },
    type: "in-person",
  }).populate({
    path: "tutorId",
    select: "location",
  });

  const sessionsByCity = {};

  sessions.forEach((session) => {
    if (session.tutorId && session.tutorId.location) {
      sessionsByCity[session.tutorId.location] =
        (sessionsByCity[session.tutorId.location] || 0) + 1;
    }
  });

  return {
    cityUsage,
    sessionsByCity,
    topCities: Object.entries(cityUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count })),
  };
}

async function generateEarningsSummaryReport(startDate, endDate) {
  const sessions = await Session.find({
    status: "completed",
    updatedAt: { $gte: startDate, $lte: endDate },
  });

  const totalEarnings = sessions.reduce(
    (sum, session) => sum + session.amount,
    0
  );

  const earningsByMonth = {};

  sessions.forEach((session) => {
    const month = session.updatedAt.toISOString().slice(0, 7);
    earningsByMonth[month] = (earningsByMonth[month] || 0) + session.amount;
  });

  const sortedMonths = Object.keys(earningsByMonth).sort();
  const earningsOverTime = sortedMonths.map((month) => ({
    month,
    amount: earningsByMonth[month],
  }));

  return {
    totalEarnings,
    earningsOverTime,
    averageSessionValue:
      sessions.length > 0 ? Math.round(totalEarnings / sessions.length) : 0,
    totalSessions: sessions.length,
  };
}
