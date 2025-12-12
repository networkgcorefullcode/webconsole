package vaultsync

import (
	"errors"
	"fmt"
	"strings"

	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/backend/ssm"
	"github.com/omec-project/webconsole/backend/ssm/apiclient"
)

// KeyRotationListen handles rotation events for the internal transit key
func KeyRotationListen(ssmSyncMsg chan *ssm.SsmSyncMessage) {
	logger.AppLog.Infof("Vault key rotation listener started")
	for msg := range ssmSyncMsg {
		switch strings.ToUpper(msg.Action) {
		case "ROTATE_INTERNAL_KEY", "ROTATE_K4":
			if err := rotateInternalTransitKey(internalKeyLabel); err != nil {
				logger.AppLog.Errorf("Failed to rotate internal transit key: %v", err)
			} else {
				logger.AppLog.Infof("Internal transit key rotated successfully")
			}
		default:
			logger.AppLog.Warnf("Unknown rotation action: %s", msg.Action)
		}
	}
}

func rotateInternalTransitKey(keyLabel string) error {
	if readStopCondition() {
		return errors.New("vault is down; skipping rotation")
	}

	client, err := apiclient.GetVaultClient()
	if err != nil {
		return fmt.Errorf("get vault client: %w", err)
	}

	if apiclient.VaultAuthToken == "" {
		if _, err := apiclient.LoginVault(); err != nil {
			setStopCondition(true)
			return fmt.Errorf("authenticate vault: %w", err)
		}
	}

	rotatePath := fmt.Sprintf("transit/keys/%s/rotate", keyLabel)
	if _, err := client.Logical().Write(rotatePath, nil); err != nil {
		return fmt.Errorf("rotate transit key %s: %w", keyLabel, err)
	}
	return nil
}
