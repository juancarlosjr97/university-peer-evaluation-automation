const removeParentFolderDrive = (fileId) => {
  let folder = DriveApp.getFileById(fileId).getParents().next();

  if (folder.getName() === GOOGLE_DRIVE_FOLDER_NAME) {
    folder.setTrashed(true);
  }
};

const removeFileById = (fileId) => {
  DriveApp.getFileById(fileId).setTrashed(true);
};

const createAllStudentSheets = () => {
  const dataStudents = getStudentsData();
  const dataStudentsSanitised = dataStudents.slice(1);

  dataStudentsSanitised.forEach((datStudent) => {
    try {
      createStudentSheetByStudentEmail(datStudent[1]);
    } catch (e) {
      console.log(`Error: ${e} for ${datStudent[1]}`);
    }
  });
};

const createStudentSheetByStudentEmail = (studentEmail) => {
  let studentsData = getStudentsNameByGroup(studentEmail);

  if (!studentsData.studentName) {
    return "Your email cannot be found on the system. Contact your lecturer";
  }

  if (!studentsData.sheetExist || studentEmail == TEST_DATA.STUDENT_EMAIL) {
    let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL);
    let newStudentSheetName = `${WORKSHEET_NAME_TEMPLATE} - ${studentEmail}`;
    let newStudentSheet = sheet.copy(`${newStudentSheetName} - Temp`);

    removeUnwantedWorksheet(newStudentSheet);

    newStudentSheet = getStudentSheetWithCleanHistory(
      newStudentSheet,
      newStudentSheetName
    );

    if (studentEmail === TEST_DATA.STUDENT_EMAIL) {
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
      let folders = DriveApp.getFoldersByName(GOOGLE_DRIVE_FOLDER_NAME);
      folderId = folders.next();
    } catch (err) {
      folderId = DriveApp.createFolder(GOOGLE_DRIVE_FOLDER_NAME);
    }

    file.moveTo(folderId);
    setFileSharingToPublic(file);

    let newSpreadsheetName = `${WORKSHEET_NAME_TEMPLATE} - ${studentEmail}`;

    renameSheet(
      newStudentSheet,
      MASTER_FORM_WORKSHEET_NAME,
      newSpreadsheetName
    );

    writeOnCellStudentEmail(newStudentSheet, newSpreadsheetName, studentEmail);

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

    if (studentEmail !== TEST_DATA.STUDENT_EMAIL) {
      saveStudentSheetOnCentralData(
        studentsData.studentRow,
        newStudentSheetUrl
      );
    }

    studentsData.studentSheet = newStudentSheetUrl;
  }

  if (studentEmail !== TEST_DATA.STUDENT_EMAIL) {
    sendEmail(
      studentsData.studentEmail,
      `Peer evaluation - ${MODULE_NAME}`,
      `Hi ${studentsData.studentName},

Your peer evaluation sheet is: ${studentsData.studentSheet}

Thanks,

Module ${MODULE_NAME} Automation.`
    );
  }

  if (studentEmail === TEST_DATA.STUDENT_EMAIL) {
    return studentsData.studentSheet;
  }

  return null;
};

const setFileSharingToPublic = (file) => {
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT);
};

const saveStudentSheetOnCentralData = (studentRow, newStudentSheetUrl) => {
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL).getSheetByName(
    MASTER_WORKSHEET_DATA
  );
  sheet.getRange(`D${studentRow + 1}`).setValue(newStudentSheetUrl);
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

const getStudentsNameByGroup = (studentEmail) => {
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL);
  let data = sheet
    .getSheetByName(MASTER_WORKSHEET_DATA)
    .getDataRange()
    .getValues();

  let studentGroup = null;
  let studentName = null;
  let studentRow = null;
  let studentSheet = null;
  let sheetExist = false;

  for (x = 1; x < data.length; x++) {
    if (data[x][1].trim() === studentEmail.trim()) {
      studentName = data[x][0];
      studentGroup = data[x][2];
      studentSheet = data[x][3];
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
  let folders = DriveApp.getFoldersByName(GOOGLE_DRIVE_FOLDER_NAME);

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
    let sheetDataSanitized = getSheetDataSanitized(sheetData);
    allDataSheets.push(...sheetDataSanitized);
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
      EMAIL_NOTIFICATIONS,
      `Module ${MODULE_NAME} Peer Evaluation completed`,
      `The module ${MODULE_NAME} has collected all data from the peer evaluation.`
    );
  } else {
    sendEmail(
      EMAIL_NOTIFICATIONS,
      `Module ${MODULE_NAME} Peer Evaluation completed - Empty evaluations`,
      `The module ${MODULE_NAME} has not data to collect for the peer evaluation of the module.`
    );
  }

  return allDataSheets;
};

const sendEmail = (to, subject, body) => {
  const payload = {
    Host: "smtp.gmail.com",
    Username: SMTP_USERNAME,
    Password: SMTP_PASSWORD,
    To: to,
    From: SMTP_USERNAME,
    Subject: subject,
    Body: body,
    Action: "Send",
  };

  const options = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch("https://smtpjs.com/v3/smtpjs.aspx?", options);
};

const getSheetDataSanitized = (sheetData) => {
  let date = sheetData[0][1];
  let studentEmail = sheetData[1][1];
  let groupName = sheetData[3][1];

  let dataReview = [];

  for (x = FIRST_ROW_STUDENT_DATA - 1; x < sheetData.length; x++) {
    if (sheetData[x][0].length) {
      let row = [date, studentEmail, groupName, ...sheetData[x]];
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

const writeOnCellStudentEmail = (
  spreadsheet,
  spreadsheetName,
  studentEmail
) => {
  let sheet = spreadsheet.getSheetByName(spreadsheetName);
  sheet.getRange("B2").setValue(studentEmail);
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
