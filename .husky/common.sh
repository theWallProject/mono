command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Workaround for Windows 10, Git Bash, and interactive prompts
# This ensures stdin is connected to the terminal for interactive prompts
# Based on Husky documentation: https://typicode.github.io/husky/troubleshoot.html
# This is necessary because git hooks don't have stdin connected to the terminal by default
if [ -t 1 ] && [ -r /dev/tty ]; then
  # If stdout is a terminal and /dev/tty is readable, redirect stdin from /dev/tty
  # This works for Git Bash on Windows and Unix-like systems
  exec < /dev/tty
fi
