const removeParentFolderDrive = (fileId) => {
  let folder = DriveApp.getFileById(fileId).getParents().next();

  if (folder.getName() === GOOGLE_DRIVE_FOLDER_NAME) {
    folder.setTrashed(true);
  }
};

const removeFileById = (fileId) => {
  DriveApp.getFileById(fileId).setTrashed(true);
};

const checkSheetHasBeenCreated = (studentsData) => {
  for (index in studentsData) {
    if (studentsData[index][3].length) {
      delete studentsData[index];
    }
  }

  const filtered = studentsData.filter((value, index, arr) => {
    return value !== undefined;
  });

  return filtered;
};

const createAllStudentSheets = () => {
  const dataStudents = getStudentsData();
  const dataStudentsSanitised = dataStudents.slice(1);

  const studentsWithoutSheet = checkSheetHasBeenCreated(dataStudentsSanitised);

  const dataStudentsSanitisedSplitByArray = splitArrayOnArrays({
    originalArray: studentsWithoutSheet,
    totalByArray: 15,
  });

  const API_ENDPOINT = getEndPointUrl();

  const MAX_REQUEST = 20;
  let requests = [];

  for (let x = 0; x < dataStudentsSanitisedSplitByArray.length; x++) {
    const payload = {
      studentsData: dataStudentsSanitisedSplitByArray[x],
    };

    const request = {
      url: API_ENDPOINT,
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
    };

    requests.push(request);

    if (x % MAX_REQUEST == 0 && x > 0) {
      sleepProcess(5000);
      UrlFetchApp.fetchAll(requests);
      requests = [];
    }
  }

  if (requests.length) {
    sleepProcess(5000);
    UrlFetchApp.fetchAll(requests);
  }
};

const splitArrayOnArrays = ({ originalArray, totalByArray }) => {
  var size = totalByArray;
  var arrayOfArrays = [];

  for (var i = 0; i < originalArray.length; i += size) {
    arrayOfArrays.push(originalArray.slice(i, i + size));
  }

  return arrayOfArrays;
};

const sleepProcess = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
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
      `Hi <i>${studentsData.studentName}</i>,<br>
        <br>
      Your peer evaluation sheet is: <a href="${studentsData.studentSheet}">${studentsData.studentSheet}</a>.<br>
        <br>
      The deadline to complete the peer evaluation: ${DEADLINE}.<br>
      Thanks,
        <br>
      Module ${MODULE_NAME} Automation.`
    );
  }

  if (studentEmail === TEST_DATA.STUDENT_EMAIL) {
    return studentsData.studentSheet;
  }

  return null;
};

const updateSettings = () => {
  protectRangesSpreadsheet({ spreadsheetUrl: MASTER_SPREADSHEET_URL });
};

const protectRangesSpreadsheet = ({ spreadsheetUrl }) => {
  removeProtectSpreadsheet({
    spreadsheetUrl,
    worksheetName: MASTER_FORM_WORKSHEET_NAME,
  });
  const { listOfProtectedRangesString } = getListOfProtectedRangesString();

  protectSpreadsheet({
    spreadsheetUrl,
    listOfProtectedRangesString,
    worksheetName: MASTER_FORM_WORKSHEET_NAME,
  });
};

const removeProtectSpreadsheet = ({ spreadsheetUrl, worksheetName }) => {
  let protectionsByRange = SpreadsheetApp.openByUrl(spreadsheetUrl)
    .getSheetByName(worksheetName)
    .getProtections(SpreadsheetApp.ProtectionType.RANGE);
  removeProtectionDescription({ protections: protectionsByRange });
};

const removeProtectionDescription = ({ protections }) => {
  for (let i = 0; i < protections.length; i++) {
    protections[i].remove();
  }
};

const getListOfProtectedRangesString = () => {
  const data = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL)
    .getSheetByName(MASTER_WORKSHEET_SETTINGS)
    .getDataRange()
    .getValues();

  return {
    listOfProtectedRangesString: data[3][1],
  };
};

const protectSpreadsheet = ({
  spreadsheetUrl,
  listOfProtectedRangesString,
  worksheetName,
}) => {
  let sheet =
    SpreadsheetApp.openByUrl(spreadsheetUrl).getSheetByName(worksheetName);

  const listOfProtectedRanges = listOfProtectedRangesString.split(",");
  const emailListEditAccess = EMAIL_LIST_EDIT_ACCESS.split(",");

  listOfProtectedRanges.forEach((range) => {
    protection = sheet.getRange(range);

    protection = protection
      .protect()
      .setDescription("Peer Evaluation Protection");

    protection.removeEditors(protection.getEditors());

    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }

    protection.addEditors(emailListEditAccess);
  });
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

const getProjectFolderDriveUrl = () => {
  let folders = DriveApp.getFoldersByName(GOOGLE_DRIVE_FOLDER_NAME);
  let folder = folders.hasNext() ? folders.next() : null;

  if (folder) {
    return folder.getUrl();
  }

  return null;
};

