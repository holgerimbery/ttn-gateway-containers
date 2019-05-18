#!/bin/bash
# Push images to the docker hub

# Exit on error
set -ev

if [ "${TRAVIS_PULL_REQUEST}" == "false" ]
then
  # Deploy on balena.io (Only if we have a deploy key)
  if [ -n "${BALENA_DEPLOY_KEY}" ]
  then
    # Setup keys & fingerprints
    eval $(ssh-agent -s)
    echo -e "${BALENA_DEPLOY_KEY}" > id_rsa
    chmod 0600 id_rsa
    ssh-add ./id_rsa
    ssh-keyscan git.balena-cloud.com >> ~/.ssh/known_hosts
    # We don't like to operating in detached state
    # There is a small risk to catch a more recent commit, which doesn't
    # matter too much here
    git checkout ${TRAVIS_BRANCH}
    # Monitoring backend to deploy: prometheus / collectd
    cp "docker-compose-${MONITORNG_BACKEND:-prometheus}.yml" docker-compose.yml
    git add docker-compose.yml
    git commit -m "Select monitoring backend for the balenaCloud images"
    if [ "${TRAVIS_BRANCH}" == "master" ]
    then
      # Push to all production apps
      for REMOTE in ${!BALENA_PROD_*}
      do
	git remote add balena ${!REMOTE}
	git push --force balena master
	git remote remove balena
      done
    else
      # Push to all dev apps
      for REMOTE in ${!BALENA_DEV_*}
      do
	git remote add balena ${!REMOTE}
	git push --force balena ${TRAVIS_BRANCH}:master
	git remote remove balena
      done
    fi
  fi
fi
