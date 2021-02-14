const removeParentFolderDrive = (fileId) => {
  let folder = DriveApp.getFileById(fileId).getParents().next();

  if (folder.getName() === GDRIVE_FOLDER_NAME) {
    folder.setTrashed(true);
  }
};

const removeFileById = (fileId) => {
  DriveApp.getFileById(fileId).setTrashed(true);
};

const createStudentSheetByStudentId = (studentId) => {
  let studentsData = getStudentsNameByGroup(studentId);

  if (!studentsData.sheetExist) {
    let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL);
    let newStudentSheetName = `${WORKSHEET_NAME_TEMPLATE} - ${studentId}`;
    let newStudentSheet = sheet.copy(`${newStudentSheetName} - Temp`);

    removeUnwantedWorksheet(newStudentSheet);
    newStudentSheet = getStudentSheetWithCleanHistory(
      newStudentSheet,
      newStudentSheetName
    );

    if (studentId === TEST_DATA.STUDENT_ID) {
      setStudentsNameByGroup(newStudentSheet, TEST_DATA.STUDENTS_BY_GROUP_NAME);
    } else {
      setStudentsNameByGroup(
        newStudentSheet,
        studentsData.allStudentsNameByGroup
      );
    }

    let file = DriveApp.getFileById(newStudentSheet.getId());
    let folderId = null;

    try {
      let folders = DriveApp.getFoldersByName(GDRIVE_FOLDER_NAME);
      folderId = folders.next();
    } catch (err) {
      folderId = DriveApp.createFolder(GDRIVE_FOLDER_NAME);
    }

    file.moveTo(folderId);
    setFileSharingToPublic(file);

    let newSpreadsheetName = `${WORKSHEET_NAME_TEMPLATE} - ${studentId}`;

    renameSheet(
      newStudentSheet,
      MASTER_FORM_WORKSHEET_NAME,
      newSpreadsheetName
    );
    writeOnCellStudentId(newStudentSheet, newSpreadsheetName, studentId);
    writeOnCellGroupName(
      newStudentSheet,
      newSpreadsheetName,
      studentsData.studentGroup
    );
    writeOnCellStudentName(
      newStudentSheet,
      newSpreadsheetName,
      studentsData.studentName
    );
    writeOnCellTodayDate(newStudentSheet, newSpreadsheetName);

    let newStudentSheetUrl = newStudentSheet.getUrl();

    if (studentId !== TEST_DATA.STUDENT_ID) {
      saveStudentSheetOnCentralData(
        studentsData.studentRow,
        newStudentSheetUrl
      );
    }

    studentsData.studentSheet = newStudentSheetUrl;
  }

  sendEmailHtml(
    studentsData.studentEmail,
    `Peer evaluation - ${MODULE_NAME}`,
    `Hi ${studentsData.studentName},

Your peer evaluation sheet is: ${studentsData.studentSheet}

Thanks,

Module ${MODULE_NAME} Automation.`
  );

  return null;
};

const setFileSharingToPublic = (file) => {
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT);
};

const saveStudentSheetOnCentralData = (studentRow, newStudentSheetUrl) => {
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL).getSheetByName(
    MASTER_WORKSHEET_DATA
  );
  sheet.getRange(`E${studentRow + 1}`).setValue(newStudentSheetUrl);
};

const setStudentsNameByGroup = (sheet, allStudentsNameByGroup) => {
  let lastRowWithData =
    FIRST_ROW_STUDENT_DATA + allStudentsNameByGroup.length - 1;
  sheet
    .getRange(`A${FIRST_ROW_STUDENT_DATA}:A${lastRowWithData}`)
    .setValues(allStudentsNameByGroup);

  let totalRows = sheet.getLastRow();

  sheet.deleteRows(lastRowWithData + 1, totalRows - lastRowWithData);
};

const getStudentsNameByGroup = (studentId) => {
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL);
  let data = sheet
    .getSheetByName(MASTER_WORKSHEET_DATA)
    .getDataRange()
    .getValues();

  let studentGroup = null;
  let studentName = null;
  let studentEmail = null;
  let studentRow = null;
  let studentSheet = null;
  let sheetExist = null;

  for (x = 1; x < data.length; x++) {
    if (Number(data[x][1]) === Number(studentId)) {
      studentName = data[x][0];
      studentGroup = data[x][2];
      studentEmail = data[x][3];
      studentSheet = data[x][4];
      studentRow = x;
      break;
    }
  }

  let allStudentsNameByGroup = [];

  for (x = 1; x < data.length; x++) {
    if (data[x][2] === studentGroup) {
      allStudentsNameByGroup.push([data[x][0]]);
    }
  }

  if (typeof studentSheet === "string" && studentSheet.length) {
    sheetExist = true;
  }

  return {
    studentId,
    studentName,
    studentEmail,
    studentRow,
    sheetExist,
    studentSheet,
    studentGroup,
    allStudentsNameByGroup,
  };
};

