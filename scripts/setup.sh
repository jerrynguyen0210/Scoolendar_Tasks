#!/usr/bin/env bash
# Bootstrap a checked-out project on macOS or Linux (including WSL).
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: bash scripts/setup.sh [--start] [--help]

Install a compatible Node.js/npm if needed, install locked dependencies,
and run the project's checks. --start also starts the Expo development server.
Requires Bash, curl (only for Node installation), and internet access.
EOF
}

start=false
for argument in "$@"; do
  case "$argument" in
    --start) start=true ;;
    --help|-h) usage; exit 0 ;;
    *) printf 'Unknown option: %s\n' "$argument" >&2; usage >&2; exit 1 ;;
  esac
done

case "$(uname -s)" in
  Darwin|Linux) ;;
  *) printf 'Unsupported OS. On Windows, run this script inside WSL.\n' >&2; exit 1 ;;
esac

project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

trap 'printf "Setup failed at line %s. Fix the error above and rerun this script.\n" "$LINENO" >&2' ERR

# Match Expo/React Native engines and the native TypeScript support in our tests.
compatible_node() {
  command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 &&
    node -e '
      const [major, minor] = process.versions.node.split(".").map(Number);
      process.exit((major === 22 && minor >= 18) ||
        (major === 24 && minor >= 3) || major >= 26 ? 0 : 1);
    '
}

if ! compatible_node; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    if ! command -v curl >/dev/null 2>&1; then
      printf 'Install curl with your OS package manager, then rerun this script.\n' >&2
      exit 1
    fi
    printf 'Installing nvm and Node.js 22 for the current user (no sudo required)...\n'
    installer="$(mktemp)"
    trap 'rm -f -- "$installer"' EXIT
    # Pin the installer; use its script method so Git is not a prerequisite.
    curl --fail --silent --show-error --location --retry 3 \
      https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh \
      --output "$installer"
    # Create a profile if this is a new user account, so nvm persists in new shells.
    case "${SHELL:-}" in
      */zsh) profile="${ZDOTDIR:-$HOME}/.zshrc" ;;
      *)
        if [ "$(uname -s)" = Darwin ]; then
          profile="$HOME/.bash_profile"
        else
          profile="$HOME/.bashrc"
        fi
        ;;
    esac
    touch "$profile"
    PROFILE="$profile" METHOD=script bash "$installer"
    rm -f -- "$installer"
    trap - EXIT
  fi
  # nvm is a shell function and does not support nounset in every version.
  set +u
  . "$NVM_DIR/nvm.sh" --no-use
  nvm install 22
  nvm use 22
  set -u
fi

if ! compatible_node; then
  printf 'A compatible Node.js and npm could not be installed.\n' >&2
  exit 1
fi

printf 'Using Node.js %s and npm %s\n' "$(node --version)" "$(npm --version)"
# Include dev dependencies even when NODE_ENV=production is set on the machine.
npm ci --include=dev
npm run typecheck
npm run test:validation
npm run test:submit

printf '\nSetup complete. Start Expo from the repository root with: npm start\n'
printf 'If Node was installed, open a new terminal first to load nvm.\n'
printf 'Use Expo Go on a physical device, or install Xcode/Android Studio for a simulator.\n'
if [ "$start" = true ]; then
  exec npm start
fi
