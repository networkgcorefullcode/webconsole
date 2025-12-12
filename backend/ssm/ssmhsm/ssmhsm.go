package ssmhsm

import (
	"errors"

	ssm_constants "github.com/networkgcorefullcode/ssm/const"
	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/backend/ssm"
	"github.com/omec-project/webconsole/backend/ssm/apiclient"
	ssmsync "github.com/omec-project/webconsole/backend/ssm/ssm_sync"
	"github.com/omec-project/webconsole/backend/utils"
	"github.com/omec-project/webconsole/configmodels"
)

type SSMHSM struct{}

var Ssmhsm *SSMHSM = &SSMHSM{}

// Implement SSM interface methods for SSMHSM
func (hsm *SSMHSM) SyncKeyListen(ssmSyncMsg chan *ssm.SsmSyncMessage) {
	// Implementation for syncing keys with HSM
	ssmsync.SyncKeyListen(ssmSyncMsg)
}

func (hsm *SSMHSM) KeyRotationListen(ssmSyncMsg chan *ssm.SsmSyncMessage) {
	// Implementation for key rotation with HSM
	ssmsync.KeyRotationListen(ssmSyncMsg)
}

func (hsm *SSMHSM) Login() (string, error) {
	// Implementation for HSM login
	serviceId, password, err := utils.GetUserLogin()
	if err != nil {
		logger.WebUILog.Errorf("Error getting SSM login credentials: %v", err)
		return "", err
	}
	token, err := apiclient.LoginSSM(serviceId, password)
	if err != nil {
		logger.WebUILog.Errorf("Error logging into SSM: %v", err)
		return "", err
	}

	return token, nil
}

func (hsm *SSMHSM) StoreKey(k4Data *configmodels.K4) error {
	// Implementation for storing key in HSM
	// Check the K4 label keys (AES, DES or DES3)
	if !IsValidKeyIdentifier(k4Data.K4_Label, ssm_constants.KeyLabelsExternalAllow[:]) {
		logger.DbLog.Error("failed to store k4 key in SSM the label key is not valid")
		return errors.New("failed to store k4 key in SSM must key label is incorrect")
	}
	// Check the K4 type to specified the key type that will be store
	if !IsValidKeyIdentifier(k4Data.K4_Type, ssm_constants.KeyTypeAllow[:]) {
		logger.DbLog.Error("failed to store k4 key in SSM the type key is not valid")
		return errors.New("failed to store k4 key in SSM must key type is incorrect")
	}
	// Send the request to the SSM
	resp, err := StoreKeySSM(k4Data.K4_Label, k4Data.K4, k4Data.K4_Type, int32(k4Data.K4_SNO))
	if err != nil {
		logger.DbLog.Errorf("failed to store k4 key in SSM: %+v", err)
		return errors.New("failed to store k4 key in SSM")
	}
	// Check if in the response CipherKey is fill, if it is empty K4 must be a empty string ""
	if resp.CipherKey != "" {
		k4Data.K4 = resp.CipherKey
	} else {
		k4Data.K4 = ""
	}

	return nil
}

func (hsm *SSMHSM) UpdateKey(k4Data *configmodels.K4) error {
	// Implementation for updating key in HSM
	// Check the K4 label keys (AES, DES or DES3)
	if !IsValidKeyIdentifier(k4Data.K4_Label, ssm_constants.KeyLabelsExternalAllow[:]) {
		logger.DbLog.Error("failed to update k4 key in SSM the label key is not valid")
		return errors.New("failed to update k4 key in SSM must key label is incorrect")
	}
	// Check the K4 type to specified the key type that will be update
	if !IsValidKeyIdentifier(k4Data.K4_Type, ssm_constants.KeyTypeAllow[:]) {
		logger.DbLog.Error("failed to update k4 key in SSM the type key is not valid")
		return errors.New("failed to update k4 key in SSM must key type is incorrect")
	}
	// Send the request to the SSM
	resp, err := UpdateKeySSM(k4Data.K4_Label, k4Data.K4, k4Data.K4_Type, int32(k4Data.K4_SNO))
	if err != nil {
		logger.DbLog.Errorf("failed to update k4 key in SSM: %+v", err)
		return errors.New("failed to update k4 key in SSM")
	}
	// Check if in the response CipherKey is fill, if it is empty K4 must be a empty string ""
	if resp.CipherKey != "" {
		k4Data.K4 = resp.CipherKey
	} else {
		k4Data.K4 = ""
	}

	return nil
}

func (hsm *SSMHSM) DeleteKey(k4Data *configmodels.K4) error {
	// Implementation for deleting key from HSM
	// Check the K4 label keys (both external and internal labels are allowed for deletion)
	if !IsValidKeyIdentifier(k4Data.K4_Label, ssm_constants.KeyLabelsExternalAllow[:]) && !IsValidKeyIdentifier(k4Data.K4_Label, ssm_constants.KeyLabelsInternalAllow[:]) {
		logger.DbLog.Error("failed to delete k4 key in SSM the label key is not valid")
		return errors.New("failed to delete k4 key in SSM must key label is incorrect")
	}
	// Send the request to the SSM
	_, err := DeleteKeySSM(k4Data.K4_Label, int32(k4Data.K4_SNO))
	if err != nil {
		logger.DbLog.Errorf("failed to delete k4 key in SSM: %+v", err)
		return errors.New("failed to delete k4 key in SSM")
	}

	return nil
}

func (hsm *SSMHSM) HealthCheck() {
	// Implementation for HSM health check
	ssmsync.HealthCheckSSM()
}

func (hsm *SSMHSM) InitDefault() error {

	return nil
}
