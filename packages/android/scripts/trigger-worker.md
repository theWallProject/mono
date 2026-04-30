# `trigger-worker.sh` — ScanWorker testing helper

ADB-driven harness for exercising the background scan flow end-to-end on a real device. Useful when verifying notification behaviour, the periodic `PERIODIC_APP_SCAN` job, or the `PackageInstallReceiver` reactive scan after a manifest change (e.g. the `<queries>` migration).

## Quick start

```bash
# 1. Make sure the app is installed (any debug or signed build is fine)
bash scripts/adb.sh install

# 2. Launch the app once so WorkManager registers the periodic job
adb shell am start -n com.thewallboycott.android/.MainActivity

# 3. Trigger a scan + tail logs
bash scripts/trigger-worker.sh all
```

## Commands

| Command | What it does | Underlying ADB call |
| --- | --- | --- |
| `scan` | Enqueues a one-shot `ScanWorker` via `MainActivity`'s `TRIGGER_SCAN` intent extra. Goes through normal WorkManager queueing. | `am start -n <pkg>/.MainActivity --ez TRIGGER_SCAN true` |
| `force-now` | Inspects `dumpsys jobscheduler`, finds every job owned by the app, and force-runs each one — bypassing the 6-hour interval, charging/idle constraints, etc. | `cmd jobscheduler run -f <pkg> <jobId>` |
| `sim-install [pkg]` | Broadcasts a fake `PACKAGE_ADDED` to `PackageInstallReceiver`, which enqueues a reactive `ScanWorker`. Defaults to `com.fake.boycott.test`. | `am broadcast -a android.intent.action.PACKAGE_ADDED -d package:<pkg> -p <app>` |
| `jobs` | Pretty-prints the scheduled JobScheduler jobs for the app (job id + tag). Empty until the app has been launched at least once. | `dumpsys jobscheduler` (filtered) |
| `logs` | Clears logcat and tails the relevant tags. Ctrl+C to stop. | `logcat -c && logcat -v time ScanWorker:V PackageInstallReceiver:V NotificationAction:V WM-WorkerWrapper:I WM-Processor:I '*:S'` |
| `all` | `scan` → `jobs` → `logs`. One-shot smoke test. | — |
| `help` | Print usage. Works without a device connected. | — |

## Examples

```bash
# Force a one-shot scan, ignore everything else
bash scripts/trigger-worker.sh scan

# Re-run the periodic job right now (skips the 6-hour wait)
bash scripts/trigger-worker.sh force-now

# Pretend a flagged app got installed (must be a real package id from ALL.json
# for the scan to actually flag anything — fake ids just exercise the receiver)
bash scripts/trigger-worker.sh sim-install com.example.flagged

# Just inspect what's scheduled
bash scripts/trigger-worker.sh jobs

# Watch the worker run live in another terminal
bash scripts/trigger-worker.sh logs
```

## Multiple devices

Both wired and `adb connect`-ed devices count. If more than one is online, the script asks you to disambiguate:

```bash
ANDROID_SERIAL=192.168.1.100:41635 bash scripts/trigger-worker.sh scan
```

## Caveats

- **`sim-install` does not bypass package visibility** — the receiver is registered programmatically in `TheWallApp`, so the app process must be running (or recently woken). Launch the app at least once before broadcasting.
- **`force-now` requires the periodic job to exist** — that's registered the first time `MainActivity` is created (`schedulePeriodicScan()`). Open the app once, then `force-now` will work for the rest of the session.
- **`scan` opens the activity** — it goes through `MainActivity.handleIntent()`, so the app surfaces briefly. Use `force-now` if you want a purely background trigger.
- **Wireless ADB is fragile** — if commands hang, run `adb kill-server && adb start-server`, or re-pair the device.

## Implementation notes

- ADB path resolution mirrors `scripts/adb.sh` — `$PATH`, then `$ANDROID_HOME/platform-tools`, then macOS/Windows defaults.
- Device resolution is lazy: `help` runs without any device attached, every other subcommand resolves on first use and bails with a clear error if nothing is online.
- Job parsing reads `dumpsys jobscheduler` and matches `Service:` lines containing the package name, then extracts the job id from the surrounding `JOB #u0aXXX/<jobId>:` header. This is fragile across major Android versions; if it breaks, run `adb shell dumpsys jobscheduler | less` and adjust the awk filter.

## Related

- [`scripts/adb.sh`](adb.sh) — install / uninstall / clear-data / generic logcat
- `MainActivity.kt` — `handleIntent()` reads the `TRIGGER_SCAN` extra
- `background/ScanWorker.kt` — the worker itself (TAG = `ScanWorker`)
- `background/PackageInstallReceiver.kt` — reactive trigger on `PACKAGE_ADDED`
