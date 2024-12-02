#!/bin/bash

# Set the root directory
ROOT_DIR="."

# Function to print the content of a file
print_file_content() {
    local file="$1"
    echo -e "\n=== Content of $file ==="
    cat "$file"
}

# Find specific files: `package.json`, `turbo.json`, and files under the specific target folder
find "$ROOT_DIR" \
-type f \( \
-name "package.json" -o \
-name "turbo.json" -o \
-path "*"  \
\) \
! -path "*/node_modules/*" \
! -path "*/tools/*" \
! -path "*/.turbo/*" \
! -path "*/.vite/*" \
! -path "*/dist/*" \
! -path "*/public/*" \
! -path "*/yarn.lock" \
! -path "*/package-lock.json" \
! -path "./packages/contract/src/managed/identity/keys/*" \
! -path "./packages/contract/src/managed/identity/compiler/*" \
! -path "./packages/contract/src/managed/identity/zkir/*" | while read -r file; do
    print_file_content "$file"
done