const getStudentSheetWithCleanHistory = (tempSheet, newStudentSheetName) => {
  let newSheet = tempSheet.copy(newStudentSheetName);
  removeFileById(tempSheet.getId());
  return newSheet;
};

const getAllSpreadsheetIdsOnProject = () => {
  let folders = DriveApp.getFoldersByName(GDRIVE_FOLDER_NAME);

  let folder = folders.hasNext() ? folders.next() : null;

  if (folder) {
    let sheetIds = [];

    let files = DriveApp.getFolderById(folder.getId()).getFiles();

    while (files.hasNext()) {
      var file = files.next();
      sheetIds.push(file.getId());
    }

    return sheetIds;
  }

  return [];
};

const getAllPeerEvaluationData = () => {
  const sheetIds = getAllSpreadsheetIdsOnProject();

  let allDataSheets = [];

  sheetIds.map((sheetId) => {
    let sheetData = SpreadsheetApp.openById(sheetId).getDataRange().getValues();
    let sheetDataSantinised = getSheetDataSanitised(sheetData);
    allDataSheets.push(...sheetDataSantinised);
  });

  let importDataSheet = SpreadsheetApp.openByUrl(
    MASTER_SPREADSHEET_URL
  ).getSheetByName(MASTER_WORKSHEET_IMPORTED_DATA);

  importDataSheet.getRange("A2:J").clearContent();

  if (allDataSheets.length) {
    importDataSheet
      .getRange(2, 1, allDataSheets.length, allDataSheets[0].length)
      .setValues(allDataSheets);

    sendEmail(
      `Module ${MODULE_NAME} Peer Evaluation completed`,
      `The module ${MODULE_NAME} has collected all data from the peer evaluation.`
    );
  } else {
    sendEmail(
      `Module ${MODULE_NAME} Peer Evaluation completed - Empty evaluations`,
      `The module ${MODULE_NAME} has not data to collect for the peer evaluation of the module.`
    );
  }

  return allDataSheets;
};

const sendEmail = (to, subject, message) => {
  MailApp.sendEmail(to, subject, message);
};

const sendEmailHtml = (to, subject, htmlBody) => {
  MailApp.sendEmail(to, subject, htmlBody);
};

const getSheetDataSanitised = (sheetData) => {
  let date = sheetData[0][1];
  let studentId = sheetData[1][1];
  let groupName = sheetData[3][1];

  let dataReview = [];

  for (x = FIRST_ROW_STUDENT_DATA - 1; x < sheetData.length; x++) {
    if (sheetData[x][0].length) {
      let row = [date, studentId, groupName, ...sheetData[x]];
      dataReview.push(row);
    }
  }

  return dataReview;
};

const renameSheet = (spreadsheet, currentName, newName) => {
  let sheet = spreadsheet.getSheetByName(currentName);
  sheet.setName(newName);
};

const writeOnCellTodayDate = (spreadsheet, spreadsheetName) => {
  let sheet = spreadsheet.getSheetByName(spreadsheetName);
  sheet.getRange("B1").setValue(getTodayDate());
};

const writeOnCellStudentId = (spreadsheet, spreadsheetName, studentId) => {
  let sheet = spreadsheet.getSheetByName(spreadsheetName);
  sheet.getRange("B2").setValue(studentId);
};

const writeOnCellStudentName = (spreadsheet, spreadsheetName, studentName) => {
  let sheet = spreadsheet.getSheetByName(spreadsheetName);
  sheet.getRange("B3").setValue(studentName);
};

const writeOnCellGroupName = (spreadsheet, spreadsheetName, studentGroup) => {
  let sheet = spreadsheet.getSheetByName(spreadsheetName);
  sheet.getRange("B4").setValue(studentGroup);
};

const removeUnwantedWorksheet = (spreadsheet) => {
  let worksheets = spreadsheet.getSheets();
  worksheets.map((worksheet) => {
    if (UNWANTED_SHEETS.includes(worksheet.getName())) {
      spreadsheet.deleteSheet(worksheet);
    }
  });
};

const deletePeerEvaluationFiles = () => {
  const sheetIds = getAllSpreadsheetIdsOnProject();
  sheetIds.map((sheetId) => {
    removeFileById(sheetId);
  });
  let masterSheet = SpreadsheetApp.openByUrl(
    MASTER_SPREADSHEET_URL
  ).getSheetByName(MASTER_WORKSHEET_DATA);

  masterSheet.getRange("E2:E").clearContent();
};

const getTodayDate = () => {
  return Utilities.formatDate(new Date(), "Europe/London", "dd/MM/yyyy");
};

const doGet = () => {
  let htmlOutput = HtmlService.createTemplateFromFile("web-app").evaluate();
  htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1");
  return htmlOutput;
};
