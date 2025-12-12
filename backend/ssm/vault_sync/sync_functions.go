package vaultsync

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	ssm_constants "github.com/networkgcorefullcode/ssm/const"
	ssm_models "github.com/networkgcorefullcode/ssm/models"

	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/backend/ssm/apiclient"
	ssmapi "github.com/omec-project/webconsole/configapi/ssm_api"
	"github.com/omec-project/webconsole/configmodels"
)

func createNewKeyVaultTransit(keyLabel string) (configmodels.K4, error) {
	logger.AppLog.Infof("Creating new key in Vault transit engine")

	if readStopCondition() {
		logger.AppLog.Warn("Vault is down; skipping internal key sync")
		return configmodels.K4{}, errors.New("vault is down")
	}

	client, err := apiclient.GetVaultClient()
	if err != nil {
		logger.AppLog.Errorf("Failed to get Vault client: %v", err)
		return configmodels.K4{}, err
	}

	if apiclient.VaultAuthToken == "" {
		if _, err := apiclient.LoginVault(); err != nil {
			logger.AppLog.Errorf("Failed to authenticate to Vault: %v", err)
			setStopCondition(true)
			return configmodels.K4{}, err
		}
	}

	logger.AppLog.Infof("Syncing internal key %s using transit engine", internalKeyLabel)

	secret, err := client.Logical().List(transitKeysListPath)
	if err != nil {
		logger.AppLog.Errorf("Failed to list transit keys: %v", err)
		return configmodels.K4{}, err
	}

	found := false
	if secret != nil && secret.Data != nil {
		if keys, ok := secret.Data["keys"].([]interface{}); ok {
			for _, k := range keys {
				if keyName, ok := k.(string); ok && keyName == internalKeyLabel+"/" {
					found = true
					break
				}
			}
		}
	}

	if found {
		logger.AppLog.Infof("Internal key %s already exists in transit", internalKeyLabel)
		return configmodels.K4{}, errors.New("error: internal key already exists in transit")
	}

	logger.AppLog.Infof("Creating transit key %s", internalKeyLabel)
	createPath := fmt.Sprintf(transitKeyCreateFormat, internalKeyLabel)
	if _, err := client.Logical().Write(createPath, map[string]interface{}{"type": "aes256-gcm96"}); err != nil {
		logger.AppLog.Errorf("Failed to create transit key %s: %v", internalKeyLabel, err)
		return configmodels.K4{}, err
	}
	logger.AppLog.Infof("Transit key %s created successfully", internalKeyLabel)

	return configmodels.K4{
		K4:       "",
		K4_Type:  ssm_constants.TYPE_AES,
		K4_SNO:   0,
		K4_Label: keyLabel,
	}, nil
}

func createNewKeyVaultStore() error {
	if readStopCondition() {
		logger.AppLog.Warn("Vault is down; skipping external key sync")
		return errors.New("vault is down")
	}

	client, err := apiclient.GetVaultClient()
	if err != nil {
		logger.AppLog.Errorf("Failed to get Vault client: %v", err)
		return err
	}

	if apiclient.VaultAuthToken == "" {
		if _, err := apiclient.LoginVault(); err != nil {
			logger.AppLog.Errorf("Failed to authenticate to Vault: %v", err)
			setStopCondition(true)
			return err
		}
	}

	logger.AppLog.Infof("Syncing external keys from KV path: %s", externalKeysListPath)
	secret, err := client.Logical().List(externalKeysListPath)
	if err != nil {
		logger.AppLog.Errorf("Failed to list external keys: %v", err)
		return err
	}

	if secret == nil || secret.Data == nil {
		logger.AppLog.Info("No external keys found in Vault")
		return nil
	}

	keys, ok := secret.Data["keys"].([]interface{})
	if !ok {
		logger.AppLog.Warn("Unexpected format when listing external keys")
		return errors.New("unexpected format when listing external keys")
	}

	logger.AppLog.Infof("Found %d external keys in Vault", len(keys))
	return nil
}

// getVaultLabelFilter retrieves keys from Vault filtered by key label
// and returns them as ssm_models.DataKeyInfo for consistency with SSM sync
func getVaultLabelFilter(keyLabel string, dataKeyInfoListChan chan []ssm_models.DataKeyInfo) {
	logger.AppLog.Debugf("Fetching keys from Vault with label: %s", keyLabel)

	// Check if Vault is available
	if readStopCondition() {
		logger.AppLog.Warn("Vault is down or unavailable; skipping key retrieval")
		dataKeyInfoListChan <- nil
		return
	}

	// List all keys from Vault
	keys, err := ssmapi.ListKeysVault()
	if err != nil {
		logger.DbLog.Errorf("Error listing keys from Vault: %v", err)
		dataKeyInfoListChan <- nil
		ErrorSyncChan <- err
		return
	}

	// Filter keys by label and convert to DataKeyInfo
	var dataKeyInfoList []ssm_models.DataKeyInfo

	for _, keyName := range keys {
		// Key names in Vault are formatted as "label-id"
		parts := strings.Split(keyName, "-")
		if len(parts) < 2 {
			logger.AppLog.Debugf("Skipping key with unexpected format: %s", keyName)
			continue
		}

		// Extract label and ID from key name
		extractedLabel := strings.Join(parts[:len(parts)-1], "-") // Handle labels with hyphens
		extractedIDStr := parts[len(parts)-1]

		// Check if this key matches the requested label
		if extractedLabel != keyLabel {
			continue
		}

		// Convert ID string to integer
		keyID, err := strconv.ParseInt(extractedIDStr, 10, 32)
		if err != nil {
			logger.AppLog.Debugf("Skipping key with invalid ID format: %s", extractedIDStr)
			continue
		}

		// Retrieve key details from Vault
		keyData, err := ssmapi.GetKeyVault(keyLabel, int32(keyID))
		if err != nil {
			logger.AppLog.Warnf("Failed to retrieve key details for %s-%d: %v", keyLabel, keyID, err)
			continue
		}

		// Convert key data to DataKeyInfo
		dataKeyInfo := convertVaultKeyToDataKeyInfo(keyData, int32(keyID))
		if dataKeyInfo != nil {
			dataKeyInfoList = append(dataKeyInfoList, *dataKeyInfo)
			logger.AppLog.Debugf("Added key to list: %s-%d", keyLabel, keyID)
		}
	}

	logger.AppLog.Infof("Retrieved %d keys from Vault with label: %s", len(dataKeyInfoList), keyLabel)
	dataKeyInfoListChan <- dataKeyInfoList
}

func deleteKeyToVault(k4 configmodels.K4) error {
	err := ssmapi.DeleteKeyVault(k4.K4_Label, int32(k4.K4_SNO))
	return err
}

// convertVaultKeyToDataKeyInfo converts Vault key data to ssm_models.DataKeyInfo
func convertVaultKeyToDataKeyInfo(keyData map[string]interface{}, keyID int32) *ssm_models.DataKeyInfo {
	if keyData == nil {
		return nil
	}

	dataKeyInfo := &ssm_models.DataKeyInfo{
		Id: keyID,
	}

	logger.AppLog.Debugf("Converted Vault key to DataKeyInfo: ID=%d", dataKeyInfo.Id)

	return dataKeyInfo
}
