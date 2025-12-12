package vaultsync

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	ssm_constants "github.com/networkgcorefullcode/ssm/const"
	"github.com/omec-project/webconsole/backend/logger"
)

func handleSyncKey(c *gin.Context) {
	// Try to get the priority
	logger.AppLog.Debug("Init handle sync key")

	externalLocked := SyncExternalKeysMutex.TryLock()
	ourKeysLocked := SyncOurKeysMutex.TryLock()
	userLocked := SyncUserMutex.TryLock()

	// If any lock failed, cleanup and return error
	if !externalLocked || !ourKeysLocked || !userLocked {
		// Unlock only the ones we successfully locked
		if externalLocked {
			SyncExternalKeysMutex.Unlock()
		}
		if ourKeysLocked {
			SyncOurKeysMutex.Unlock()
		}
		if userLocked {
			SyncUserMutex.Unlock()
		}

		c.JSON(http.StatusTooManyRequests, gin.H{"error": "sync function is running"})
		return
	}

	defer SyncExternalKeysMutex.Unlock()
	defer SyncOurKeysMutex.Unlock()
	defer SyncUserMutex.Unlock()

	// wait group
	var wg sync.WaitGroup

	// Logic to synchronize our keys with SSM this process check if we have keys like as AES, DES or DES3

	SyncKeys(ssm_constants.LABEL_ENCRYPTION_KEY, "SYNC_OUR_KEYS")
	SyncKeys(ssm_constants.LABEL_ENCRYPTION_KEY_AES256, "SYNC_OUR_KEYS")

	// Logic to synchronize keys with SSM
	for _, keyLabel := range ssm_constants.KeyLabelsExternalAllow {
		wg.Add(1)
		go func() {
			defer wg.Done()
			SyncKeys(keyLabel, "SYNC_EXTERNAL_KEYS")
		}()
	}

	wg.Wait()

	coreVaultUserSync()

	c.JSON(http.StatusOK, gin.H{"succes": "sync function run succesfully"})
}

func handleCheckK4Life(c *gin.Context) {
	// TODO: Implement Vault health check logic
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Vault check-k4-life not implemented"})
}

func handleRotationKey(c *gin.Context) {
	if err := rotateInternalTransitKey(internalKeyLabel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Vault internal key rotation triggered"})
}
