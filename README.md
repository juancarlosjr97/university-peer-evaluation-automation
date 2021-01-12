# University Peer Evaluation Automation

This repository contains the code of the University Peer Evaluation Automation that runs on Apps Script using `V8` Runtime.

## How does it work?

The project creates automatically a web app that allows to collect the peer-evaluation data by student and calculate the adjusted mark by group by student.

The data is collected automatically using a datetime trigger, and the emails configured will be notified after the data has been collected successfully.

The data collected is saved on spreadsheets created using the web app by the student, and those spreadsheet are saved automatically on a Google Drive folder.

If a student has already created a spreadsheet for peer-evaluation, it cannot access the spreadsheet. It will have to request the spreadsheet URL to the project owner.

## Setup

It is recommend to read the entirely document before proceeding with the setup.

### Part 1. Google Cloud Platform (GCP)

1. Go to https://console.developers.google.com/ and create a project
2. Click on `Library` and enable the following APIs:
   - Apps Script API
   - Google Drive API
3. Go back to the main menu by clicking on `APIs & Services`, and go to `OAuth consent screen`
4. Select as `User Type` the `External` option, then click on create
5. Add an `App name`, and `User support email` and the email on the `Developer contact information`
6. Click on `Save and continue` on the `Scopes` section
7. Add your email as a `Test user`, then click on `Save and continue`
8. After verified the information is correct, click on `Back to dashboard`
9. Click on `Publish app`, and then click on `Confirm`
10. Click on `Project settings` and copy the `Project number` to use later

### Part 2. Project Spreadsheet Setup

1. Create a copy of this spreadsheet: https://docs.google.com/spreadsheets/d/1ZLAeJ6h1pGAb1dwgBzpYfXKZTNM7dwVsA47zVMtIaEo/edit?usp=sharing. To create a copy click on `File` and then on `Make a copy`. The spreadsheet copied contains example data on the `DATA` and `TEAM_GROUP_GRADES` sheets.

2. Update the sheet `DATA` with the correct data of the students, the names and the student group

3. Clear the data of the sheet `TEAM_GROUP_GRADES` from the second row.

4. Copy the whole spreadsheet url to use later.

#### Rules of editing the Project Spreadsheet

- Do not edit the `MASTER_SHEET` cells location, any text can be modified as long the cells are not changing its location. e.g., `Student Name` is `A7` but the text can be modified to `Students` as long the cell continues to be `A7`.

- After pulling data to the `IMPORTED_DATA` sheet, do not make any changes manually to that sheet as it could create issues creating the `ADJUSTED_GRADES`.

### Part 3. Apps Script Project Setup

1. Open the following link https://script.google.com/d/1Ex0nSbU-tmLgjEXXmKoA4hizxAj3Siu1OHZvjYzDzFVmsoBT1rAXGMee/edit?usp=sharing and create a copy of the Apps Script project by clicking on the expandable navigation on the far left menu item named `Overview`, and then on the `Make a copy` icon

2. Change the name of the new Apps Script Project by clicking on the `Copy of Template Project - University - Peer Evaluation Automation` name

3. Open the expandable navigation on the far left, and go to `Project Settings` and on `Google Cloud Platform (GCP) Project` click on `Change project`, and then enter the `Project number` copied from the `Google Cloud Platform` project created earlier, and then click on `Set project` to update the `Project number`

4. Navigate to https://script.google.com/home/usersettings and change the `Google Apps Script API` to `On`. You can skip this step if you have already done it before

5. Navigate to `My Projects`, and open the project just created. If you skipped the step 4, open the expandable navigation on the far left, and go to `Editor`

6. Open the file `setup.gs`. Do not make any other changes to any other file unless you know what you are doing.

7. Replace the value of the constant `MASTER_SPREADSHEET_URL` to the spreadsheet URL created on the `Project Spreadsheet Setup` without deleting the double quotes

8. Update the value of the constant `COLLECT_DATA_TRIGGER_DATE` to the date that you would like the system to automatically collect the data without deleting the double quotes

9. Update the constant `MODULE_NAME` to your module name and the title of the Web App

10. Update the constant `GDRIVE_FOLDER_NAME`. The value on the `GDRIVE_FOLDER_NAME` would be the name of the Google Drive folder for this project

The constant `MODULE_NAME` will be used to identified the spreadsheets and the Google Drive folder.

11. Update the constant `EMAIL_NOTIFICATIONS` using a comma separated emails following the example

12. Click on `Run`

During the first execution, the system will ask for your permissions to execute code on your behalf, as sending emails, creating/deleting files/folders.

For more information about what the system is requesting permissions, visit the following page: https://developers.google.com/apps-script/guides/services/authorization. Additionally, to understand the specifics permissions of this project, go to the `Overview` and see the permissions under `Project OAuth Scopes`

13. Click on `Review permissions`

14. Select the account added as a `Test user` during the `Google Cloud Platform` setup

15. If appears a page with a title `Google hasn't verified this app`, click on `Advance` and then on `Go to PROJECT_NAME (unsafe)`. For more information about the information about `Google hasn't verified this app` visit the following link: https://support.google.com/cloud/answer/7454865?hl=en

