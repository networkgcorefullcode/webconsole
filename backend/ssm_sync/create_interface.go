package ssmsync

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"net/http"
	"os"

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

var apiClient *ssm.APIClient

// getSSMAPIClient creates and returns a configured SSM API client
func getSSMAPIClient() *ssm.APIClient {
	if apiClient != nil {
		return apiClient
	}
	configuration := ssm.NewConfiguration()
	configuration.Servers[0].URL = factory.WebUIConfig.Configuration.SSM.SsmUri
	configuration.HTTPClient = configapi.GetHTTPClient(factory.WebUIConfig.Configuration.SSM.TLS_Insecure)

	if factory.WebUIConfig.Configuration.SSM.MTls == nil {
		// 1️⃣ Load client certificate for mTLS
		cert, err := tls.LoadX509KeyPair("client.crt", "client.key")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading client certificate: %v\n", err)
			return nil
		}

		// 2️⃣ Load root certificate (CA) that signed the server
		caCert, err := os.ReadFile("ca.crt")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error reading CA: %v\n", err)
			return nil
		}

		caCertPool := x509.NewCertPool()
		caCertPool.AppendCertsFromPEM(caCert)

		// 3️⃣ Configure TLS
		tlsConfig := &tls.Config{
			Certificates: []tls.Certificate{cert}, // client authentication
			RootCAs:      caCertPool,              // verify server
			MinVersion:   tls.VersionTLS12,
		}

		// 4️⃣ Create an HTTP client with this configuration
		transport := &http.Transport{TLSClientConfig: tlsConfig}
		httpClient := &http.Client{Transport: transport}

		if factory.WebUIConfig.Configuration.SSM.TLS_Insecure {
			httpClient.Transport.(*http.Transport).TLSClientConfig.InsecureSkipVerify = true
		}

		// 5️⃣ Configure the OpenAPI client
		configuration := ssm.NewConfiguration()
		configuration.HTTPClient = httpClient
	}

	apiClient = ssm.NewAPIClient(configuration)

	return apiClient
}

type CreateAES128SSM struct{}

func (c *CreateAES128SSM) CreateNewKeySSM(keyLabel string, id int32) (configmodels.K4, error) {
	logger.AppLog.Infof("Creating new AES-128 key in SSM with label %s, id %d", keyLabel, id)

	var genAESKeyRequest ssm.GenAESKeyRequest = ssm.GenAESKeyRequest{
		Id:   id,
		Bits: 128,
	}

	apiClient := getSSMAPIClient()

	_, r, err := apiClient.KeyManagementAPI.GenerateAESKey(AuthContext).GenAESKeyRequest(genAESKeyRequest).Execute()

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

	_, r, err := apiClient.KeyManagementAPI.GenerateAESKey(AuthContext).GenAESKeyRequest(genAESKeyRequest).Execute()

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

	_, r, err := apiClient.KeyManagementAPI.GenerateDES3Key(AuthContext).GenDES3KeyRequest(genDES3KeyRequest).Execute()

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

	_, r, err := apiClient.KeyManagementAPI.GenerateDESKey(AuthContext).GenDESKeyRequest(genDESKeyRequest).Execute()

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
