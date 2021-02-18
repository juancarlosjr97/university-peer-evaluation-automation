const TEST_DATA = {
  STUDENT_EMAIL: "TEST",
  STUDENTS_BY_GROUP_NAME: [
    ["Student - Test 1"],
    ["Student - Test 2"],
    ["Student - Test 3"],
  ],
};

const testWebApp = () => {
  let testSheetUrl = createStudentSheetByStudentEmail(TEST_DATA.STUDENT_EMAIL);
  let testSheetId = SpreadsheetApp.openByUrl(testSheetUrl).getId();
  removeParentFolderDrive(testSheetId);
  removeFileById(testSheetId);
  Logger.log("The app has been tested successfully.");
};
