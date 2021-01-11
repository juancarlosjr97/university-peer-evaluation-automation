const getStudentsId = (dataStudents) => {
  const studentsById = {};

  for (x = 1; x < dataStudents.length; x++) {
    studentsById[dataStudents[x][1]] = dataStudents[x][0];
  }

  return studentsById;
};

const getStudentsByGroup = (dataStudents, groupName) => {
  const studentsByGroup = new Set();
  for (x = 1; x < dataStudents.length; x++) {
    if (dataStudents[x][2] === groupName) {
      studentsByGroup.add(dataStudents[x][0]);
    }
  }
  return studentsByGroup;
};

const getStudentsSubmittedAndDataByGroups = (
  peerEvaluationDataImported,
  groupName
) => {
  const studentSubmitted = new Set();

  const dataByGroups = {};

  for (x = 1; x < peerEvaluationDataImported.length; x++) {
    if (peerEvaluationDataImported[x][2] === groupName) {
      dataByGroups[peerEvaluationDataImported[x][1]] =
        typeof dataByGroups[peerEvaluationDataImported[x][1]] === "object"
          ? dataByGroups[peerEvaluationDataImported[x][1]]
          : [];

      dataByGroups[peerEvaluationDataImported[x][1]].push(
        peerEvaluationDataImported[x]
      );
      studentSubmitted.add(peerEvaluationDataImported[x][1]);
    }
  }

  return {
    studentSubmitted,
    dataByGroups,
  };
};

const getDataSanitinisedAndDataByStudentReviewed = (dataByGroups) => {
  const dataSanitised = {};
  const dataByStudentReviewed = {};

  Object.keys(dataByGroups).map((key) => {
    dataSanitised[key] = [];
    dataByGroups[key].map((dataByGroup, index) => {
      dataByStudentReviewed[index] =
        typeof dataByStudentReviewed[index] === "object"
          ? dataByStudentReviewed[index]
          : [];

      dataByStudentReviewed[index].push(dataByGroup[dataByGroup.length - 1]);
      dataSanitised[key].push(dataByGroup[dataByGroup.length - 1]);
    });
  });

  return { dataSanitised, dataByStudentReviewed };
};

const getAvgByStudentIndividually = (dataByStudentReviewed) => {
  const avgByStudentIndividually = [];

  Object.keys(dataByStudentReviewed).map((key) => {
    const sum = dataByStudentReviewed[key].reduce((x, y) => x + y, 0);
    const avg = sum / dataByStudentReviewed[key].length || 0;
    avgByStudentIndividually.push(avg);
  });

  return avgByStudentIndividually;
};

const getSumAndAvgGroup = (avgByStudentIndividually) => {
  const sumGroupAvg = avgByStudentIndividually.reduce((x, y) => x + y, 0);
  const avgByGroup = sumGroupAvg / avgByStudentIndividually.length || 0;

  return {
    sumGroupAvg,
    avgByGroup,
  };
};

const getTotalGroupPeerAvgByStudents = (
  avgByStudentIndividually,
  sumGroupAvg
) => {
  const totalGroupPeerAvgByStudents = [];

  avgByStudentIndividually.map((avgByStudent) => {
    totalGroupPeerAvgByStudents.push(avgByStudent / sumGroupAvg);
  });

  return totalGroupPeerAvgByStudents;
};

