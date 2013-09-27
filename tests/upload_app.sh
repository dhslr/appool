#!/bin/bash
curl -X POST --data-binary "@../../apps/irApp-0.0.0.tgz" http://0.0.0.0:8079/apps/upload
