package ssmsync

import (
	"time"

	ssm_constants "github.com/networkgcorefullcode/ssm/const"
	"github.com/omec-project/webconsole/backend/factory"
	"github.com/omec-project/webconsole/backend/logger"
)

func syncKeyListen(ssmSyncMsg chan *SsmSyncMessage) {
	period := time.Duration(factory.WebUIConfig.Configuration.SSM.SsmSync.IntervalMinute) * time.Minute
	ticker := time.NewTicker(period)
	defer ticker.Stop()

	for {
		select {
		case msg := <-ssmSyncMsg:
			switch msg.Action {
			case "SYNC_OUR_KEYS":
				// Logic to synchronize our keys with SSM this process check if we have keys like as AES, DES or DES3
				SyncKeys(ssm_constants.LABEL_ENCRYPTION_KEY, msg.Action)
				for _, keyLabel := range ssm_constants.KeyLabelsInternalAllow {
					go SyncKeys(keyLabel, msg.Action)
				}
			case "SYNC_EXTERNAL_KEYS":
				// Logic to synchronize keys with SSM
				for _, keyLabel := range ssm_constants.KeyLabelsExternalAllow {
					go SyncKeys(keyLabel, msg.Action)
				}
			case "SYNC_USERS":
				// Logic to synchronize users with SSM encryption user data that are not stored in SSM
				go SyncUsers()
			default:
				logger.AppLog.Warnf("Unknown SSM sync action: %s", msg.Action)
			}
			// Handle incoming SSM sync messages
		case <-ticker.C:
			// Periodic synchronization logic
			SsmSyncInitDefault(ssmSyncMsg)
		}
	}
}
