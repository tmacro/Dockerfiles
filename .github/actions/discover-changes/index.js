const Path = require('path');

const { core, exec, work_dir, run, get_images } = require('../utils');

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

async function get_changed_images(images) {
    const changes = await get_latest_changes();
    const changed_directories = changes.reduce((cds, path) => {
        const root_dir = Path.resolve(`${work_dir}/${path.split('/')[0]}`);
        if (!cds.includes(root_dir)) {
            cds.push(root_dir);
        }
        return cds;
    }, []);
    changed_directories.map((p) => core.debug(`Detected changes in ${p}`));
    images.map((i) => core.debug(i._dir));
    return images
        .filter((i) => changed_directories.includes(i._dir))
        .map((i) => i._name);
}

async function get_updated_images(images, changed) {
    let updated = [];
    let unchanged_images = images.filter((i) => !changed.includes(i._name));
    core.debug(JSON.stringify(changed));
    core.debug(JSON.stringify(unchanged_images));
    while (true) {
        let new_updated = unchanged_images
            .filter((i) => !updated.includes(i._name))
            .filter((i) =>
                i.deps.some((d) => changed.includes(d) || updated.includes(d))
            )
            .map((i) => i._name);
        core.debug(`Updated ${JSON.stringify(new_updated)}`);
        if (!new_updated.length) {
            break;
        }
        updated = updated.concat(new_updated);
    }
    return updated;
}

async function main() {
    const images = await get_images();
    const changes = await get_changed_images(images);
    const updates = await get_updated_images(images, changes);
    changes.map((i) => core.info(`Detected changes in image ${i}`));
    updates.map((i) =>
        core.info(`Detected update in dependency of image ${i}`)
    );
    core.setOutput('changes', JSON.stringify(changes));
    core.setOutput('updates', JSON.stringify(updates));
}

run(main);
