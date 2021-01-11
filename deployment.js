const saveAndDeployNewVersion = () => {
  let projectId = ScriptApp.getScriptId();
  let description = `New deployment ${getTodayDate()}`;
  let webAppConfig = {
    executeAs: "USER_DEPLOYING",
    access: "ANYONE_ANONYMOUS",
  };
  updateManifest_(projectId, webAppConfig);
  let newVersionNumber = saveNewProjectVersion_(projectId, description);
  let webAppUrl = deployNewProjectVersion_(projectId, newVersionNumber);
  return webAppUrl;
};

const updateManifest_ = (projectId, webAppConfig) => {
  let output = makeRequest_(projectId, "content");
  let files = output.files;
  for (let i in files) {
    if (files[i].type == "JSON") {
      let manifest = JSON.parse(files[i].source);
      manifest.webapp = webAppConfig;
      files[i].source = JSON.stringify(manifest);
    }
  }
  makeRequest_(projectId, "content", "put", JSON.stringify({ files: files }));
};

const saveNewProjectVersion_ = (projectId, description) => {
  let payload = JSON.stringify({ description: description });
  return makeRequest_(projectId, "versions", "post", payload).versionNumber;
};

const deployNewProjectVersion_ = (projectId, newVersionNumber) => {
  let deploymentId =
    getWebAppDeploymentId_(projectId) ||
    createDeploymentAsWebApp_(projectId, newVersionNumber);

  let payload = JSON.stringify({
    deploymentConfig: {
      versionNumber: newVersionNumber,
      description: "web app meta-version",
    },
  });
  let output = makeRequest_(
    projectId,
    "deployments/" + deploymentId,
    "put",
    payload
  );
  let entryPoints = output.entryPoints;
  for (let i in entryPoints) {
    if (entryPoints[i].webApp) return entryPoints[i].webApp.url;
  }
};

const createDeploymentAsWebApp_ = (projectId, newVersionNumber) => {
  let payload = JSON.stringify({
    versionNumber: newVersionNumber,
    description: "web app meta-version",
  });
  return makeRequest_(projectId, "deployments", "post", payload).deploymentId;
};

const getWebAppDeploymentId_ = (projectId) => {
  let output = makeRequest_(projectId, "deployments");
  if (output.nextPageToken)
    throw "Project contains more than 50 saved deployments, update code to retrieve all results";
  let deployments = output.deployments;
  for (let i in deployments) {
    if (deployments[i].deploymentConfig.description == "web app meta-version")
      return deployments[i].deploymentId;
  }
};

const makeRequest_ = (projectId, resourcePath, method, payload) => {
  let baseUrl = "https://script.googleapis.com/v1/projects/";
  let url = baseUrl + projectId + "/" + resourcePath;
  let options = {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken(),
    },
  };
  if (method == "post" || method == "put") {
    options.method = method;
    options.payload = payload;
    options.headers["Content-Type"] = "application/json";
  }
  return JSON.parse(UrlFetchApp.fetch(url, options));
};