const getAdjustedMark = (
  preAdjustedMarkPeerStudents,
  groupProjectMark,
  studentsByGroup
) => {
  const adjustedMarkPeerStudent = [];

  const gradeMin = groupProjectMark - 10;
  const gradeMax = groupProjectMark + 10;

  preAdjustedMarkPeerStudents.map((preAdjustedMarkPeerStudent) => {
    let gradeAdjusted = null;

    if (preAdjustedMarkPeerStudent < gradeMin) {
      gradeAdjusted = gradeMin;
    } else if (preAdjustedMarkPeerStudent > gradeMax) {
      gradeAdjusted = gradeMax;
    } else {
      gradeAdjusted = preAdjustedMarkPeerStudent;
    }

    if (gradeAdjusted < 0) {
      gradeAdjusted = 0;
    } else if (gradeAdjusted > 100) {
      gradeAdjusted = 100;
    }

    adjustedMarkPeerStudent.push(gradeAdjusted);
  });

  if (adjustedMarkPeerStudent.length) {
    return adjustedMarkPeerStudent;
  }

  let gradeWithoutReview = Array([...studentsByGroup].length);
  gradeWithoutReview.fill(groupProjectMark);
  return gradeWithoutReview;
};

const getAdjustedMarkByGroupData = (
  groupName,
  groupProjectMark,
  peerEvaluationDataImported,
  dataStudents
) => {
  const studentsByGroup = getStudentsByGroup(dataStudents, groupName);

  const {
    studentSubmitted,
    dataByGroups,
  } = getStudentsSubmittedAndDataByGroups(
    peerEvaluationDataImported,
    groupName
  );

  const {
    dataSanitised,
    dataByStudentReviewed,
  } = getDataSanitinisedAndDataByStudentReviewed(dataByGroups);

  const avgByStudentIndividually = getAvgByStudentIndividually(
    dataByStudentReviewed
  );

  const { sumGroupAvg, avgByGroup } = getSumAndAvgGroup(
    avgByStudentIndividually
  );

  const totalGroupPeerAvgByStudents = getTotalGroupPeerAvgByStudents(
    avgByStudentIndividually,
    sumGroupAvg
  );

  const getPreAdjustedMark = (
    studentSubmitted,
    totalGroupPeerAvgByStudents
  ) => {
    const totalStudentSubmitted = [...studentSubmitted].length;

    const preAdjustedMarkPeerStudents = [];

    totalGroupPeerAvgByStudents.map((totalTeamPeerAvgByStudent) => {
      preAdjustedMarkPeerStudents.push(
        totalTeamPeerAvgByStudent * totalStudentSubmitted * groupProjectMark
      );
    });

    return preAdjustedMarkPeerStudents;
  };

  const preAdjustedMarkPeerStudents = getPreAdjustedMark(
    studentSubmitted,
    totalGroupPeerAvgByStudents
  );

  const adjustedMarkByGroup = getAdjustedMark(
    preAdjustedMarkPeerStudents,
    groupProjectMark,
    studentsByGroup
  );

  return {
    dataSanitised,
    avgByStudentIndividually,
    totalGroupPeerAvgByStudents,
    studentsByGroup,
    sumGroupAvg,
    avgByGroup,
    preAdjustedMarkPeerStudents,
    adjustedMarkByGroup,
    studentSubmitted,
  };
};

const getAdjustedMarkViewByGroup = (
  peerEvaluationDataImported,
  dataStudents,
  groupName,
  groupProjectMark
) => {
  const {
    dataSanitised,
    avgByStudentIndividually,
    totalGroupPeerAvgByStudents,
    studentsByGroup,
    sumGroupAvg,
    avgByGroup,
    preAdjustedMarkPeerStudents,
    adjustedMarkByGroup,
    studentSubmitted,
  } = getAdjustedMarkByGroupData(
    groupName,
    groupProjectMark,
    peerEvaluationDataImported,
    dataStudents
  );

  const studentsById = getStudentsId(dataStudents);

  const totalStudentSubmissions = getTotalStudentSubmissions(studentSubmitted);

  const dataAdjustedMarkView = [];

  dataAdjustedMarkView.push(["Group Name", groupName]);
  dataAdjustedMarkView.push(["Group Project Mark", groupProjectMark]);
  dataAdjustedMarkView.push(["Average by Group", avgByGroup]);
  dataAdjustedMarkView.push(["Sum of Group Average", sumGroupAvg]);
  dataAdjustedMarkView.push(["Total Submissions", totalStudentSubmissions]);

  dataAdjustedMarkView.push(["Student IDs", ...studentsByGroup]);

  Object.keys(dataSanitised).map((studentId) => {
    dataAdjustedMarkView.push([
      studentsById[studentId],
      ...dataSanitised[studentId],
    ]);
  });

  dataAdjustedMarkView.push([]);

  dataAdjustedMarkView.push([
    "Avg score by student ",
    ...avgByStudentIndividually,
  ]);
  dataAdjustedMarkView.push([
    "Student mark/total team",
    ...totalGroupPeerAvgByStudents,
  ]);
  dataAdjustedMarkView.push([
    "Preadjusted project mark",
    ...preAdjustedMarkPeerStudents,
  ]);
  dataAdjustedMarkView.push(["Adjusted/Final mark", ...adjustedMarkByGroup]);

  dataAdjustedMarkView.push([]);
  dataAdjustedMarkView.push([]);

  return dataAdjustedMarkView;
};

