#!/usr/bin/env bash
set -euo pipefail

usage() {
    printf 'Usage: pnpm db:tunnel [dev|production]\n'
    printf 'Defaults to dev. Override SAGE_SSH_KEY, SAGE_SSH_HOST, or DB_TUNNEL_PORT as needed.\n'
}

if (( $# > 1 )); then
    usage >&2
    exit 1
fi

environment="${1:-dev}"
case "$environment" in
    dev)
        container="${DEV_CONTAINER_ID:-sage-db-dev}"
        ;;
    prod|production)
        environment="production"
        container="${PROD_CONTAINER_ID:-sage-db-prod}"
        ;;
    -h|--help)
        usage
        exit 0
        ;;
    *)
        usage >&2
        exit 1
        ;;
esac

local_port="${DB_TUNNEL_PORT:-5432}"
if [[ ! "$local_port" =~ ^[0-9]{1,5}$ ]] || (( 10#$local_port < 1 || 10#$local_port > 65535 )); then
    printf 'DB_TUNNEL_PORT must be between 1 and 65535.\n' >&2
    exit 1
fi

ssh_key="${SAGE_SSH_KEY:-$HOME/.ssh/id_ed25519}"
ssh_host="${SAGE_SSH_HOST:-root@localhost}"

if [[ ! -r "$ssh_key" ]]; then
    printf 'SSH key is not readable: %s. Set SAGE_SSH_KEY to your private-key path.\n' "$ssh_key" >&2
    exit 1
fi

ssh_options=(
    -i "$ssh_key"
    -o IdentitiesOnly=yes
    -o BatchMode=yes
    -o StrictHostKeyChecking=yes
    -o ConnectTimeout=10
    -o ExitOnForwardFailure=yes
    -o ServerAliveInterval=60
    -o ServerAliveCountMax=3
)

remote_ip="$(ssh -n -T "${ssh_options[@]}" "$ssh_host" "sudo -n docker inspect --format '{{if .State.Running}}{{with index .NetworkSettings.Networks \"coolify\"}}{{.IPAddress}}{{end}}{{end}}' '$container'")" || remote_ip="127.0.0.1"

if [[ ! "$remote_ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    printf 'The %s database is not running with an IPv4 address.\n' "$environment" >&2
    exit 1
fi

printf 'Opening %s database tunnel: 127.0.0.1:%s -> %s:5432 via %s.\n' "$environment" "$local_port" "$remote_ip" "$ssh_host"
if [[ "$environment" == production ]]; then
    printf 'Production selected: database writes through this tunnel affect live data.\n'
fi
printf 'Keep this terminal open; press Ctrl+C to close the tunnel.\n'
exec ssh -T "${ssh_options[@]}" -N -L "127.0.0.1:$local_port:$remote_ip:5432" "$ssh_host"
