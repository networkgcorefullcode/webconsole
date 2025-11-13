package configapi

import (
	"fmt"
	"slices"

	ssm "github.com/networkgcorefullcode/ssm/models"
	"github.com/omec-project/webconsole/backend/apiclient"
	"github.com/omec-project/webconsole/backend/factory"
	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/configmodels"
	"github.com/omec-project/webconsole/dbadapter"
	"go.mongodb.org/mongo-driver/bson"
)

type K4Data interface {
	K4DataGet(k4Sno int) (k4keyData *configmodels.K4)
	K4DataCreate(k4Sno int, k4keyData *configmodels.K4) error
	K4DataUpdate(k4Sno int, k4keyData *configmodels.K4) error
	K4DataDelete(k4Sno int) error
}

type DatabaseK4Data struct {
	K4Data
}

func K4HelperPost(k4Sno int, k4keyData *configmodels.K4) error {
	rwLock.Lock()
	defer rwLock.Unlock()
	k4Data := DatabaseK4Data{}
	err := k4Data.K4DataCreate(k4Sno, k4keyData)
	if err != nil {
		logger.DbLog.Errorln("K4 Key Create Error:", err)
		return err
	}
	logger.DbLog.Debugf("successfully processed K4 key create for SNO: %s", k4Sno)
	return nil
}

func K4HelperPut(k4Sno int, k4keyData *configmodels.K4) error {
	rwLock.Lock()
	defer rwLock.Unlock()
	k4Data := DatabaseK4Data{}
	err := k4Data.K4DataUpdate(k4Sno, k4keyData)
	if err != nil {
		logger.DbLog.Errorln("K4 Key Update Error:", err)
		return err
	}
	logger.DbLog.Debugf("successfully processed K4 key update for SNO: %s", k4Sno)
	return nil
}

func K4HelperDelete(k4Sno int, keyLabel string) error {
	rwLock.Lock()
	defer rwLock.Unlock()
	k4Data := DatabaseK4Data{}
	err := k4Data.K4DataDelete(k4Sno, keyLabel)
	if err != nil {
		logger.DbLog.Errorln("K4 Key DeK4DataDelete Error:", err)
		return err
	}
	logger.DbLog.Debugf("successfully processed K4 key DeK4DataDelete for SNO: %s", k4Sno)
	return nil
}

// Interfaces definition
func (k4Database DatabaseK4Data) K4DataCreate(k4Sno int, k4Data *configmodels.K4) error {
	filter := bson.M{"k4_sno": k4Sno}
	if factory.WebUIConfig.Configuration.SSM.AllowSsm {
		filter = bson.M{"k4_sno": k4Sno, "key_label": k4Data.K4_Label}
	}
	logger.WebUILog.Infof("%+v", k4Data)
	k4DataBsonA := configmodels.ToBsonM(k4Data)
	// write to AuthDB
	if _, err := dbadapter.AuthDBClient.RestfulAPIPost(K4KeysColl, filter, k4DataBsonA); err != nil {
		logger.DbLog.Errorf("failed to create K4 key error: %+v", err)
		return err
	}
	logger.WebUILog.Infof("created K4 key in k4Keys collection: %s", k4Sno)
	// write to CommonDB
	basicAmData := map[string]interface{}{"k4_sno": k4Sno}
	basicDataBson := configmodels.ToBsonM(basicAmData)
	if _, err := dbadapter.CommonDBClient.RestfulAPIPost(k4KeysCollCom, filter, basicDataBson); err != nil {
		logger.DbLog.Errorf("failed to update K4 reference data error: %+v", err)
		// rollback AuthDB operation
		if cleanupErr := dbadapter.AuthDBClient.RestfulAPIDeleteOne(K4KeysColl, filter); cleanupErr != nil {
			logger.DbLog.Errorf("rollback failed after K4 key creation error: %+v", cleanupErr)
			return fmt.Errorf("K4 key creation failed: %w, rollback failed: %+v", err, cleanupErr)
		}
		return fmt.Errorf("K4 key creation failed, rolled back K4 key: %w", err)
	}
	logger.WebUILog.Infof("successfully created K4 reference in amData collection: %s", k4Sno)
	return nil
}

func (k4Database DatabaseK4Data) K4DataUpdate(k4Sno int, k4Data *configmodels.K4) error {
	filter := bson.M{"k4_sno": k4Sno}
	if factory.WebUIConfig.Configuration.SSM.AllowSsm {
		filter = bson.M{"k4_sno": k4Sno, "key_label": k4Data.K4_Label}
	}
	k4DataBsonA := configmodels.ToBsonM(k4Data)
	// get backup
	backup, err := dbadapter.AuthDBClient.RestfulAPIGetOne(K4KeysColl, filter)
	if err != nil {
		logger.DbLog.Errorf("failed to get backup data for authentication subscription: %+v", err)
	}
	// write to AuthDB
	if _, err = dbadapter.AuthDBClient.RestfulAPIPutOne(K4KeysColl, filter, k4DataBsonA); err != nil {
		logger.DbLog.Errorf("failed to update K4 key error: %+v", err)
		return err
	}
	logger.WebUILog.Debugf("updated K4 key in k4Keys collection: %s", k4Sno)
	// write to CommonDB
	basicAmData := map[string]interface{}{"k4_sno": k4Sno}
	basicDataBson := configmodels.ToBsonM(basicAmData)
	if _, err = dbadapter.CommonDBClient.RestfulAPIPutOne(k4KeysCollCom, filter, basicDataBson); err != nil {
		logger.DbLog.Errorf("failed to update K4 reference data error: %+v", err)
		// restore old K4 key if any
		if backup != nil {
			_, err = dbadapter.AuthDBClient.RestfulAPIPutOne(K4KeysColl, filter, backup)
			if err != nil {
				logger.DbLog.Errorf("failed to restore backup data for K4 key error: %+v", err)
			}
		}
		return fmt.Errorf("K4 key update failed, rolled back to previous version: %w", err)
	}
	logger.WebUILog.Debugf("successfully updated K4 reference in amData collection: %s", k4Sno)
	return nil
}