const getTotalStudentSubmissions = (studentSubmitted) => {
  let totalStudentSubmissions = [...studentSubmitted].length;
  if (totalStudentSubmissions) {
    return totalStudentSubmissions;
  }

  return 0;
};

const getPeerEvaluationDataImported = () => {
  return SpreadsheetApp.openById(MASTER_SPREADSHEET_ID)
    .getSheetByName(MASTER_WORKSHEET_IMPORTED_DATA)
    .getDataRange()
    .getValues();
};

const getStudentsData = () => {
  return SpreadsheetApp.openById(MASTER_SPREADSHEET_ID)
    .getSheetByName(MASTER_WORKSHEET_DATA)
    .getDataRange()
    .getValues();
};

const getGroupGradesAndData = () => {
  return SpreadsheetApp.openById(MASTER_SPREADSHEET_ID)
    .getSheetByName(MASTER_WORKSHEET_TEAM_GROUP_GRADES)
    .getDataRange()
    .getValues();
};

const fixUnevenData = (arrayToFix) => {
  let longestArrayIndex = arrayToFix
    .map((a) => a.length)
    .indexOf(Math.max(...arrayToFix.map((a) => a.length)));

  let longestArrayValues = arrayToFix[longestArrayIndex].length;

  arrayToFix.map((ar) => {
    if (ar.length < longestArrayValues) {
      let totalMissingValues = longestArrayValues - ar.length;
      let missingValues = new Array(totalMissingValues);
      ar.push(...missingValues);
    }
  });

  return arrayToFix;
};

const getAdjustedMarks = () => {
  getAllPeerEvaluationData();

  const peerEvaluationDataImported = getPeerEvaluationDataImported();

  const dataStudents = getStudentsData();

  let groupGradesAndData = getGroupGradesAndData();
  groupGradesAndData = groupGradesAndData.slice(1);

  let adjustedMarkViewByGroup = [];

  groupGradesAndData.map((individualGradesAndData) => {
    const groupName = individualGradesAndData[0];
    const groupProjectMark = individualGradesAndData[1];

    adjustedMarkViewByGroup.push(
      ...getAdjustedMarkViewByGroup(
        peerEvaluationDataImported,
        dataStudents,
        groupName,
        groupProjectMark
      )
    );
  });

  adjustedMarkViewByGroup = fixUnevenData(adjustedMarkViewByGroup);

  let adjustedDataWorksheet = SpreadsheetApp.openById(
    MASTER_SPREADSHEET_ID
  ).getSheetByName(MASTER_WORKSHEET_ADJUSTED_GRADES);

  adjustedDataWorksheet.getDataRange().clearContent();

  adjustedDataWorksheet
    .getRange(
      1,
      1,
      adjustedMarkViewByGroup.length,
      adjustedMarkViewByGroup[0].length
    )
    .setValues(adjustedMarkViewByGroup);
};
