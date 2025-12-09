package ssm

import (
	"github.com/omec-project/webconsole/configmodels"
)

type SsmSyncMessage struct {
	Action string
	Info   string
}

type SSM interface {
	SyncKeyListen(chan *SsmSyncMessage)
	KeyRotationListen(chan *SsmSyncMessage)
	Login() (string, error)
	StoreKey(*configmodels.K4) error
	UpdateKey(*configmodels.K4) error
	DeleteKey(k4Data *configmodels.K4) error
	HealthCheck()
	InitDefault() error
}