func (k4Database DatabaseK4Data) K4DataDelete(k4Sno int, keyLabel string) error {
	logger.WebUILog.Debugf("delete k4 key from authenticationSubscription collection: %s", k4Sno)
	filter := bson.M{"k4_sno": k4Sno}

	if factory.WebUIConfig.Configuration.SSM.AllowSsm {
		filter = bson.M{"k4_sno": k4Sno, "key_label": keyLabel}
	}

	origAuthData, getErr := dbadapter.AuthDBClient.RestfulAPIGetOne(K4KeysColl, filter)
	if getErr != nil {
		logger.DbLog.Errorln("failed to fetch original AuthDB record before delete:", getErr)
		return getErr
	}

	// delete in AuthDB
	err := dbadapter.AuthDBClient.RestfulAPIDeleteOne(K4KeysColl, filter)
	if err != nil {
		logger.DbLog.Errorln(err)
		return err
	}
	logger.WebUILog.Debugf("successfully deleted k4 key from authenticationSubscription collection: %v", k4Sno)

	err = dbadapter.CommonDBClient.RestfulAPIDeleteOne(k4KeysCollCom, filter)
	if err != nil {
		logger.DbLog.Errorln(err)
		// rollback AuthDB operation
		if origAuthData != nil {
			_, restoreErr := dbadapter.AuthDBClient.RestfulAPIPost(K4KeysColl, filter, origAuthData)
			if restoreErr != nil {
				logger.DbLog.Errorf("rollback failed after amData delete error error: %+v", restoreErr)
				return fmt.Errorf("amData delete failed: %w, rollback failed: %w", err, restoreErr)
			}
			return fmt.Errorf("amData delete failed, rolled back AuthDB change: %w", err)
		}
		return fmt.Errorf("amData delete failed, unable to rollback AuthDB change: %w", err)
	}
	logger.WebUILog.Debugf("successfully deleted k4 key from amData collection: %s", k4Sno)
	return nil
}

func storeKeySSM(keyLabel, keyValue, keyType string, keyID int32) (*ssm.StoreKeyResponse, error) {
	logger.AppLog.Debugf("key label: %s key id: %s key type: %s", keyLabel, keyID, keyType)
	var storeKeyRequest ssm.StoreKeyRequest = ssm.StoreKeyRequest{
		KeyLabel: keyLabel,
		Id:       keyID,
		KeyValue: keyValue,
		KeyType:  keyType,
	}
	logger.AppLog.Debugf("key label: %s key id: %s key type: %s", storeKeyRequest.KeyLabel, storeKeyRequest.Id, storeKeyRequest.KeyType)

	apiClient := apiclient.GetSSMAPIClient()

	resp, r, err := apiClient.KeyManagementAPI.StoreKey(apiclient.AuthContext).StoreKeyRequest(storeKeyRequest).Execute()
	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.StoreKey`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
		return nil, err
	}
	logger.WebUILog.Infof("Response from `KeyManagementAPI.StoreKey`: %+v", resp)
	return resp, nil
}

func updateKeySSM(keyLabel, keyValue, keyType string, keyID int32) (*ssm.UpdateKeyResponse, error) {
	logger.AppLog.Debugf("key label: %s key id: %s key type: %s", keyLabel, keyID, keyType)
	var updateKeyRequest ssm.UpdateKeyRequest = ssm.UpdateKeyRequest{
		KeyLabel: keyLabel,
		Id:       keyID,
		KeyValue: keyValue,
		KeyType:  keyType,
	}
	logger.AppLog.Debugf("key label: %s key id: %s key type: %s", updateKeyRequest.KeyLabel, updateKeyRequest.Id, updateKeyRequest.KeyType)

	apiClient := apiclient.GetSSMAPIClient()

	resp, r, err := apiClient.KeyManagementAPI.UpdateKey(apiclient.AuthContext).UpdateKeyRequest(updateKeyRequest).Execute()
	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.StoreKey`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
		return nil, err
	}
	logger.WebUILog.Infof("Response from `KeyManagementAPI.StoreKey`: %+v", resp)
	return resp, nil
}

func deleteKeySSM(keyLabel string, keyID int32) (*ssm.DeleteKeyResponse, error) {
	logger.AppLog.Debugf("key label: %s key id: %s key type: %s", keyLabel, keyID)
	var deleteKeyRequest ssm.DeleteKeyRequest = ssm.DeleteKeyRequest{
		KeyLabel: keyLabel,
		Id:       keyID,
	}
	logger.AppLog.Debugf("key label: %s key id: %s key type: %s", deleteKeyRequest.KeyLabel, deleteKeyRequest.Id)

	apiClient := apiclient.GetSSMAPIClient()

	resp, r, err := apiClient.KeyManagementAPI.DeleteKey(apiclient.AuthContext).DeleteKeyRequest(deleteKeyRequest).Execute()
	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.StoreKey`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
		return nil, err
	}
	logger.WebUILog.Infof("Response from `KeyManagementAPI.StoreKey`: %+v", resp)
	return resp, nil
}

func isValidKeyIdentifier(keyLabel string, keyIdentifier []string) bool {
	if keyLabel == "" {
		return false
	}
	return slices.Contains(keyIdentifier, keyLabel)
}
