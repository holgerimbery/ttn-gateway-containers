FROM resin/raspberry-pi-debian:jessie

# Defines our working directory in container
WORKDIR /opt/node-exporter

# Get Prometheus exporter
ARG NODE_EXPORTER_VERSION=0.12.0
ARG DIST_ARCH=linux-armv6

RUN curl -sSL https://github.com/prometheus/node_exporter/releases/download/${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.${DIST_ARCH}.tar.gz \
	| tar xzf - --strip 1

# Default port for the exporter is 9100
EXPOSE 9100
# run when container starts up on the device
CMD ["/opt/node-exporter/node_exporter"]
