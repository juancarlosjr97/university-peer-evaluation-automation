const TEST_DATA = {
  STUDENT_ID: "TEST",
  STUDENTS_BY_GROUP_NAME: [
    ["Student - Test 1"],
    ["Student - Test 2"],
    ["Student - Test 3"],
  ],
};

const testWebApp = () => {
  let testSheetUrl = createStudentSheetByStudentId(TEST_DATA.STUDENT_ID);
  let testSheetId = SpreadsheetApp.openByUrl(testSheetUrl).getId();
  removeParentFolderDrive(testSheetId);
  removeFileById(testSheetId);
  Logger.log("The app has been tested successfully.");
};
