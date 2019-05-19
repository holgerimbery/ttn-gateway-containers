Continuous Integration with [Travis CI](https://travis-ci.org)
==============================================================
# Overview
This repository is configured to use [Travis CI](https://travis-ci.org) for testing, deployment to the Docker Hub as well as to the [balena](https://www.balena.io/) cloud.

When a new commits are pushed to GitHub the following will happen:
1. Testing: all containers are built;
1. Docker deployment (optional): built containers are pushed to the Docker Hub;
1. balenaCloud deployment (optional): repository is pushed to balenaCloud and devices are updated.

If you also want to update your devices automatically when changes are available, clone this repository, enable it in [Travis CI](https://travis-ci.org) and define the environment variables for your configuration (see below).

# Testing
The testing phase will attempt to build all the containers for the arm32v6 (Raspberry Pi 1B+ or Zero) and arm32v7 (Raspberry Pi 2 or 3).

It does not run any actual test, but it ensures containers can be built.

This step is mandatory, we don't want to publish something which does not build.

# Docker deployment
This step pushes the containers to the Docker Hub. It is useful if your gateways run the plain Docker setup instead of the balenaCloud one.  
This is of little interest unless you need to change to this repository.

Images from any `non-master` branch are tagged with the branch name; images from the `master` branch are tagged as `latest`.

This step only runs if the following Travis CI environment variables are defined:

Name      	  	  | Value  
------------------|--------------------------  
DOCKER_USERNAME   | Your Docker Hub user name
DOCKER_PASSWORD   | Your Docker Hub password

Note that you will have to change the image owner in the `docker-compose` files to match your username.

# balenaCloud deployment
This is the most interesting stage: it updates automatically your gateways when the repository is updated.

You can specify which balenaCloud applications need to be updated for `master` and `non-master` (development) branches.

The process is driven by the following Travis CI environment variables:

Name      	  	    | Value  
--------------------|--------------------------  
BALENA_DEPLOY_KEY   | The private key to deploy to balenaCloud. Deployment is skipped if this variable is not defined (more information hereunder).
MONITORNG_BACKEND   | Specify which monitoring backend should be used: `prometheus` (default) or `collectd`. It actually specifies which `docker-compose` file to use.
BALENA_DEV_n        | _Development_ balenaCloud application repositories (where n is 1, 2, ...). Development applications will be updated when `non-master` branches are updated. Nothing will be deployed if no `DEV` variables are defined.
BALENA_PROD_n        | _Production_ balenaCloud application repositories (where n is 1, 2, ...). Production applications will be updated when the `master` branches is updated. Nothing will be deployed if no `PROD` variables are defined.

## About the BALENA_DEPLOY_KEY
For security reason you should not use your own private key for CI, but rather generate a dedicated private/public key pair:

Generate the key pair (do not use a password):
```
ssh-keygen -C balenaCloud -f balena_rsa
```

Add the `balena_rsa.pub` public key to your balenaCloud profile.

Convert the private key in a suitable format for Travis CI:
```
echo -n "\""; cat balena_rsa | awk 1 ORS='\\n'; echo "\""
```

Copy the command output and paste it as value for the `BALENA_DEPLOY_KEY` environment variable in Travis CI.

That's it!
