package ssmsync

import (
	"sync"
	"time"

	"github.com/omec-project/webconsole/backend/apiclient"
	"github.com/omec-project/webconsole/backend/logger"
)

var healthMutex sync.Mutex

func HealthCheckSSM() {
	logger.AppLog.Info("Init the health check to ssm")

	apiClient := apiclient.GetSSMAPIClient()
	for {
		healthMutex.Lock()
		logger.AppLog.Debug("Send a heathcheck to the ssm")
		resp, r, err := apiClient.HealthAPI.HealthCheckGet(apiclient.AuthContext).Execute()

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
