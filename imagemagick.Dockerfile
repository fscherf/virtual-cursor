FROM ubuntu:jammy

ARG UID=1000 GID=1000

RUN apt update && apt upgrade -y && apt install -y imagemagick ffmpeg
