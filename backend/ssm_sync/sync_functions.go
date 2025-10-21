package ssmsync

import (
	"context"
	"encoding/json"
	"fmt"

	ssm_constants "github.com/networkgcorefullcode/ssm/const"
	ssm "github.com/networkgcorefullcode/ssm/models"
	"github.com/omec-project/openapi/models"
	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/configapi"
	"github.com/omec-project/webconsole/configmodels"
	"github.com/omec-project/webconsole/dbadapter"
	"go.mongodb.org/mongo-driver/bson"
)

func getMongoDBLabelFilter(keyLabel string, k4listChan chan []configmodels.K4) {
	k4List := make([]configmodels.K4, 0)
	k4DataList, errGetMany := dbadapter.AuthDBClient.RestfulAPIGetMany(configapi.K4KeysColl, bson.M{"key_label": keyLabel})
	if errGetMany != nil {
		logger.DbLog.Errorf("failed to retrieve k4 keys list with error: %+v", errGetMany)
	}

	for _, k4Data := range k4DataList {
		tmp := configmodels.K4{
			K4:      k4Data["k4"].(string),
			K4_Type: k4Data["key_type"].(string),
		}

		K4SNO_Float := k4Data["k4_sno"].(float64)
		K4SNO_Int := int(K4SNO_Float)
		K4_SNO := byte(K4SNO_Int)

		tmp.K4_SNO = K4_SNO

		k4List = append(k4List, tmp)
	}
	k4listChan <- k4List
}

func getSSMLabelFilter(keyLabel string, dataKeyInfoListChan chan []ssm.DataKeyInfo) {
	// Logic to get keys from SSM based on keyLabel

	logger.AppLog.Debugf("key label: %s", keyLabel)
	var getDataKeysRequest ssm.GetDataKeysRequest = ssm.GetDataKeysRequest{
		KeyLabel: keyLabel,
	}
	logger.AppLog.Debugf("Fetching keys from SSM with label: %s", getDataKeysRequest.KeyLabel)

	apiClient := getSSMAPIClient()

	resp, r, err := apiClient.KeyManagementAPI.GetDataKeys(context.Background()).GetDataKeysRequest(getDataKeysRequest).Execute()

	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.GetDataKeys`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
	}

	dataKeyInfoListChan <- resp.Keys
}

func deleteKeyToSSM(k4 configmodels.K4) error {
	logger.AppLog.Infof("Deleting key SNO %d with label %s from SSM", k4.K4_SNO, k4.K4_Label)

	apiClient := getSSMAPIClient()
	var deleteDataKeyRequest ssm.DeleteKeyRequest = ssm.DeleteKeyRequest{
		Id:       int32(k4.K4_SNO),
		KeyLabel: k4.K4_Label,
	}

	_, r, err := apiClient.KeyManagementAPI.DeleteKey(context.Background()).DeleteKeyRequest(deleteDataKeyRequest).Execute()

	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.DeleteKey`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
	}

	return nil
}

func storeInMongoDB(k4 configmodels.K4, keyLabel string) error {
	logger.AppLog.Infof("Storing new key SNO %d in MongoDB with label %s", k4.K4_SNO, keyLabel)

	k4Data := bson.M{
		"k4":        k4.K4,
		"k4_sno":    k4.K4_SNO,
		"key_label": k4.K4_Label,
		"key_type":  k4.K4_Type,
	}

	_, err := dbadapter.AuthDBClient.RestfulAPIPutOne(configapi.K4KeysColl, bson.M{"k4_sno": k4.K4_SNO, "key_label": keyLabel}, k4Data)
	if err != nil {
		logger.DbLog.Errorf("Failed to store K4 key in MongoDB: %v", err)
		return err
	}

	logger.AppLog.Infof("Successfully stored K4 key with SNO %d and label %s in MongoDB", k4.K4_SNO, keyLabel)
	return nil
}

