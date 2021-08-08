const Path = require('path');
const fs = require('fs');

const { core, exec, work_dir, run, get_git_tags } = require('../utils');

async function get_changes_for_commit(ref) {
    const paths = [];
    const options = {
        cwd: work_dir,
        listeners: {
            stdline: (path) => {
                paths.push(path);
            },
            stderr: (buf) => {
                core.debug(buf.toString());
            },
        },
    };
    const ret_code = await exec.exec(
        'git',
        ['diff', '--name-only', ref],
        options
    );
    core.debug(`ret_code: ${ret_code}`);
    return paths;
}

async function fetch_history() {
    const options = {
        cwd: work_dir,
        listeners: {
            stdout: (buf) => core.debug(buf.toString()),
            stderr: (buf) => core.debug(buf.toString()),
        },
    };
    const ret_code = await exec.exec(
        'git',
        ['fetch', '--unshallow', ref],
        options
    );
    core.debug(`ret_code: ${ret_code}`);
    return ret_code === 0;
}

async function get_refs() {
    let refs = [];
    const options = {
        cwd: work_dir,
        listeners: {
            stdline: (line) => {
                const parts = line.split(' ');
                refs.push(parts[0]);
            },
            stderr: (buf) => core.debug(buf.toString()),
        },
    };
    const ret_code = await exec.exec(
        'git',
        ['fetch', '--unshallow', ref],
        options
    );
    core.debug(`ret_code: ${ret_code}`);
    return refs;
}

async function get_latest_changes() {
    let changes = await get_changes_for_commit('HEAD~1');
    if (!changes) {
        // No changes normally means an empty merge commit.
        // So we'll fetch the history and walk backwards until we find a change.
        await fetch_history();
        const refs = await get_refs();
        for (let i = 1; i < refs.length; i++) {
            changes = await get_changes_for_commit(`${refs}~1`);
            if (changes) {
                break;
            }
        }
    }
    return changes;
}

async function get_changed_images() {
    const changes = await get_latest_changes();
    const changed_directories = changes.reduce((cds, path) => {
        const root_dir = Path.resolve(`${work_dir}/${path.split('/')[0]}`);
        if (!cds.includes(root_dir)) {
            cds.push(root_dir);
        }
        return cds;
    }, []);
    changed_directories.map((p) => core.debug(`Detected changes in ${p}`));
    return changed_directories.filter(cd => {
        if (fs.existsSync(`${cd}/Dockerfile`)) {
            return true;
        }
        core.debug(`No Dockerfile found in ${cd}`);
        return false;
    });
}

async function get_tagged_images() {
    const tags = await get_git_tags();
    return Object.keys(tags)
    .map(i => Path.resolve(`${work_dir}/${i}`))
    .filter(i => fs.existsSync(`${i}/Dockerfile`));
}

async function main() {
    const changes = await get_changed_images();
    changes.map((i) => core.info(`Detected changes in image ${i}`));

    const tagged = get_tagged_images();
    tagged.forEach(i => console.debug(`Detected new tag for image ${i}`));

    const unique = [...new Set([...changes, ...tagged])];
    core.setOutput('changes', JSON.stringify(unique));
}

run(main);
