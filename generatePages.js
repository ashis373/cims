const fs = require("fs");
const pages = [
  "DuplicateCheck",
  "CandidateTimeline",
  "InterviewsUpcoming",
  "InterviewsFeedback",
  "InterviewsHistory",
  "OffersReleased",
  "OffersAccepted",
  "OffersDeclined",
  "OffersNoJoin",
  "RejectionsRejected",
  "RejectionsBlacklisted",
  "RejectionsReasons",
  "ReportsCandidate",
  "ReportsHiring",
  "ReportsRejection",
  "Notifications",
  "SettingsUsers",
  "SettingsRoles",
  "SettingsMasters",
];

pages.forEach((p) => {
  const content = `export default function ${p}() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">${p.replace(/([A-Z])/g, " $1").trim()}</h1>
        <p className="text-muted-foreground">Manage your ${p
          .replace(/([A-Z])/g, " $1")
          .trim()
          .toLowerCase()} here.</p>
      </div>
      <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground shadow-sm">
        This page is currently under construction.
      </div>
    </div>
  );
}
`;
  fs.writeFileSync("d:/xaamp/htdocs/full-cims/src/pages/" + p + ".tsx", content);
});
