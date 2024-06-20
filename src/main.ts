import * as core from '@actions/core'
import * as os from 'os'

import {cacheFile, extractTar, find, extractZip} from '@actions/tool-cache'
import {chmodSync, unlinkSync} from 'fs'
import {HttpClient} from '@actions/http-client'
import {pipeline} from 'node:stream'
import {promisify} from 'node:util'
import {createWriteStream} from 'node:fs'

const GH_CLI_TOOL_NAME = 'gh'
const TOKEN = core.getInput('token')
const AUTH_HTTP = new HttpClient('gh-release', [], {
  headers: {
    Authorization: `Bearer ${TOKEN}`
  }
})

run()

async function run(): Promise<void> {
  try {
    await install()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * Install the GH CLI in self hosted runner
 */
async function install(): Promise<void> {
  core.info('Installing gh cli in self hosted runner')

  const version = core.getInput('version') || (await getLatestVersion())
  const platform = core.getInput('platform') || os.platform()
  const archive_format = core.getInput('archive_format') || 'tar.gz'
  const packageUrl = `https://github.com/cli/cli/releases/download/v${version}/gh_${version}_${platform}_amd64.${archive_format}`

  core.info(`Downloading gh cli from ${packageUrl}`)

  let cliPath = find(GH_CLI_TOOL_NAME, version)

  if (!cliPath) {
    const downloadPath = 'gh_tar' // Temporary file path
    const response = await AUTH_HTTP.get(packageUrl)
    if (response.message.statusCode !== 200) {
      throw new Error(
        `Unexpected HTTP response: ${response.message.statusCode}`
      )
    }
    await promisify(pipeline)(response.message, createWriteStream(downloadPath))

    chmodSync(downloadPath, '755')
    cliPath =
      archive_format === 'tar.gz'
        ? await extractTar(downloadPath, find(GH_CLI_TOOL_NAME, version))
        : await extractZip(downloadPath, find(GH_CLI_TOOL_NAME, version))
    cliPath = await cacheFile(
      `${cliPath}/gh_${version}_${platform}_amd64/bin/gh`,
      'gh',
      GH_CLI_TOOL_NAME,
      version
    )
    unlinkSync(downloadPath)
  }

  core.addPath(cliPath)
  core.info('gh cli installed successfully')
}

async function getLatestVersion(): Promise<string> {
  const response = await AUTH_HTTP.getJson(
    'https://api.github.com/repos/cli/cli/releases/latest'
  )
  let latestVersion = (response.result as {tag_name: string}).tag_name
  latestVersion = latestVersion.startsWith('v')
    ? latestVersion.substring(1)
    : latestVersion
  return latestVersion
}
