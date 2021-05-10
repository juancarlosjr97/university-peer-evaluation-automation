const filterOnlyNumber = (arrayMix) => {
  return arrayMix.filter((x) => typeof x === "number");
};

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
      studentsByGroup.add(`${dataStudents[x][0]} - ${dataStudents[x][1]}`);
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
  const dataSanitized = {};
  const dataByStudentReviewed = {};

  Object.keys(dataByGroups).map((key) => {
    dataSanitized[key] = [];
    dataByGroups[key].map((dataByGroup, index) => {
      dataByStudentReviewed[index] =
        typeof dataByStudentReviewed[index] === "object"
          ? dataByStudentReviewed[index]
          : [];

      dataByStudentReviewed[index].push(dataByGroup[dataByGroup.length - 1]);
      dataSanitized[key].push(dataByGroup[dataByGroup.length - 1]);
    });
  });

  let totalContributions = Object.keys(dataByStudentReviewed).length;
  let totalSubmission = totalContributions;

  const allEqual = (arr) => arr.every((val) => val === arr[0]);

  Object.keys(dataSanitized).forEach((key) => {
    const areAllValuesEqual = allEqual(dataSanitized[key]);

    if (areAllValuesEqual && dataSanitized[key][0] === 0) {
      dataSanitized[key] = Array(dataSanitized[key].length)
        .fill()
        .map((_, i) => "-");
      totalSubmission = totalSubmission - 1;
    }

    dataSanitized[key] = dataSanitized[key].map((item) => {
      if (item === 0) {
        return "-";
      }
      return item;
    });
  });

  Object.keys(dataByStudentReviewed).forEach((key) => {
    const areAllValuesEqual = allEqual(dataByStudentReviewed[key]);

    if (areAllValuesEqual && dataByStudentReviewed[key][0] === 0) {
      dataByStudentReviewed[key] = Array(dataByStudentReviewed[key].length)
        .fill()
        .map((_, i) => "-");
      totalContributions = totalContributions - 1;
    }

    dataByStudentReviewed[key] = dataByStudentReviewed[key].map((item) => {
      if (item === 0) {
        return "-";
      }
      return item;
    });
  });

  const totalDivisionStudent = Math.max(totalSubmission, totalContributions);

  return {
    dataSanitized,
    dataByStudentReviewed,
    totalSubmission,
    totalContributions,
    totalDivisionStudent,
  };
};

const getRoundedNumber = ({ value }) => {
  return value;
  const valueNumber = typeof value === "string" ? value.toString() : value;

  return Math.round(valueNumber);
};

const getAvgByStudentIndividually = ({
  dataByStudentReviewed,
  totalDivisionStudent,
}) => {
  const avgByStudentIndividually = [];

  Object.keys(dataByStudentReviewed).map((key) => {
    const dataByStudentReviewedSanitised = filterOnlyNumber(
      dataByStudentReviewed[key]
    );

    const sum = dataByStudentReviewedSanitised.reduce((x, y) => x + y, 0);

    if (sum === 0) {
      avgByStudentIndividually.push("-");
      return null;
    }

    const avg = sum / totalDivisionStudent || 0;
    const avgSanitised = getRoundedNumber({ value: avg });

    avgByStudentIndividually.push(avgSanitised);
  });

  return avgByStudentIndividually;
};

const getSumAndAvgGroup = (avgByStudentIndividually) => {
  const avgByStudentIndividuallySanitised = filterOnlyNumber(
    avgByStudentIndividually
  );

  const sumGroupAvg = avgByStudentIndividuallySanitised.reduce(
    (x, y) => x + y,
    0
  );

  const avgByGroup =
    sumGroupAvg / avgByStudentIndividuallySanitised.length || 0;

  return {
    sumGroupAvg,
    avgByGroup: avgByGroup,
  };
};

const getTotalGroupPeerAvgByStudents = (
  avgByStudentIndividually,
  sumGroupAvg
) => {
  const totalGroupPeerAvgByStudents = avgByStudentIndividually.map(
    (avgByStudent) => {
      if (avgByStudent === "-") {
        return "-";
      }
      const totalGroupPeerAvgByStudent = avgByStudent / sumGroupAvg;

      return totalGroupPeerAvgByStudent;
    }
  );

  return totalGroupPeerAvgByStudents;
};

const getSettingsAdjustedMarkGrade = () => {
  const data = SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL)
    .getSheetByName(MASTER_WORKSHEET_SETTINGS)
    .getDataRange()
    .getValues();

  return {
    maxGradeIncrease: data[1][1],
    maxGradeDecrease: data[2][1],
  };
};

