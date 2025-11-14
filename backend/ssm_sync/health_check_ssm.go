package ssmsync

import (
	"sync"
	"time"

	"github.com/omec-project/webconsole/backend/apiclient"
	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/backend/utils"
)

var healthMutex sync.Mutex

func HealthCheckSSM() {
	logger.AppLog.Info("Init the health check to ssm")

	apiClient := apiclient.GetSSMAPIClient()
	for {
		healthMutex.Lock()
		logger.AppLog.Debug("Send a heathcheck to the ssm")
		resp, r, err := apiClient.HealthAPI.HealthCheckGet(apiclient.AuthContext).Execute()

		// This conditional block handles the case where the SSM returns a 401 Unauthorized response.
		// Try to login again and retry the health check.
		if r != nil && r.StatusCode == 401 {
			logger.DbLog.Errorf("SSM returned 401 Unauthorized. Loggin in the service, and retrying healthcheck.")
			serviceId, pass, err := utils.GetUserLogin()
			if err != nil {
				logger.DbLog.Errorf("Error getting SSM login credentials: %v", err)
				StopSSMsyncFunction = true
				healthMutex.Unlock()
			}
			_, err = apiclient.LoginSSM(serviceId, pass)
			if err != nil {
				logger.DbLog.Errorf("Error logging in to SSM: %v", err)
				StopSSMsyncFunction = true
				healthMutex.Unlock()
			}
		}

		if err != nil {
			logger.DbLog.Errorf("Error when calling `HealthCheck`: %v", err)
			logger.DbLog.Errorf("Full HTTP response: %v", r)
			StopSSMsyncFunction = true
			healthMutex.Unlock()
			time.Sleep(time.Second * 5)
			continue
		}

		if resp != nil {
			if resp.Status == "OK" {
				StopSSMsyncFunction = false
			}
		}
		healthMutex.Unlock()
		time.Sleep(time.Second * 5)
	}
}
