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
bash setup.sh ${SCRIPT_ID}
```

### Automated Testing

Execute on the Apps Script Project the method `testWebApp` from the `test.gs`.

### Development

To read about the development and roadmap visit our [projects](https://github.com/juancarlosjr97/university-peer-evaluation-automation/projects)

### Performance

To read about the performance [performance](./PERFORMANCE.md)
