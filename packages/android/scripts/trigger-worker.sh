#!/usr/bin/env bash
# Trigger and inspect the ScanWorker via ADB.
#
# Usage:
#   bash scripts/trigger-worker.sh <command> [args]
#
# Commands:
#   scan         Enqueue a one-shot ScanWorker (via MainActivity TRIGGER_SCAN intent)
#   force-now    Force-run the periodic JobScheduler job, ignoring constraints/interval
#   sim-install  Simulate PACKAGE_ADDED for a fake package -> PackageInstallReceiver
#   jobs         Show JobScheduler state for the app (job ids, status, constraints)
#   logs         Tail logs filtered to ScanWorker / receivers / WorkManager
#   all          scan + jobs + logs (kicks a scan and tails)
#   help         This help

set -eo pipefail
# Note: `set -u` (nounset) is intentionally NOT enabled — macOS ships bash 3.2,
# where "${array[@]}" on an empty array is treated as unset and aborts the shell.

PACKAGE="com.thewallboycott.android"

# ---- ADB resolution (same logic as scripts/adb.sh) -------------------------
if command -v adb &>/dev/null; then
    ADB="adb"
elif [ -n "${ANDROID_HOME:-}" ] && [ -x "$ANDROID_HOME/platform-tools/adb" ]; then
    ADB="$ANDROID_HOME/platform-tools/adb"
elif [ -x "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    ADB="$HOME/Library/Android/sdk/platform-tools/adb"
elif [ -x "$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe" ]; then
    ADB="$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe"
else
    echo "Error: adb not found. Install platform-tools or set ANDROID_HOME." >&2
    exit 1
fi

# ---- Device selection (lazy — only resolved when a command needs it) -------
SERIAL_ARGS=()
SERIAL_RESOLVED=0

resolve_device() {
    if [ "$SERIAL_RESOLVED" = 1 ]; then
        return 0
    fi
    if [ -n "${ANDROID_SERIAL:-}" ]; then
        SERIAL_ARGS=(-s "$ANDROID_SERIAL")
        SERIAL_RESOLVED=1
        return 0
    fi

    # Collect transports that are in 'device' state.
    local transports
    transports=$("$ADB" devices | awk 'NR>1 && $2=="device" {print $1}')
    if [ -z "$transports" ]; then
        echo "Error: no devices in 'device' state. Plug in a phone or run 'adb devices'." >&2
        exit 1
    fi

    # Dedupe transports that point at the same physical phone (e.g. an IP entry
    # and an mDNS entry both backed by one device). Group by hardware serialno
    # and keep the first transport per serial. Compatible with bash 3.2.
    local picked="" t serial first_serial="" mismatch=0
    while IFS= read -r t; do
        [ -z "$t" ] && continue
        # `getprop ro.serialno` returns the real hardware serial; `get-serialno`
        # returns the transport string for TLS/wireless connections, which is
        # useless for deduping mDNS-vs-IP entries that point to the same phone.
        serial=$("$ADB" -s "$t" shell getprop ro.serialno 2>/dev/null | tr -d '\r' || true)
        if [ -z "$serial" ] || [ "$serial" = "unknown" ]; then
            serial="$t"
        fi
        if [ -z "$first_serial" ]; then
            first_serial="$serial"
            picked="$t"
        elif [ "$serial" != "$first_serial" ]; then
            mismatch=1
        fi
    done <<< "$transports"

    if [ "$mismatch" = 1 ]; then
        echo "Multiple distinct devices attached. Pick one with ANDROID_SERIAL=<transport>:" >&2
        printf '  %s\n' $transports >&2
        exit 1
    fi

    SERIAL_ARGS=(-s "$picked")
    SERIAL_RESOLVED=1
}

run_adb() { resolve_device; "$ADB" "${SERIAL_ARGS[@]}" "$@"; }

# ---- Helpers ---------------------------------------------------------------
require_installed() {
    if ! run_adb shell pm path "$PACKAGE" >/dev/null 2>&1; then
        echo "Error: $PACKAGE is not installed on the device." >&2
        echo "Hint: bash scripts/adb.sh install" >&2
        exit 1
    fi
}

# Parses 'dumpsys jobscheduler' for jobs owned by $PACKAGE and prints
# 'jobId tag' lines, one per job.
list_jobs() {
    run_adb shell dumpsys jobscheduler | awk -v pkg="$PACKAGE" '
        /^  JOB #/ {
            header = $0
            in_block = 1
            jid = ""
            tag = ""
            next
        }
        in_block && /tag=/ {
            match($0, /tag=[^ ]+/)
            tag = substr($0, RSTART+4, RLENGTH-4)
        }
        in_block && /Service:/ && index($0, pkg) {
            # Header looks like:   JOB #u0a123/12345: ...   -> jobId is the 12345
            if (match(header, /\/[0-9]+:/)) {
                jid = substr(header, RSTART+1, RLENGTH-2)
            }
            if (jid != "") print jid, tag
            in_block = 0
        }
        /^  ===/ { in_block = 0 }
    ' | sort -u
}

