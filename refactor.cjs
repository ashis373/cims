const fs = require("fs");
const path = require("path");

const moves = [
  // Pages
  ["src/pages/Dashboard.tsx", "src/pages/dashboard/Dashboard.tsx"],
  ["src/pages/Calendar.tsx", "src/pages/calendar/Calendar.tsx"],
  ["src/pages/Candidates.tsx", "src/pages/candidates/Candidates.tsx"],
  ["src/pages/CandidateDetails.tsx", "src/pages/candidates/CandidateDetails.tsx"],
  ["src/pages/CandidateFormPage.tsx", "src/pages/candidates/CandidateFormPage.tsx"],
  ["src/pages/CandidateTimeline.tsx", "src/pages/candidates/CandidateTimeline.tsx"],
  ["src/pages/DuplicateCheck.tsx", "src/pages/candidates/DuplicateCheck.tsx"],
  ["src/pages/InterviewsFeedback.tsx", "src/pages/interviews/InterviewsFeedback.tsx"],
  ["src/pages/InterviewsHistory.tsx", "src/pages/interviews/InterviewsHistory.tsx"],
  ["src/pages/InterviewsUpcoming.tsx", "src/pages/interviews/InterviewsUpcoming.tsx"],
  ["src/pages/Pipeline.tsx", "src/pages/pipeline/Pipeline.tsx"],
  ["src/pages/OffersAccepted.tsx", "src/pages/offers/OffersAccepted.tsx"],
  ["src/pages/OffersDeclined.tsx", "src/pages/offers/OffersDeclined.tsx"],
  ["src/pages/OffersNoJoin.tsx", "src/pages/offers/OffersNoJoin.tsx"],
  ["src/pages/OffersReleased.tsx", "src/pages/offers/OffersReleased.tsx"],
  ["src/pages/RejectionsBlacklisted.tsx", "src/pages/rejection/RejectionsBlacklisted.tsx"],
  ["src/pages/RejectionsReasons.tsx", "src/pages/rejection/RejectionsReasons.tsx"],
  ["src/pages/RejectionsRejected.tsx", "src/pages/rejection/RejectionsRejected.tsx"],
  ["src/pages/Reports.tsx", "src/pages/reports/Reports.tsx"],
  ["src/pages/ReportsCandidate.tsx", "src/pages/reports/ReportsCandidate.tsx"],
  ["src/pages/ReportsHiring.tsx", "src/pages/reports/ReportsHiring.tsx"],
  ["src/pages/ReportsRejection.tsx", "src/pages/reports/ReportsRejection.tsx"],
  ["src/pages/SettingsMasters.tsx", "src/pages/settings/SettingsMasters.tsx"],
  ["src/pages/SettingsRoles.tsx", "src/pages/settings/SettingsRoles.tsx"],
  ["src/pages/SettingsUsers.tsx", "src/pages/settings/SettingsUsers.tsx"],
  ["src/pages/Notifications.tsx", "src/pages/notifications/Notifications.tsx"],

  // Components
  ["src/components/ats/AppLayout.tsx", "src/components/layout/AppLayout.tsx"],
  ["src/components/ats/ExportDialog.tsx", "src/components/common/ExportDialog.tsx"],
  ["src/components/ats/PaginationBar.tsx", "src/components/common/PaginationBar.tsx"],
  ["src/components/ats/CandidateFormDialog.tsx", "src/components/feature/CandidateFormDialog.tsx"],
  ["src/components/ats/CandidateListView.tsx", "src/components/feature/CandidateListView.tsx"],
  ["src/components/ats/CandidateTable.tsx", "src/components/feature/CandidateTable.tsx"],
  ["src/components/ats/KanbanBoard.tsx", "src/components/feature/KanbanBoard.tsx"],

  // Lib -> specific folders
  ["src/lib/ats-types.ts", "src/types/ats-types.ts"],
  ["src/lib/ats-store.tsx", "src/services/ats-store.tsx"],
  ["src/lib/ats-export.ts", "src/utils/ats-export.ts"],
  ["src/lib/theme.tsx", "src/components/common/theme.tsx"],
];

