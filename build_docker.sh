#!/bin/bash
NAMESPACE="${1:-codebase_b1831_app}"
docker build -t "$NAMESPACE" .