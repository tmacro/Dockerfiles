#!/usr/bin/env python3

import argparse
import pathlib
import requests
import tempfile
import subprocess
import shutil
import logging
import os
import boto3

logging.basicConfig(level=logging.INFO, format="%(message)s")

files_to_sync = [
    "flatcar_production_image.vmlinuz",
    "flatcar_production_image.vmlinuz.DIGESTS",
    "flatcar_production_pxe_image.cpio.gz",
    "flatcar_production_pxe_image.cpio.gz.DIGESTS",
]

FLATCAR_GPG_LONG_ID="E25D9AED0593B34A"

def get_args():
    parser = argparse.ArgumentParser(description="Download Flatcar Linux images")
    parser.add_argument("--arch", required=True, help="Architecture")
    parser.add_argument("--channel", required=True, help="Channel")
    parser.add_argument("--version", default="latest", help="Version")
    parser.add_argument("--bucket", default="flatcar", help="Target S3 bucket")
    parser.add_argument("--s3-prefix", default="", help="S3 prefix")
    parser.add_argument("--endpoint", help="S3 endpoint")
    parser.add_argument("--tmp", default="/tmp", help="Temporary directory")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument(
        "--update-current",
        action="store_true",
        help="Copy the latest version to the 'current' directory",
    )
    return parser.parse_args()


def format_repo_url(arch, channel, version, filename):
    return (
        f"https://{channel}.release.flatcar-linux.net/{arch}-usr/{version}/{filename}"
    )

def format_output_path(output, version, filename):
    return pathlib.Path(output, version, filename).resolve()

def format_s3_key(prefix, channel, version, arch, filename):
    key = f"{channel}/{version}/{arch}/{filename}"
    if prefix:
        key = f"{prefix}/{key}"
    return key

def get_latest_version(arch, channel):
    r = requests.get(format_repo_url(arch, channel, "current", "version.txt"))
    r.raise_for_status()
    for line in r.text.splitlines():
        if line.startswith("FLATCAR_VERSION="):
            return line.split("=")[1]
    raise ValueError("Could not fetch latest version")

def download(url, output_path):
    r = requests.get(url)
    r.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(r.content)


def exists_in_s3(s3_client, bucket, key):
    try:
        s3_client.head_object(Bucket=bucket, Key=key)
        return True
    except s3_client.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        raise

def get_s3_object_etag(s3_client, bucket, key):
    response = s3_client.head_object(Bucket=bucket, Key=key)
    return response["ETag"]

def s3_upload(s3_client, bucket, key, filepath):
    with open(filepath, "rb") as f:
        s3_client.upload_fileobj(f, bucket, key)

def s3_copy(s3_client, bucket, key, target_bucket, target_key):
    s3_client.copy_object(Bucket=target_bucket, Key=target_key, CopySource={"Bucket": bucket, "Key": key})

def verify_signature(filepath, signature_path):
    cmd = ["gpg", "--batch", "--trusted-key", FLATCAR_GPG_LONG_ID, "--verify", signature_path.as_posix(), filepath.as_posix()]
    logging.debug(f"DBG: {' '.join(cmd)}")
    proc = subprocess.run(cmd)
    return proc.returncode == 0

def update_symlink(symlink_path, target):
    if symlink_path.exists() and symlink_path.is_symlink():
        if symlink_path.resolve() == target:
            logging.info(f"{symlink_path.name} already points to the latest version")
            return
        symlink_path.unlink()
    symlink_path.symlink_to(target.relative_to(symlink_path.parent))
    logging.info(f"Created symlink {symlink_path.name} -> {target.name}")

