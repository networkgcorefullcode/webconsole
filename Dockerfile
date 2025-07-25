# SPDX-FileCopyrightText: 2021 Open Networking Foundation <info@opennetworking.org>
# SPDX-FileCopyrightText: 2024 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0
#

FROM golang:1.24.5-bookworm AS builder

RUN apt-get update && \
    apt-get -y install --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    gcc \
    cmake \
    autoconf \
    libtool \
    pkg-config \
    libmnl-dev \
    libyaml-dev \
    unzip && \
    apt-get clean

WORKDIR $GOPATH/src/webconsole
COPY . .

ARG BUILD_UI=true
RUN if [ "$BUILD_UI" = "true" ]; then \
        make webconsole-ui; \
    else \
        make all; \
    fi

FROM alpine:3.22 AS webui

LABEL maintainer="Aether SD-Core <dev@lists.aetherproject.org>" \
    description="ONF open source 5G Core Network" \
    version="Stage 3"

ARG DEBUG_TOOLS
ARG BUILD_UI=true

# Install debug tools ~85MB (if DEBUG_TOOLS is set to true)
RUN if [ "$DEBUG_TOOLS" = "true" ]; then \
        apk update && apk add --no-cache -U vim strace net-tools curl netcat-openbsd bind-tools; \
    fi

# Copy executable - choose the right binary based on BUILD_UI
RUN if [ "$BUILD_UI" = "true" ]; then \
        echo "Copying UI-enabled binary"; \
    else \
        echo "Copying standard binary"; \
    fi

COPY --from=builder /go/src/webconsole/bin/webconsole* /usr/local/bin/