func createNewKeySSM(keyLabel string, id int32) (configmodels.K4, error) {
	var creator CreateKeySSM

	// Determine which creator to use based on key type embedded in label
	// Assuming labels follow pattern: K4_AES, K4_DES, K4_DES3
	switch keyLabel {
	case ssm_constants.LABEL_ENCRIPTION_KEY_AES128:
		creator = &CreateAES128SSM{}
	case ssm_constants.LABEL_ENCRIPTION_KEY_AES256:
		creator = &CreateAES256SSM{}
	case ssm_constants.LABEL_ENCRIPTION_KEY_DES3:
		creator = &CreateDes3SSM{}
	case ssm_constants.LABEL_ENCRIPTION_KEY_DES:
		creator = &CreateDesSSM{}
	default:
		return configmodels.K4{}, fmt.Errorf("unsupported key label: %s", keyLabel)
	}

	return creator.CreateNewKeySSM(keyLabel, id)
}

func getUsers() []configmodels.SubsListIE {
	logger.WebUILog.Infoln("Get All Subscribers List")

	logger.WebUILog.Infoln("Get All Subscribers List")

	subsList := make([]configmodels.SubsListIE, 0)
	amDataList, errGetMany := dbadapter.CommonDBClient.RestfulAPIGetMany(configapi.AmDataColl, bson.M{})
	if errGetMany != nil {
		logger.DbLog.Errorf("failed to retrieve subscribers list with error: %+v", errGetMany)
		return subsList
	}
	logger.AppLog.Infof("GetSubscribers: amDataList: %+v, len: %d", amDataList, len(amDataList))
	if len(amDataList) == 0 {
		return subsList
	}
	for _, amData := range amDataList {
		var subsData configmodels.SubsListIE

		err := json.Unmarshal(configmodels.MapToByte(amData), &subsData)
		if err != nil {
			logger.DbLog.Errorf("could not unmarshal subscriber %s", amData)
		}

		if servingPlmnId, plmnIdExists := amData["servingPlmnId"]; plmnIdExists {
			subsData.PlmnID = servingPlmnId.(string)
		}

		subsList = append(subsList, subsData)
	}

	return subsList
}

