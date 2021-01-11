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
    .addItem("Get All Peer-Evaluation Data", "getAllPeerEvaluationData")
    .addItem("Get Adjusted Marks", "getAdjustedMarks")
    .addItem("Delete Peer-Evaluation files", "deletePeerEvaluationFiles");

  centralMenu.addToUi();
};

const createTriggerToCollectData = () => {
  let triggerFunction = "getAllPeerEvaluationData";
  deleteProjectTriggersByName(triggerFunction);

  ScriptApp.newTrigger(triggerFunction)
    .timeBased()
    .atDate(
      COLLECT_DATA_TRIGGER_DATE.YEAR,
      COLLECT_DATA_TRIGGER_DATE.MONTH,
      COLLECT_DATA_TRIGGER_DATE.DAY
    )
    .create();

  Logger.log(
    `The trigger was created successfully. The trigger will be executed on the following date: ${COLLECT_DATA_TRIGGER_DATE.DAY}/${COLLECT_DATA_TRIGGER_DATE.MONTH}/${COLLECT_DATA_TRIGGER_DATE.YEAR}.`
  );
};

const deleteProjectTriggersByName = (triggerName) => {
  let Triggers = ScriptApp.getProjectTriggers();
  for (let trigger of Triggers) {
    if (trigger.getHandlerFunction() == triggerName) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
};
