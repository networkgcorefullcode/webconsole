<!--
SPDX-FileCopyrightText: 2021 Open Networking Foundation <info@opennetworking.org>
Copyright 2019 free5GC.org
SPDX-FileCopyrightText: 2024 Canonical Ltd.
SPDX-License-Identifier: Apache-2.0
-->
[![Go Report Card](https://goreportcard.com/badge/github.com/omec-project/webconsole)](https://goreportcard.com/report/github.com/omec-project/webconsole)

# WebConsole

Webconsole is used as a configuration service in SD-Core. It has following
features Configuration Service provides APIs for subscriber management.

1. It provides APIs for Network Slice management.
2. It  communicates with 4G as well as 5G network functions on the southbound interface.
3. It does configuration translation wherever required and also stores the subscription in mongoDB.
4. 5G clients can connect & get complete configuration copy through grpc interface.
5. 4G clients communicate with Webconsole through REST interface


## Repository Structure 

```
Below is a high-level view of the repository and its main components:

.
├── backend/               # Backend service logic
│   ├── auth/              
│   ├── factory/           
│   ├── logger/           
│   ├── metrics/           
│   ├── nfconfig/          
│   ├── ssm_sync/          
│   ├── webui_context/     
│   └── webui_service/     
│
├── config/                # Default and example configuration files
│   ├── default-ue-data.json
│   └── override-sample.json
│
├── configapi/             # REST API implementation
│   ├── api/               
│   ├── handlers_*.go      
│   └── routers*.go        
│
├── configmodels/          # Data models (device groups, slices, users, etc.)
│   ├── model_slice.go
│   ├── model_device_groups.go
│   └── model_subs_data.go
│
├── dbadapter/             # Database adapters and mock clients
│   ├── db_adapter.go
│   └── mock_client.go
│
├── docs/                  # Technical documentation and diagrams
│   ├── curl-commands.md
│   └── images/architecture1.png
│
├── proto/                 # gRPC protobuf definitions and generated code
│   ├── config.proto
│   ├── sdcoreConfig/
│   └── server/
│
├── ui/                    # Embedded web frontend
│   ├── embed.go
│   └── frontend_files/    # HTML, JS, and CSS files for the dashboard
│
├── vendor/                # Vendored Go dependencies
│
├── bin/                   # Compiled binaries
│   └── webconsole-ui
│
├── server.go              # Main entry point for the webconsole service
├── Makefile               # Build and test automation
├── Taskfile.yml           # Build and test automation
└── Dockerfile*            # Container build definitions
```

## Configuration and Deployment


**Docker**

To build the container image:

```bash
task mod-start
task webconsole-ui
task docker-build-fast
```

**Kubernetes**

The standard deployment uses [Helm charts](https://charts.aetherproject.org) from the Aether project. The version of the Chart can be found in the OnRamp repository in the `vars/main.yml` file.


## Quick Navigation


| Path                 | Description                        |
| -------------------- | ---------------------------------- |
| `backend/`           | Core backend logic                 |
| `configapi/`         | REST API implementation            |
| `configmodels/`      | Data models and schema definitions |
| `proto/`             | gRPC and protobuf definitions      |
| `ui/frontend_files/` | Embedded web frontend              |
| `server.go`          | Service entry point                |
| `Dockerfile`         | Container image definition         |
| `docs/`              | Documentation and diagrams         |



## UI

Webconsole can optionally serve static files, which constitute the frontend part of the application.

To build webui with a frontend, place the static files under `webconsole/ui/frontend_files` before compilation.

To build the webconsole including the UI option:
```
make webconsole-ui
```

Access the UI at:
```
http://<webconsole-ip>:5000/
```

An example static file has been placed in the `webconsole/ui/frontend_files` directory.

## Authentication and Authorization

The authentication and authorization feature ensures that only verified and authorized users can access the webui resources and interact with the system.

This is an optional feature, disabled by default. For more details, refer to this [file](backend/auth/README.md).

##  MongoDB Transaction Support

This application requires a MongoDB deployment configured to support transactions,
such as a replica set or a sharded cluster. Standalone MongoDB instances do not
support transactions and will prevent the application from starting. Please ensure
your MongoDB instance is properly set up for transactions. For detailed configuration
instructions, see the [MongoDB Replica Set Documentation](https://www.mongodb.com/docs/kubernetes-operator/current/tutorial/deploy-replica-set/).

## Webconsole Architecture diagram

![Architecture](/docs/images/architecture1.png)

## Upcoming Features

1. Supporting dedicated flow QoS APIs
2. Removal of Subscription to trigger 3gpp call flows
