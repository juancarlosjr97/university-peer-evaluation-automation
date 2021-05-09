const MASTER_SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1hRDbZp3eDK0T-mKLG_auvxEs5z2YzTr26hKB_93CqWk/edit";

const COLLECT_DATA_TRIGGER_DATE_TIME = {
  DAY: 01,
  MONTH: 06,
  YEAR: 2021,
  HOUR: 14,
  MINUTE: 00,
};

const MODULE_NAME = "Test";
const GOOGLE_DRIVE_FOLDER_NAME = `University - Lecturer - Module`;
const WORKSHEET_NAME_TEMPLATE = `Module ${MODULE_NAME}`;
const EMAIL_NOTIFICATIONS = "email@example.com";
const EMAIL_LIST_EDIT_ACCESS = "email@example.com";
const EMAIL_ON_ERROR = "email@example.com";

const DEADLINE = "25th May 2021";

const SMTP_USERNAME = "example-smtp@example.com";
const SMTP_PASSWORD = "SMTP_PASSWORD_HERE";
const SMTP_FROM = `Peer Evaluation ${MODULE_NAME} <${SMTP_USERNAME}>`;

const webAppSetup = () => {
  const newDeploymentURL = saveAndDeployNewVersion();

  Logger.log(`Web app deployed successfully.`);
  Logger.log(`Web app URL: ${newDeploymentURL}`);

  const projectFolderDriveUrl = getProjectFolderDriveUrl();

  sendEmailOnAppSetup({ newDeploymentURL, projectFolderDriveUrl });

  moveMasterToProjectFolder();
  createTriggerToCollectData();
  createMasterTriggerMenuOnOpen();
  saveEndPointUrl({ newDeploymentURL });
  protectRangesSpreadsheet({ spreadsheetUrl: MASTER_SPREADSHEET_URL });
};
