const { core, run, exec } = require('../utils');
const Path = require('path');

async function build_image(repo, name, image_path) {
    core.debug(`Building image ${repo}/${name}`);
    const ret_code = await exec.exec('docker', [
        'build',
        '--tag',
        `${repo}/${name}`,
        image_path,
    ]);

    return {
        name,
        success: ret_code === 0,
    };
}

async function main() {
    const docker_username = core.getInput('docker_username');
    const to_build = JSON.parse(core.getInput('changes'));

    if (!to_build.length) {
        core.info('Nothing to build');
        core.setOutput('images', JSON.stringify([]));
        return;
    }

    const builds = await Promise.all(to_build.map(path => build_image(docker_username, Path.basename(path), path)));
    builds.forEach(b => core.info(`Built succeeded for ${docker_username}/${b.name}: ${b.success}`));
    const images = builds.filter(b => b.success).map(b => b.name);
    core.setOutput('images', JSON.stringify(images));
}

run(main);
