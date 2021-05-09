const createMasterTriggerMenuOnOpen = () => {
  let triggerFunction = "onOpenMasterSheet";
  deleteProjectTriggersByName(triggerFunction);

  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL);
  ScriptApp.newTrigger("onOpenMasterSheet")
    .forSpreadsheet(sheet)
    .onOpen()
    .create();

  Logger.log(
    `The trigger was created successfully. The trigger will be executed on master sheet opening.`
  );
};

const onOpenMasterSheet = () => {
  let ui = SpreadsheetApp.getUi();

  let centralMenu = ui
    .createMenu("Manual triggers")
    .addItem(
      "Create All Student Sheets and Send Email",
      "createAllStudentSheets"
    )
    .addItem("Get All Peer Evaluation Data", "getAllPeerEvaluationData")
    .addItem("Get Adjusted Marks", "getAdjustedMarks")
    .addItem("Update Settings", "updateSettings")
    .addItem("Delete Peer-Evaluation files", "deletePeerEvaluationFiles");

  centralMenu.addToUi();
};

const createTriggerToCollectData = () => {
  const triggerFunction = "getAllPeerEvaluationData";

  deleteProjectTriggersByName(triggerFunction);

  const triggerDate = new Date(
    COLLECT_DATA_TRIGGER_DATE_TIME.YEAR,
    COLLECT_DATA_TRIGGER_DATE_TIME.MONTH - 1,
    COLLECT_DATA_TRIGGER_DATE_TIME.DAY,
    COLLECT_DATA_TRIGGER_DATE_TIME.HOUR,
    COLLECT_DATA_TRIGGER_DATE_TIME.MINUTE,
    00,
    00
  );

  ScriptApp.newTrigger(triggerFunction).timeBased().at(triggerDate).create();

  Logger.log(
    `The trigger was created successfully. The trigger will be executed on the following date: ${
      COLLECT_DATA_TRIGGER_DATE_TIME.DAY
    }/${COLLECT_DATA_TRIGGER_DATE_TIME.MONTH}/${
      COLLECT_DATA_TRIGGER_DATE_TIME.YEAR
    } at ${COLLECT_DATA_TRIGGER_DATE_TIME.HOUR}:${
      COLLECT_DATA_TRIGGER_DATE_TIME.MINUTE === 0
        ? "00"
        : COLLECT_DATA_TRIGGER_DATE_TIME.MINUTE
    }`
  );
};

const deleteProjectTriggersByName = (triggerName) => {
  const Triggers = ScriptApp.getProjectTriggers();
  for (let trigger of Triggers) {
    if (trigger.getHandlerFunction() == triggerName) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
};