# ---- Commands --------------------------------------------------------------
case "${1:-help}" in
scan)
    require_installed
    # forceNotify defaults to true so the notification always fires for manual
    # testing. Pass `false` as the second arg to honour the recently-notified
    # dedup guard instead.
    force_notify="${2:-true}"
    echo "[scan] Broadcasting TRIGGER_SCAN (forceNotify=$force_notify) — silent, no UI …"
    # FLAG_INCLUDE_STOPPED_PACKAGES (0x00000020) lets the broadcast reach the
    # receiver even if the app is in the FLAG_STOPPED state (e.g. fresh install
    # before the launcher icon has been tapped).
    run_adb shell am broadcast \
        -a com.thewallboycott.android.action.TRIGGER_SCAN \
        -p "$PACKAGE" \
        -f 0x00000020 \
        --ez force_notify "$force_notify" >/dev/null
    echo "[scan] Enqueued. Tail logs with: $0 logs"
    ;;

force-now)
    require_installed
    echo "[force-now] Inspecting JobScheduler for $PACKAGE …"
    jobs_output=$(list_jobs)
    if [ -z "$jobs_output" ]; then
        echo "[force-now] No jobs registered. Launch the app once so the periodic worker is scheduled, then retry." >&2
        exit 1
    fi
    echo "[force-now] Jobs found:"
    printf '%s\n' "$jobs_output" | sed 's/^/  /'
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        jid="${line%% *}"
        echo "[force-now] cmd jobscheduler run -f $PACKAGE $jid"
        run_adb shell cmd jobscheduler run -f "$PACKAGE" "$jid" </dev/null || true
    done <<< "$jobs_output"
    echo "[force-now] Done. Tail logs with: $0 logs"
    ;;

sim-install)
    require_installed
    fake_pkg="${2:-com.fake.boycott.test}"
    echo "[sim-install] Broadcasting PACKAGE_ADDED for $fake_pkg → PackageInstallReceiver …"
    run_adb shell am broadcast \
        -a android.intent.action.PACKAGE_ADDED \
        -d "package:$fake_pkg" \
        -p "$PACKAGE" >/dev/null
    echo "[sim-install] Sent. Note: receiver is registered at runtime in TheWallApp,"
    echo "             so the app must be running (or recently woken) to handle it."
    ;;

jobs)
    require_installed
    echo "[jobs] JobScheduler entries for $PACKAGE:"
    out=$(list_jobs)
    if [ -z "$out" ]; then
        echo "  (none — launch the app to register PERIODIC_APP_SCAN)"
    else
        printf '%s\n' "$out"
    fi
    ;;

logs)
    echo "[logs] Tailing ScanWorker / receivers / WorkManager. Ctrl+C to stop."
    run_adb logcat -c
    run_adb logcat -v time \
        ScanWorker:V \
        PackageInstallReceiver:V \
        NotificationAction:V \
        WM-WorkerWrapper:I \
        WM-Processor:I \
        '*:S'
    ;;

all)
    require_installed
    "$0" scan
    sleep 1
    "$0" jobs || true
    "$0" logs
    ;;

help | --help | -h | "")
    cat <<'EOF'
Trigger and inspect the ScanWorker via ADB.

Usage:
  bash scripts/trigger-worker.sh <command> [args]

Commands:
  scan         Enqueue a one-shot ScanWorker (via MainActivity TRIGGER_SCAN intent)
  force-now    Force-run the periodic JobScheduler job, ignoring constraints/interval
  sim-install  Simulate PACKAGE_ADDED for a fake package -> PackageInstallReceiver
  jobs         Show JobScheduler state for the app (job ids, status, constraints)
  logs         Tail logs filtered to ScanWorker / receivers / WorkManager
  all          scan + jobs + logs (kicks a scan and tails)
  help         This help

Env:
  ANDROID_SERIAL  Pick a specific device when multiple are attached.
EOF
    ;;

*)
    echo "Unknown command: $1" >&2
    echo "Run: bash scripts/trigger-worker.sh help" >&2
    exit 1
    ;;
esac
