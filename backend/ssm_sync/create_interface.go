package ssmsync

import (
	"context"

	ssm_constants "github.com/networkgcorefullcode/ssm/const"
	ssm "github.com/networkgcorefullcode/ssm/models"
	"github.com/omec-project/webconsole/backend/factory"
	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/configapi"
	"github.com/omec-project/webconsole/configmodels"
)

type CreateKeySSM interface {
	CreateNewKeySSM(keyLabel string, id int32) (configmodels.K4, error)
}

// getSSMAPIClient creates and returns a configured SSM API client
func getSSMAPIClient() *ssm.APIClient {
	configuration := ssm.NewConfiguration()
	configuration.Servers[0].URL = factory.WebUIConfig.Configuration.SSM.SsmUri
	configuration.HTTPClient = configapi.GetHTTPClient(factory.WebUIConfig.Configuration.SSM.TLS_Insecure)
	return ssm.NewAPIClient(configuration)
}

type CreateAES128SSM struct{}

func (c *CreateAES128SSM) CreateNewKeySSM(keyLabel string, id int32) (configmodels.K4, error) {
	logger.AppLog.Infof("Creating new AES-128 key in SSM with label %s, id %d", keyLabel, id)

	var genAESKeyRequest ssm.GenAESKeyRequest = ssm.GenAESKeyRequest{
		Id:   id,
		Bits: 128,
	}

	apiClient := getSSMAPIClient()

	_, r, err := apiClient.KeyManagementAPI.GenerateAESKey(context.Background()).GenAESKeyRequest(genAESKeyRequest).Execute()

	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.GenerateAESKey`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
		return configmodels.K4{}, err
	}

	return configmodels.K4{
		K4:       "",
		K4_Type:  ssm_constants.TYPE_AES,
		K4_SNO:   byte(id),
		K4_Label: keyLabel,
	}, nil
}

type CreateAES256SSM struct{}

func (c *CreateAES256SSM) CreateNewKeySSM(keyLabel string, id int32) (configmodels.K4, error) {
	logger.AppLog.Infof("Creating new AES-256 key in SSM with label %s, id %d", keyLabel, id)

	var genAESKeyRequest ssm.GenAESKeyRequest = ssm.GenAESKeyRequest{
		Id:   id,
		Bits: 256,
	}

	apiClient := getSSMAPIClient()

	_, r, err := apiClient.KeyManagementAPI.GenerateAESKey(context.Background()).GenAESKeyRequest(genAESKeyRequest).Execute()

	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.GenerateAESKey`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
		return configmodels.K4{}, err
	}

	return configmodels.K4{
		K4:       "",
		K4_Type:  ssm_constants.TYPE_AES,
		K4_SNO:   byte(id),
		K4_Label: keyLabel,
	}, nil
}

type CreateDes3SSM struct{}

func (c *CreateDes3SSM) CreateNewKeySSM(keyLabel string, id int32) (configmodels.K4, error) {
	logger.AppLog.Infof("Creating new DES3 key in SSM with label %s, id %d", keyLabel, id)

	var genDES3KeyRequest ssm.GenDES3KeyRequest = ssm.GenDES3KeyRequest{
		Id: id,
	}

	apiClient := getSSMAPIClient()

	_, r, err := apiClient.KeyManagementAPI.GenerateDES3Key(context.Background()).GenDES3KeyRequest(genDES3KeyRequest).Execute()

	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.GenerateDES3Key`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
		return configmodels.K4{}, err
	}

	return configmodels.K4{
		K4:       "",
		K4_Type:  ssm_constants.TYPE_DES3,
		K4_SNO:   byte(id),
		K4_Label: keyLabel,
	}, nil
}

type CreateDesSSM struct{}

func (c *CreateDesSSM) CreateNewKeySSM(keyLabel string, id int32) (configmodels.K4, error) {
	logger.AppLog.Infof("Creating new DES key in SSM with label %s, id %d", keyLabel, id)

	var genDESKeyRequest ssm.GenDESKeyRequest = ssm.GenDESKeyRequest{
		Id: id,
	}

	apiClient := getSSMAPIClient()

	_, r, err := apiClient.KeyManagementAPI.GenerateDESKey(context.Background()).GenDESKeyRequest(genDESKeyRequest).Execute()

	if err != nil {
		logger.DbLog.Errorf("Error when calling `KeyManagementAPI.GenerateDESKey`: %v", err)
		logger.DbLog.Errorf("Full HTTP response: %v", r)
		return configmodels.K4{}, err
	}

	return configmodels.K4{
		K4:       "",
		K4_Type:  ssm_constants.TYPE_DES,
		K4_SNO:   byte(id),
		K4_Label: keyLabel,
	}, nil
}