const getAllSpreadsheetIdsOnProject = () => {
  let folders = DriveApp.getFoldersByName(GOOGLE_DRIVE_FOLDER_NAME);
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL);

  let folder = folders.hasNext() ? folders.next() : null;

  if (folder) {
    let sheetIds = [];

    let files = DriveApp.getFolderById(folder.getId()).getFiles();

    while (files.hasNext()) {
      var file = files.next();
      if (file.getId() !== sheet.getId()) {
        sheetIds.push(file.getId());
      }
    }

    return sheetIds;
  }

  return [];
};

const getAllPeerEvaluationData = () => {
  updateSettings();
  const sheetIds = getAllSpreadsheetIdsOnProject();

  let allDataSheets = [];

  sheetIds.forEach((sheetId) => {
    let sheetData = SpreadsheetApp.openById(sheetId).getDataRange().getValues();
    let sheetDataSanitized = getSheetDataSanitized(sheetData);

    allDataSheets.push(...sheetDataSanitized);
  });

  let importDataSheet = SpreadsheetApp.openByUrl(
    MASTER_SPREADSHEET_URL
  ).getSheetByName(MASTER_WORKSHEET_IMPORTED_DATA);

  importDataSheet.getRange(IMPORTER_DATA_RANGE).clearContent();

  if (allDataSheets.length) {
    importDataSheet
      .getRange(2, 1, allDataSheets.length, allDataSheets[0].length)
      .setValues(allDataSheets);

    sendEmail(
      EMAIL_NOTIFICATIONS,
      `Module ${MODULE_NAME} Peer Evaluation completed`,
      `Hello,<br>
        <br>
      The module ${MODULE_NAME} has collected all data from the peer evaluation<br>
        <br>
      Thanks,
        <br>
      Module ${MODULE_NAME} Automation.`
    );
  } else {
    sendEmail(
      EMAIL_NOTIFICATIONS,
      `Module ${MODULE_NAME} Peer Evaluation completed - Empty evaluations`,
      `Hello,<br>
        <br>
      The module ${MODULE_NAME}has not data to collect for the peer evaluation of the module.
        <br>
      Thanks,
        <br>
      Module ${MODULE_NAME} Automation.`
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
  const date = sheetData[0][1];
  const studentEmail = sheetData[1][1];
  const groupName = sheetData[3][1];
  const comment = sheetData[2][8];

  let dataReview = [];

  for (x = FIRST_ROW_STUDENT_DATA - 1; x < sheetData.length; x++) {
    if (sheetData[x][0].toString().length) {
      let row = [date, studentEmail, groupName, comment, ...sheetData[x]];
      row.pop();
      row.pop();
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

  masterSheet.getRange("D2:D").clearContent();
};

const moveMasterToProjectFolder = () => {
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL);

  let file = DriveApp.getFileById(sheet.getId());
  let folderId = null;

  try {
    let folders = DriveApp.getFoldersByName(GOOGLE_DRIVE_FOLDER_NAME);
    folderId = folders.next();
  } catch (err) {
    folderId = DriveApp.createFolder(GOOGLE_DRIVE_FOLDER_NAME);
  }

  file.moveTo(folderId);
};

const sendEmailOnAppSetup = ({ newDeploymentURL, projectFolderDriveUrl }) => {
  sendEmail(
    EMAIL_NOTIFICATIONS,
    `Web app created successfully - ${GOOGLE_DRIVE_FOLDER_NAME}`,
    `Hi, <br>
      <br>
    The web app URL is: <a href="${newDeploymentURL}">${newDeploymentURL}</a>.<br>
      <br>
    The Google Drive Folder of the project is: <a href="${projectFolderDriveUrl}">${projectFolderDriveUrl}</a>.<br>
      <br>
    Thanks,
      <br>
    Module ${MODULE_NAME} Automation.`
  );
};

const getTodayDate = () => {
  return Utilities.formatDate(new Date(), "Europe/London", "dd/MM/yyyy");
};

const doGet = () => {
  let htmlOutput = HtmlService.createTemplateFromFile("web-app").evaluate();
  htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1");
  return htmlOutput;
};

const saveEndPointUrl = ({ newDeploymentURL }) => {
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL).getSheetByName(
    MASTER_WORKSHEET_SYSTEM_DATA
  );

  sheet.getRange(ENDPOINT_CELL).setValue(newDeploymentURL);
};

const getEndPointUrl = () => {
  let sheet = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL).getSheetByName(
    MASTER_WORKSHEET_SYSTEM_DATA
  );

  const data = sheet.getRange(ENDPOINT_CELL).getValues();

  return data[0][0];
};

const doPost = (e) => {
  const response = { result: "success" };

  const { studentsData } = JSON.parse(e.postData.contents);

  studentsData.forEach((student) => {
    try {
      createStudentSheetByStudentEmail(student[1]);
    } catch (e) {
      console.error(`Error: ${e} for ${student[1]}`);

      sendEmail(
        EMAIL_ON_ERROR,
        `Error - Creating Sheet`,
        `Error: ${e} for ${student[1]}`
      );
    }
  });

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON
  );
};
