const MASTER_SPREADSHEET_URL = "1ZLAeJ6h1pGAb1dwgBzpYfXKZTNM7dwVsA47zVMtIaEo";
const COLLECT_DATA_TRIGGER_DATE = {
  DAY: "09",
  MONTH: "01",
  YEAR: "2021",
};
const MODULE_NAME = "Test";
const GDRIVE_FOLDER_NAME = `University - Lecturer - Module ${MODULE_NAME}`;
const WORKSHEET_NAME_TEMPLATE = `Module ${MODULE_NAME}`;
const EMAIL_NOTIFICATIONS = "example1@email.com,example2@email.com";

const webAppSetup = () => {
  let newDeploymentURL = saveAndDeployNewVersion();
  Logger.log(`Web app deployed successfully.`);
  Logger.log(`Web app URL: ${newDeploymentURL}`);

  sendEmail(
    `Web app created successfully - ${GDRIVE_FOLDER_NAME}`,
    `The web app URL is: ${newDeploymentURL}.`
  );

  createTriggerToCollectData();
  createMasterTriggerMenuOnOpen();
};
