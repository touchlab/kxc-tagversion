import * as core from '@actions/core'
import simpleGit from 'simple-git'

export async function run(): Promise<void> {
  try {
    const commitMessage: string = core.getInput('commitMessage')
    const tagMessage: string = core.getInput('tagMessage')
    const tagVersion: string = core.getInput('tagVersion')
    const branchName: string = core.getInput('branchName')

    core.debug(`commitMessage: ${commitMessage}`)
    core.debug(`tagMessage: ${tagMessage}`)
    core.debug(`tagVersion: ${tagVersion}`)
    core.debug(`branchName: ${branchName}`)

    const git = simpleGit()

    await git.pull()

    await git.checkoutLocalBranch(branchName)

    const diff = await git.diffSummary()

    if (diff.changed > 0) {
      await git.add('.')
      await git.commit(commitMessage)
    }

    await git.addAnnotatedTag(tagVersion, tagMessage)
    await git.raw('push', 'origin', '-f', `refs/tags/${branchName}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
