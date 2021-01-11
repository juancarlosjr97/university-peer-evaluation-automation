const testWebApp = () => {
  let testSheetUrl = createStudentSheetByStudentId(TEST_DATA.STUDENT_ID);
  let testSheetId = SpreadsheetApp.openByUrl(testSheetUrl).getId();
  removeParentFolderDrive(testSheetId);
  removeFileById(testSheetId);
  Logger.log("The app has been tested successfully.");
};
