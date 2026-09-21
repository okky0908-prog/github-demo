#!/bin/bash
set -eux

dnf install -y nginx
systemctl enable --now nginx
