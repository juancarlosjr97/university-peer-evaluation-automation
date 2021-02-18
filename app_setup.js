const MASTER_SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1kq3DTeuo7oBURsDEE0pgs1CIsYshnYvj9xCji1dlkFM/edit#gid=0";
const COLLECT_DATA_TRIGGER_DATE = {
  DAY: "09",
  MONTH: "01",
  YEAR: "2021",
};
const MODULE_NAME = "Test";
const GDRIVE_FOLDER_NAME = `University - Lecturer - Module`;
const WORKSHEET_NAME_TEMPLATE = `Module ${MODULE_NAME}`;
const EMAIL_NOTIFICATIONS = "example1@email.com,example2@email.com";

const webAppSetup = () => {
  let newDeploymentURL = saveAndDeployNewVersion();
  Logger.log(`Web app deployed successfully.`);
  Logger.log(`Web app URL: ${newDeploymentURL}`);

  sendEmail(
    EMAIL_NOTIFICATIONS,
    `Web app created successfully - ${GDRIVE_FOLDER_NAME}`,
    `The web app URL is: ${newDeploymentURL}.`
  );

  createTriggerToCollectData();
  createMasterTriggerMenuOnOpen();
};