const aliasMap = {
  Dashboard: "@/pages/dashboard/Dashboard",
  Calendar: "@/pages/calendar/Calendar",
  Candidates: "@/pages/candidates/Candidates",
  CandidateDetails: "@/pages/candidates/CandidateDetails",
  CandidateFormPage: "@/pages/candidates/CandidateFormPage",
  CandidateTimeline: "@/pages/candidates/CandidateTimeline",
  DuplicateCheck: "@/pages/candidates/DuplicateCheck",
  InterviewsFeedback: "@/pages/interviews/InterviewsFeedback",
  InterviewsHistory: "@/pages/interviews/InterviewsHistory",
  InterviewsUpcoming: "@/pages/interviews/InterviewsUpcoming",
  Pipeline: "@/pages/pipeline/Pipeline",
  OffersAccepted: "@/pages/offers/OffersAccepted",
  OffersDeclined: "@/pages/offers/OffersDeclined",
  OffersNoJoin: "@/pages/offers/OffersNoJoin",
  OffersReleased: "@/pages/offers/OffersReleased",
  RejectionsBlacklisted: "@/pages/rejection/RejectionsBlacklisted",
  RejectionsReasons: "@/pages/rejection/RejectionsReasons",
  RejectionsRejected: "@/pages/rejection/RejectionsRejected",
  Reports: "@/pages/reports/Reports",
  ReportsCandidate: "@/pages/reports/ReportsCandidate",
  ReportsHiring: "@/pages/reports/ReportsHiring",
  ReportsRejection: "@/pages/reports/ReportsRejection",
  SettingsMasters: "@/pages/settings/SettingsMasters",
  SettingsRoles: "@/pages/settings/SettingsRoles",
  SettingsUsers: "@/pages/settings/SettingsUsers",
  Notifications: "@/pages/notifications/Notifications",

  AppLayout: "@/components/layout/AppLayout",
  ExportDialog: "@/components/common/ExportDialog",
  PaginationBar: "@/components/common/PaginationBar",
  CandidateFormDialog: "@/components/feature/CandidateFormDialog",
  CandidateListView: "@/components/feature/CandidateListView",
  CandidateTable: "@/components/feature/CandidateTable",
  KanbanBoard: "@/components/feature/KanbanBoard",

  "ats-types": "@/types/ats-types",
  "ats-store": "@/services/ats-store",
  "ats-export": "@/utils/ats-export",
  theme: "@/components/common/theme",
};

const folders = [
  "src/pages/dashboard",
  "src/pages/calendar",
  "src/pages/candidates",
  "src/pages/interviews",
  "src/pages/pipeline",
  "src/pages/offers",
  "src/pages/rejection",
  "src/pages/reports",
  "src/pages/settings",
  "src/pages/notifications",
  "src/components/layout",
  "src/components/common",
  "src/components/feature",
  "src/services",
  "src/utils",
  "src/types",
  "src/assets",
];

folders.forEach((f) => {
  if (!fs.existsSync(f)) {
    fs.mkdirSync(f, { recursive: true });
  }
});

moves.forEach(([src, dest]) => {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} -> ${dest}`);
  } else {
    console.warn(`File not found: ${src}`);
  }
});

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const filesToUpdate = getAllFiles("src");

filesToUpdate.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let originalContent = content;

  Object.keys(aliasMap).forEach((key) => {
    // Escape key if it has hyphens
    const safeKey = key.replace(/-/g, "\\\\-");
    // Regex: (from |import\()(['"])(?:[^'"]*?\/)?(key)(?:\.tsx|\.ts)?\2
    const regex = new RegExp(
      `(from\\s+|import\\()(['"])(?:[^'"]*?\\/)?(${safeKey})(?:\\.tsx|\\.ts)?\\2`,
      "g",
    );
    content = content.replace(regex, `$1$2${aliasMap[key]}$2`);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated imports in ${file}`);
  }
});

console.log("Refactoring complete.");