The following page will show all the permissions that the system is requesting access to execute on your Apps Script project

16. Click on `Allow`

If everything was executed correctly, you should have received an email with the link to your Web App. Additionally, it should have created two triggers:

- The collection of the data automatically by a specific date
- The `Manual Triggers` menu on the project spreadsheet

To check if everything was executed correctly, the `Execution log` will reflect the following information with a different Web app URL.

#### Execution log

| Syntax     | Description | Description                                                                                                                     |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 5:50:00 AM | Notice      | Execution started                                                                                                               |
| 5:50:00 AM | Info        | Web app deployed successfully.                                                                                                  |
| 5:50:00 AM | Info        | Web app URL: https://script.google.com/macros/s/AKfycbw6ez_I6h9fVrZZJrGS4UiABsYl_7veMQjbAYCcHp1fCMQZslwPSaKw_kT_O_H6SJKEHQ/exec |
| 5:50:00 AM | Info        | The trigger was created successfully. The trigger will be executed on the following date: 10/01/2021.                           |
| 5:50:00 AM | Info        | The trigger was created successfully. The trigger will be executed on master sheet opening.                                     |
| 5:50:00 AM | Notice      | Execution completed                                                                                                             |

## Usage

1. Share with your student the Web app
2. Open your spreadsheet project, and the new menu has been created named `Manual triggers`

- Get All Peer-Evaluation Data
  - It will collect all the peer-evaluation created and will be added to the `IMPORTED_DATA`
- Get Adjusted Marks
  - It will create the adjusted marks using the grades from the `TEAM_GROUP_GRADES` and the data from `IMPORTED_DATA`
  - By clicking on `Get Adjusted Marks` it will execute the `Get All Peer-Evaluation Data` automatically to avoid using incomplete data
- Delete Peer-Evaluation files
  - It will delete the not longer needed peer-evaluation files created by the students automatically

### Calculation explanation

- Avg score by student = Avg of all score given to a student
- Average by Group score = Avg of all scores given to the team
- Sum of Group Average = Sum of all scores averages give to a student
- Student mark/total team = Avg score by student / Sum of all scores averages give to a student
- Preadjusted project mark = Student mark/total team *Total Submissions *Group Project Mark
- Adjusted/Final mark = Preadjusted project mark +/- 10 group mark. Not lower than 0 or higher than 100

## Sharing Access

### Data

By sharing access to the data, those invited will not be able to execute the `Manual triggers` to collect data or get the adjusted marks.

###### Project Spreadsheet

Go to the project spreadsheet, click on `Share`, enter the email of the person to share. Select either `Editor` or `Viewer` depending on the access require to the project spreadsheet.

###### Google Drive

1. Go to `https://drive.google.com/drive/my-drive` and open the folder created for the project. The folder should have the same name as the constant `GDRIVE_FOLDER_NAME` created during `Apps Script Project Setup` step `10`.

2. Right click on the folder, and click on `Share` and enter the email of the person to share. Select either `Editor` or `Viewer` depending on the access require to the project Google Drive folder.

### Manual Triggers

By sharing access will allow to those invited to execute the `Manual triggers` on the project spreadsheet.

#### Apps Script Project

Go to `https://script.google.com/`, right click on the project and click on `Share`. Select either `Editor` or `Viewer` depending on the access require to the Apps Script project. It is recommended to only share `Viewer` access to the Apps Script project to avoid unwanted changes to the code.

#### GCP Project

1. Copy the GCP project number used and replace the `PROJECT_NUMBER` on the following url: `https://console.developers.google.com/apis/credentials/consent?projectid=PROJECT_NUMBER`

2. On the `Test users` section, click on `Add users`

3. Enter the email of the user to share access

## Multiple project setup

In order to setup multiple project, repeat the Part 2 and 3 of the setup using the `Project number` of the `GCP` project created the first time. The `Google Cloud Platform` project created the first time during the setup Part 1, can be used for multiple projects, in other words, you only need to create a `GCP` project once.

## Development

Follow this section if you would like to contribute to this project by editing the code.

### Prerequisites

We need to have installed the following services:

- [GIT](https://git-scm.com/)
- [NodeJS v12](https://nodejs.org/en/) - Recommend to use [nvm](https://github.com/nvm-sh/nvm)
- [clasp](https://developers.google.com/apps-script/guides/clasp)
- Google account with Google Drive enabled

and a Unix based computer, such Mac or Ubuntu.

### Installation Local Development

#### Source Code

We need to clone the repositories in our local environment:

```bash
git clone git@github.com:juancarlosjr97/university-peer-evaluation-automation.git
```

#### Apps Script project setup

Create an empty Apps Script project or copy the ScripsId to add it using the setup script.

```
cd path/to/project
bash setup.sh $SCRIPT_ID
```

### Automated Testing

Execute on the Apps Script Project the method `testWebApp`.

### Development Roadmap

- [ ] Sending automatic email to the student with the link to the spreadsheet after its creation
- [ ] Formatting the `ADJUSTED_GRADES` sheet instead of plain text
- [ ] Semantic releases
