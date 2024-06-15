import { existsSync } from 'fs';
import { join, dirname } from 'path';

import { execa, logger, pkgUp, tryPaths } from '@umijs/utils';

interface IContext {
  projectRoot: string;
  target: string;
  commitMessage: string;
}

export const initGit = async (opts: IContext) => {
  const { projectRoot, commitMessage } = opts;
  const isGit = existsSync(join(projectRoot, '.git'));
  if (isGit) return;
  try {
    await execa.execa('git', ['init'], { cwd: projectRoot, stdio: 'ignore' });
    await execa.execa('git', ['add', '-A'], {
      cwd: projectRoot,
      stdio: 'ignore',
    });
    await execa.execaCommand('git checkout -b main', {
      cwd: projectRoot,
      stdio: 'ignore',
    });
    await execa.execa(
      'git',
      [
        'commit',
        '--author="corgi[bot] <corgi@ksh7.com>"',
        '-am',
        commitMessage,
      ],
      {
        cwd: projectRoot,
        stdio: 'ignore',
      },
    );
  } catch (error) {
    logger.error(`Initial the git repo failed`);
  }
};

export interface IGitInfo {
  username: string;
  email: string;
}

export const getGitInfo = async (): Promise<IGitInfo> => {
  try {
    const [{ stdout: username }, { stdout: email }] = await Promise.all([
      execa.execaCommand('git config --global user.name'),
      execa.execaCommand('git config --global user.email'),
    ]);
    return { username, email };
  } catch (e) {
    return {
      username: '',
      email: '',
    };
  }
};

export const detectMonorepoRoot = async (opts: {
  target: string;
}): Promise<string | null> => {
  const { target } = opts;
  const rootPkg = await pkgUp.pkgUp({ cwd: dirname(target) });
  if (!rootPkg) {
    return null;
  }
  const rootDir = dirname(rootPkg);
  if (
    tryPaths([
      join(rootDir, 'lerna.json'),
      join(rootDir, 'pnpm-workspace.yaml'),
    ])
  ) {
    return rootDir;
  }
  return null;
};