const getAdjustedMark = (
  preAdjustedMarkPeerStudents,
  groupProjectMark,
  studentsByGroup
) => {
  const adjustedMarkPeerStudent = [];

  const settingsAdjustedMarkGrade = getSettingsAdjustedMarkGrade();

  const gradeMax =
    groupProjectMark + settingsAdjustedMarkGrade["maxGradeIncrease"];
  const gradeMin =
    groupProjectMark - settingsAdjustedMarkGrade["maxGradeDecrease"];

  preAdjustedMarkPeerStudents.forEach((preAdjustedMarkPeerStudent) => {
    if (preAdjustedMarkPeerStudent === "-") {
      adjustedMarkPeerStudent.push(preAdjustedMarkPeerStudent);
      return null;
    }

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

    if (typeof gradeAdjusted === "string") {
      gradeAdjusted = Number(gradeAdjusted);
    }

    const sanitisedGradeAdjusted = getRoundedNumber({
      value: gradeAdjusted,
    });

    adjustedMarkPeerStudent.push(sanitisedGradeAdjusted);
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

  const { studentSubmitted, dataByGroups } =
    getStudentsSubmittedAndDataByGroups(peerEvaluationDataImported, groupName);

  const {
    dataSanitized,
    dataByStudentReviewed,
    totalSubmission,
    totalContributions,
    totalDivisionStudent,
  } = getDataSanitinisedAndDataByStudentReviewed(dataByGroups);

  const avgByStudentIndividually = getAvgByStudentIndividually({
    dataByStudentReviewed,
    totalDivisionStudent: totalSubmission,
  });

  const { sumGroupAvg, avgByGroup } = getSumAndAvgGroup(
    avgByStudentIndividually
  );

  const totalGroupPeerAvgByStudents = getTotalGroupPeerAvgByStudents(
    avgByStudentIndividually,
    sumGroupAvg
  );

  const getPreAdjustedMark = ({
    totalDivisionStudent,
    totalGroupPeerAvgByStudents,
  }) => {
    const preAdjustedMarkPeerStudents = [];

    totalGroupPeerAvgByStudents.forEach((totalTeamPeerAvgByStudent) => {
      if (totalTeamPeerAvgByStudent === "-") {
        preAdjustedMarkPeerStudents.push(totalTeamPeerAvgByStudent);
        return null;
      }

      const dirtyTotalTeamPeerAvgByStudent =
        totalTeamPeerAvgByStudent * totalDivisionStudent * groupProjectMark;

      const sanitisedTotalTeamPeerAvgByStudent = getRoundedNumber({
        value: dirtyTotalTeamPeerAvgByStudent,
      });

      preAdjustedMarkPeerStudents.push(sanitisedTotalTeamPeerAvgByStudent);
    });

    return preAdjustedMarkPeerStudents;
  };

  const preAdjustedMarkPeerStudents = getPreAdjustedMark({
    totalDivisionStudent,
    totalGroupPeerAvgByStudents,
  });

  const adjustedMarkByGroup = getAdjustedMark(
    preAdjustedMarkPeerStudents,
    groupProjectMark,
    studentsByGroup
  );

  return {
    dataSanitized,
    avgByStudentIndividually,
    totalGroupPeerAvgByStudents,
    studentsByGroup,
    sumGroupAvg,
    avgByGroup,
    preAdjustedMarkPeerStudents,
    adjustedMarkByGroup,
    studentSubmitted,
    totalSubmission,
    totalContributions,
  };
};

const getAdjustedMarkViewByGroup = (
  peerEvaluationDataImported,
  dataStudents,
  groupName,
  groupProjectMark
) => {
  const {
    dataSanitized,
    avgByStudentIndividually,
    totalGroupPeerAvgByStudents,
    studentsByGroup,
    sumGroupAvg,
    avgByGroup,
    preAdjustedMarkPeerStudents,
    adjustedMarkByGroup,
    studentSubmitted,
    totalSubmission,
    totalContributions,
  } = getAdjustedMarkByGroupData(
    groupName,
    groupProjectMark,
    peerEvaluationDataImported,
    dataStudents
  );

  const studentsById = getStudentsId(dataStudents);

  const dataAdjustedMarkView = [];

  dataAdjustedMarkView.push(["Group Name", groupName]);

  dataAdjustedMarkView.push(["Group Project Mark", groupProjectMark]);

  dataAdjustedMarkView.push(["Average by Group", avgByGroup]);

  dataAdjustedMarkView.push(["Sum of Group Average", sumGroupAvg]);

  dataAdjustedMarkView.push(["Total Submissions", totalSubmission]);

  dataAdjustedMarkView.push(["Total Contributions", totalContributions]);

  dataAdjustedMarkView.push(["Student Emails", ...studentsByGroup]);

  Object.keys(dataSanitized).map((studentId) => {
    dataAdjustedMarkView.push([
      studentsById[studentId],
      ...dataSanitized[studentId],
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

const getPeerEvaluationDataImported = () => {
  return SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL)
    .getSheetByName(MASTER_WORKSHEET_IMPORTED_DATA)
    .getDataRange()
    .getValues();
};

const getStudentsData = () => {
  return SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL)
    .getSheetByName(MASTER_WORKSHEET_DATA)
    .getDataRange()
    .getValues();
};

const getGroupGradesAndData = () => {
  return SpreadsheetApp.openByUrl(MASTER_SPREADSHEET_URL)
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

  let adjustedDataWorksheet = SpreadsheetApp.openByUrl(
    MASTER_SPREADSHEET_URL
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
