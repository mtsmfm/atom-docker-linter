'use babel'

import * as helpers from 'atom-linter';

export async function findExecutableContainer(commands, cwd) {
  let result = await helpers.exec('docker-compose', ['ps', '-q'], {stream: 'both', cwd: cwd});
  const composeContainers = result.stdout.split("\n");
  result = await helpers.exec('docker', ['ps', '-q'], {stream: 'both', cwd: cwd});
  const runningContainers = result.stdout.split("\n");
  const executableContainers = composeContainers.filter(
    cc => runningContainers.some(rc => cc.startsWith(rc))
  );

  return (await Promise.all(executableContainers.map(async c =>
    ({container: c, result: (await dockerExec(c, commands)).exitCode == 0})
  ))).find(({result}) => result).container;
}

export async function dockerExec(container, commands, options={stream: 'both'}) {
  return await helpers.exec('docker', ['exec', '-i', container].concat(commands), options);
}
