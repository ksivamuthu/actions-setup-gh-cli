# Setup gh cli action

This repo contains the github actions for installing gh cli in self hosted runners. The gh cli is available in the github hosted cloud runners. In self hosted runners, if you want to use the gh cli, you can use this action to install the gh cli. 

## Usage

To install the gh cli, use the actions as below:

   ```yaml
    build:
      runs-on: [self-hosted]
      steps:
        - uses: actions/checkout@v2
        - name: Install the gh cli
          uses: ksivamuthu/gh-cli-action
          with:
            version: 2.12.1
        - run: |
            gh version
   ```