func getSubscriberData(ueId string) (*configmodels.SubsData, error) {
	filterUeIdOnly := bson.M{"ueId": ueId}

	var subsData configmodels.SubsData

	authSubsDataInterface, err := dbadapter.AuthDBClient.RestfulAPIGetOne(configapi.AuthSubsDataColl, filterUeIdOnly)
	if err != nil {
		logger.DbLog.Errorf("failed to fetch authentication subscription data from DB: %+v", err)
		return &subsData, fmt.Errorf("failed to fetch authentication subscription data: %w", err)
	}
	amDataDataInterface, err := dbadapter.CommonDBClient.RestfulAPIGetOne(configapi.AmDataColl, filterUeIdOnly)
	if err != nil {
		logger.DbLog.Errorf("failed to fetch am data from DB: %+v", err)
		return &subsData, fmt.Errorf("failed to fetch am data: %w", err)
	}
	smDataDataInterface, err := dbadapter.CommonDBClient.RestfulAPIGetMany(configapi.SmDataColl, filterUeIdOnly)
	if err != nil {
		logger.DbLog.Errorf("failed to fetch sm data from DB: %+v", err)
		return &subsData, fmt.Errorf("failed to fetch sm data: %w", err)
	}
	smfSelDataInterface, err := dbadapter.CommonDBClient.RestfulAPIGetOne(configapi.SmfSelDataColl, filterUeIdOnly)
	if err != nil {
		logger.DbLog.Errorf("failed to fetch smf selection data from DB: %+v", err)
		return &subsData, fmt.Errorf("failed to fetch smf selection data: %w", err)
	}
	amPolicyDataInterface, err := dbadapter.CommonDBClient.RestfulAPIGetOne(configapi.AmPolicyDataColl, filterUeIdOnly)
	if err != nil {
		logger.DbLog.Errorf("failed to fetch am policy data from DB: %+v", err)
		return &subsData, fmt.Errorf("failed to fetch am policy data: %w", err)
	}
	smPolicyDataInterface, err := dbadapter.CommonDBClient.RestfulAPIGetOne(configapi.SmPolicyDataColl, filterUeIdOnly)
	if err != nil {
		logger.DbLog.Errorf("failed to fetch sm policy data from DB: %+v", err)
		return &subsData, fmt.Errorf("failed to fetch sm policy data: %w", err)
	}
	// If all fetched data is empty, return error
	if authSubsDataInterface == nil &&
		amDataDataInterface == nil &&
		smDataDataInterface == nil &&
		smfSelDataInterface == nil &&
		amPolicyDataInterface == nil &&
		smPolicyDataInterface == nil {
		logger.WebUILog.Errorf("subscriber with ID %s not found", ueId)
		return &subsData, fmt.Errorf("subscriber with ID %s not found", ueId)
	}

	var authSubsData models.AuthenticationSubscription
	if authSubsDataInterface != nil {
		err := json.Unmarshal(configmodels.MapToByte(authSubsDataInterface), &authSubsData)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling authentication subscription data: %+v", err)
			return &subsData, fmt.Errorf("failed to unmarshal authentication subscription data: %w", err)
		}
	}

	var amDataData models.AccessAndMobilitySubscriptionData
	if amDataDataInterface != nil {
		err := json.Unmarshal(configmodels.MapToByte(amDataDataInterface), &amDataData)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling access and mobility subscription data: %+v", err)
			return &subsData, fmt.Errorf("failed to unmarshal access and mobility subscription data: %w", err)
		}
	}

	var smDataData []models.SessionManagementSubscriptionData
	if smDataDataInterface != nil {
		bytesData, err := configapi.SliceToByte(smDataDataInterface)
		if err != nil {
			logger.WebUILog.Errorf("failed to convert slice to byte: %+v", err)
			return &subsData, fmt.Errorf("failed to convert slice to byte: %w", err)
		}
		err = json.Unmarshal(bytesData, &smDataData)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling session management subscription data: %+v", err)
			return &subsData, fmt.Errorf("failed to unmarshal session management subscription data: %w", err)
		}
	}

	var smfSelData models.SmfSelectionSubscriptionData
	if smfSelDataInterface != nil {
		err := json.Unmarshal(configmodels.MapToByte(smfSelDataInterface), &smfSelData)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling smf selection subscription data: %+v", err)
			return &subsData, fmt.Errorf("failed to unmarshal smf selection subscription data: %w", err)
		}
	}

	var amPolicyData models.AmPolicyData
	if amPolicyDataInterface != nil {
		err := json.Unmarshal(configmodels.MapToByte(amPolicyDataInterface), &amPolicyData)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling am policy data: %+v", err)
			return &subsData, fmt.Errorf("failed to unmarshal am policy data: %w", err)
		}
	}

	var smPolicyData models.SmPolicyData
	if smPolicyDataInterface != nil {
		err := json.Unmarshal(configmodels.MapToByte(smPolicyDataInterface), &smPolicyData)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling sm policy data: %+v", err)
			return &subsData, fmt.Errorf("failed to unmarshal sm policy data: %w", err)
		}
	}

	subsData = configmodels.SubsData{
		UeId:                              ueId,
		AuthenticationSubscription:        authSubsData,
		AccessAndMobilitySubscriptionData: amDataData,
		SessionManagementSubscriptionData: smDataData,
		SmfSelectionSubscriptionData:      smfSelData,
		AmPolicyData:                      amPolicyData,
		SmPolicyData:                      smPolicyData,
	}

	return &subsData, nil
}

func deleteKeyMongoDB(k4 configmodels.K4) error {
	logger.AppLog.Infof("Deleting key SNO %d with label %s from MongoDB", k4.K4_SNO, k4.K4_Label)

	err := dbadapter.AuthDBClient.RestfulAPIDeleteOne(configapi.K4KeysColl, bson.M{"k4_sno": k4.K4_SNO, "key_label": k4.K4_Label})
	return err
}
