FROM settlemint/docker-node-ci

COPY . /srv
ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN
ARG TESTING
ENV TESTING=$TESTING
RUN echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc && \
  npm ci --only=production && \
  apk del build-dependencies && \
  rm -Rf ~/.npm .npmrc
CMD ["./scripts/start.sh"]
EXPOSE 9222 7000
