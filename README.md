# docker_build_service
This is a web service designed to conform to the Github api to build docker images and push them to a docker repository.

# New Architecture
Web Frontend: GitHub auth, allows repo config, webhook config, integrations with github (to auto create integration), docker hub, to auto create repo with needed keys/login, offical private repo to accept needed authconfig. Also able to view
pending builds, overall status, also display repo info, build logs, account mgmt, queue status.

API/Webhook Server: Takes incoming webhooks, verifies info, pushes webhook logs and queues jobs, updates github with pending build.

Redis: repo config db, log storage and job queue.

Worker: worker node to build docker images and push them to the repo. Also update github status, push logs to db, send event to frontend.

[Repo]: offical docker repo for hosting images.