def main():
    args = get_args()
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    version = args.version

    if version == "latest":
        logging.info(f"Fetching latest version for channel: {args.channel}")
        version = get_latest_version(args.arch, args.channel)
        logging.info(f"Found version: {version}")
    else:
        logging.info(f"Using version: {version}")

    proc = subprocess.run(["gpg", "--batch", "--import", "/usr/local/share/flatcar.gpg"])
    if proc.returncode != 0:
        logging.error("Failed to import Flatcar GPG key")
        exit(1)

    output_dir = pathlib.Path(tempfile.mkdtemp(dir=args.tmp))

    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        endpoint_url=args.endpoint
    )

    s3_prefix = args.s3_prefix[:-1] if args.s3_prefix.endswith("/") else args.s3_prefix

    needed_files = []
    for filename in files_to_sync:
        s3_key = format_s3_key(s3_prefix, args.channel, version, args.arch, filename)

        if not exists_in_s3(s3_client, args.bucket, s3_key):
            logging.debug(f"Enqueuing {filename} for download")
            needed_files.append(filename)
        else:
            logging.debug(f"Skipping existing file: {s3_key}")

        sig_key = format_s3_key(s3_prefix, args.channel, version, args.arch, f"{filename}.sig")
        if not exists_in_s3(s3_client, args.bucket, sig_key):
            logging.debug(f"Enqueuing {filename}.sig for download")
            needed_files.append(f"{filename}.sig")
        else:
            logging.debug(f"Skipping existing file: {sig_key}")

        # output_path = format_output_path(args.output, version, filename)
        # if not output_path.exists():
        #     logging.debug(f"Enqueuing {filename} for download")
        #     needed_files.append((filename, output_path))

        # sig_path = format_output_path(output_dir, version, f"{filename}.sig")
        # if not sig_path.exists():
        #     logging.debug(f"Enqueuing {filename}.sig for download")
        #     needed_files.append(f"{filename}.sig")

    if not needed_files:
        logging.info("All files are up to date")
    else:
        for filename in needed_files:
            logging.debug(f"{filename} will be downloaded")

    for filename in needed_files:
        url = format_repo_url(args.arch, args.channel, version, filename)
        output_path = output_dir.joinpath(filename)
        logging.info(f"Downloading {url} to {output_path}")
        download(url, output_path)

    failed = []
    for filename in files_to_sync:
        if filename in needed_files or f'{filename}.sig' in needed_files:
            output_path = output_dir.joinpath(filename)
            sig_path = output_dir.joinpath(f"{filename}.sig")

            logging.info(f"Verifying signature for {output_path}")

            passed = verify_signature(output_path, sig_path)
            if not passed:
                logging.error(f"Failed to verify signature for {output_path}: {e}")
                logging.debug(f"Removing {output_path}")
                output_path.unlink()
                logging.debug(f"Removing {sig_path}")
                sig_path.unlink()
                failed.append(output_path)

    if failed:
        logging.error("Failed to verify signatures for some files")
        for path in failed:
            logging.debug(f"Failed file: {path}")
        exit(1)

    for filename in files_to_sync:
        if filename in needed_files:
            file_key = format_s3_key(s3_prefix, args.channel, version, args.arch, filename)
            file_path = output_dir.joinpath(filename)
            logging.info(f"Uploading {file_path} to s3://{args.bucket}/{file_key}")
            s3_upload(s3_client, args.bucket, file_key, file_path)

        if f'{filename}.sig' in needed_files:
            sig_key = format_s3_key(s3_prefix, args.channel, version, args.arch, f"{filename}.sig")
            sig_path = output_dir.joinpath(f"{filename}.sig")
            logging.info(f"Uploading {sig_path} to s3://{args.bucket}/{sig_key}")
            s3_upload(s3_client, args.bucket, sig_key, sig_path)

    if args.update_current:
        for filename in files_to_sync:
            file_key = format_s3_key(s3_prefix, args.channel, version, args.arch, filename)
            current_key = format_s3_key(s3_prefix, args.channel, "current", args.arch, filename)

            file_etag = get_s3_object_etag(s3_client, args.bucket, file_key)
            current_etag = None
            if exists_in_s3(s3_client, args.bucket, current_key):
                current_etag = get_s3_object_etag(s3_client, args.bucket, current_key)

            if file_etag != current_etag:
                logging.info(f"Copying s3://{args.bucket}/{file_key} to s3://{args.bucket}/{current_key}")
                s3_copy(s3_client, args.bucket, file_key, args.bucket, current_key)
            else:
                logging.info(f"s3://{args.bucket}/{file_key} is already the current version")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        exit(1)
    except Exception as e:
        print(e)
        exit(1)
