import { setOutput, getInput } from "@actions/core";
import { exec } from "@actions/exec";
import { getOctokit, context } from "@actions/github";
import { readFileSync } from "fs";
import { resolve } from "path";

const WORKING_DIR: string = getInput("working-dir") ?? ".";
const GITHUB_USER: string = getInput("github-user") ?? "";
const GITHUB_EMAIL: string = getInput("github-email") ?? "";
const GITHUB_TOKEN: string = getInput("github-token") ?? "";
const GITHUB_REMOTE: string = getInput("github-remote") ?? "origin";

/**
 * Get package-lock.json file content
 * @returns 
 */
const getPackageLock = async () => {
  const packageLockJson = readFileSync(
    resolve(WORKING_DIR, "package-lock.json"),
    {
      encoding: "utf-8",
    }
  );

  return packageLockJson ? JSON.parse(packageLockJson ?? undefined) : {};
};

/**
 * Run npm audit fix
 */
const npmAuditFix = async () => {
  console.info("attempting to npm audit fix...");

  await exec(`npm install`);
  await exec(`npm audit fix`);
};

/**
 * Check if npm audit fix fixes all issue(s)
 */
const checkIfAuditFixesAll = async () => {

}

/**
 * See if npm audit fixed anything
 * @param previous 
 * @param current 
 * @returns 
 */
const packageLockHasChanged = async (
  previous: string,
  current: string
): Promise<boolean> => {
  if (previous !== current) {
    setOutput("is_updated", true);

    return true;
  }

  setOutput("is_updated", false);
  return false;
};

/**
 * Assert the git config
 */
const githubConfig = async () => {
  console.info(`configuring git settings...`);

  await exec(`git config --global user.name ${GITHUB_USER}`);
  await exec(`git config --global user.email ${GITHUB_EMAIL}`);
};

/**
 * Make pull request if there's changes
 */
const makePullRequest = async () => {
  const octokit = getOctokit(GITHUB_TOKEN);

  const { data } = await octokit.request("GET /repos/:owner/:repo", {
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  await githubConfig();

  console.info(`making pull request on changes...`);

  await exec("git checkout -b npm-audit-fix", undefined, {
    cwd: WORKING_DIR,
  });
  await exec("git status");
  await exec("git add -A");
  await exec('git commit -m "npm audit fix attempted"');
  await exec(`git push --force ${GITHUB_REMOTE} npm-audit-fix`);

  await octokit.rest.pulls.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: "npm audit fixed!",
    body: "npm modules have been audited and fix have been attempted to the concerned packages.",
    base: data.default_branch,
    head: "npm-audit-fix",
  });
};

/**
 * Executor
 */
const run = async () => {
  console.info("current working dir", WORKING_DIR);

  const prevPackageLock = await getPackageLock();

  await npmAuditFix();

  const curPackageLock = await getPackageLock();

  if (!curPackageLock || !prevPackageLock) {
    throw new Error(`[run] missing previous or current package-lock.json data`);
  }

  const hasChanged = await packageLockHasChanged(
    JSON.stringify(prevPackageLock),
    JSON.stringify(curPackageLock)
  );

  if (hasChanged) {
    await makePullRequest();
  }
};

run();
