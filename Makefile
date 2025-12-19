.PHONY: check format check-frontend check-backend format-frontend format-backend test build dev preview build-frontend build-backend tauri check-watch

# Run all checks (frontend and backend)
check: check-frontend check-backend

# Format all code (frontend and backend)
format: format-frontend format-backend

# Frontend verification
check-frontend:
	deno run -A npm:prettier --check .
	deno run -A npm:@sveltejs/kit sync && deno run -A npm:svelte-check --tsconfig ./tsconfig.json

check-watch:
	deno run -A npm:@sveltejs/kit sync && deno run -A npm:svelte-check --tsconfig ./tsconfig.json --watch

format-frontend:
	deno run -A npm:prettier --write .

# Backend verification
# Using --manifest-path to run cargo commands from root without cd
check-backend:
	cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
	cargo clippy --manifest-path src-tauri/Cargo.toml
	cargo test --manifest-path src-tauri/Cargo.toml

format-backend:
	cargo fmt --manifest-path src-tauri/Cargo.toml

# Run backend tests specifically
test:
	cargo test --manifest-path src-tauri/Cargo.toml

# Build application
build: build-frontend build-backend

build-frontend:
	deno run -A npm:vite build

build-backend:
	cargo build --manifest-path src-tauri/Cargo.toml

# Dev server
dev:
	deno run tauri dev
