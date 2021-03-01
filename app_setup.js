const MASTER_SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1kacywpWhTB9Ns51YjUjOlSSZ_6Irtu0leeY5K9WI0YM";
const COLLECT_DATA_TRIGGER_DATE_TIME = {
  DAY: 10,
  MONTH: 03,
  YEAR: 2021,
  HOUR: 14,
  MINUTE: 00,
};
const MODULE_NAME = "Test";
const GOOGLE_DRIVE_FOLDER_NAME = `University - Lecturer - Module`;
const WORKSHEET_NAME_TEMPLATE = `Module ${MODULE_NAME}`;
const EMAIL_NOTIFICATIONS = "example1@example.com,example2@example.com";

const SMTP_USERNAME = "example-smtp@example.com";
const SMTP_PASSWORD = "SMTP_PASSWORD_HERE";
const SMTP_FROM = `Peer Evaluation ${MODULE_NAME} <${SMTP_USERNAME}>`;

const webAppSetup = () => {
  const newDeploymentURL = saveAndDeployNewVersion();

  Logger.log(`Web app deployed successfully.`);
  Logger.log(`Web app URL: ${newDeploymentURL}`);

  sendEmail(
    EMAIL_NOTIFICATIONS,
    `Web app created successfully - ${GOOGLE_DRIVE_FOLDER_NAME}`,
    `The web app URL is: ${newDeploymentURL}.`
  );

  createTriggerToCollectData();
  createMasterTriggerMenuOnOpen();
};
