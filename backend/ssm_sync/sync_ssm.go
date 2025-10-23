package ssmsync

import (
	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/configmodels"
)

// TODO: analise this implementation and add mutex to avoid race conditions

// var cfgChannel chan *configmodels.ConfigMessage

// Message structure for SSM synchronization
// List of actions: "SYNC_EXTERNAL_KEYS", "SYNC_USERS", "SYNC_OUR_KEYS", "HEALTH_CHECK" see below
// "KEY_ROTATION", "CHECK_KEY_LIFE"
type SsmSyncMessage struct {
	Action string
	Info   string
}

var ErrorSyncChan chan error = make(chan error, 10)
var ErrorRotationChan chan error = make(chan error, 10)

func SetCfgChannel(ch chan *configmodels.ConfigMessage) {
	cfgChannel = ch
}

// Implementation of SSM synchronization logic
func SyncSsm(ssmSyncMsg chan *SsmSyncMessage) {
	// A select statement to listen for messages or timers
	go syncKeyListen(ssmSyncMsg)

	// Listen for rotation operations
	go keyRotationListen(ssmSyncMsg)

	for {
		select {
		case err := <-ErrorSyncChan:
			logger.AppLog.Errorf("Detect a error in sync functions %s", err)
		case err := <-ErrorRotationChan:
			logger.AppLog.Errorf("Detect a error in rotation functions %s", err)
		}
	}
}
