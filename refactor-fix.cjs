const fs = require("fs");
const path = require("path");

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

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

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
    const safeKey = key.replace(/-/g, "\\\\-");
    const regex = new RegExp(
      `(from\\s+|import\\(|import\\s+)(['"])(?:[^'"]*?\\/)?(${safeKey})(?:\\.tsx|\\.ts)?\\2`,
      "g",
    );
    content = content.replace(regex, `$1$2${aliasMap[key]}$2`);
  });

  // some files might have `import ... from "../lib/utils"` which should now be `@/lib/utils` because `utils.ts` wasn't moved.
  // Actually, we can just replace relative utils imports if any exist, but it's safer to just replace all relative lib/utils with `@/lib/utils`
  content = content.replace(
    /(from\s+|import\()(['"])(?:\.\.\/)+lib\/utils\2/g,
    `$1$2@/lib/utils$2`,
  );
  content = content.replace(
    /(from\s+|import\()(['"])(?:\.\.\/)+components\/ui\/([a-zA-Z0-9_-]+)\2/g,
    `$1$2@/components/ui/$3$2`,
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated imports in ${file}`);
  }
});
