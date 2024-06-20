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
      uses: ksivamuthu/actions-setup-gh-cli@<VERSION>
      with:
        token: ${{ secrets.TVSIT_AXON_COM_PUBLIC_PAT }}
        version: 2.24.3
    - run: |
        gh version
```

`token`: The PAT token to authenticate github.io when installing the gh cli, avoiding the rate limit issues.
