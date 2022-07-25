FROM archlinux:base-devel

ENV PACMAN_REPO_BUILDER_VER 0.0.0-rc.62

COPY pacman.conf /etc/pacman.conf

RUN pacman -Syu --noconfirm --needed --overwrite '*' \
    base \
    base-devel \
    bash \
    git \
    sudo \
    archlinux-keyring

ADD https://github.com/pacman-repo-builder/pacman-repo-builder/releases/download/$PACMAN_REPO_BUILDER_VER/build-pacman-repo-x86_64-unknown-linux-gnu /usr/local/bin/build-pacman-repo

RUN chmod +x /usr/local/bin/build-pacman-repo

RUN useradd -m -s /usr/bin/bash builder \
    && echo "builder ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers \
    && visudo -cs

USER builder

WORKDIR /home/builder

ENTRYPOINT ["build-pacman-repo"]

CMD ["help"]
