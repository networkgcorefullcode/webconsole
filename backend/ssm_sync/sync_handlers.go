package ssmsync

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	ssm_constants "github.com/networkgcorefullcode/ssm/const"
)

var ssmSyncMessage chan *SsmSyncMessage

func setSyncChanHandle(ch chan *SsmSyncMessage) {
	ssmSyncMessage = ch
}

func handleSyncKey(c *gin.Context) {
	// Try to get the priority
	if !SyncExternalKeysMutex.TryLock() ||
		!SyncOurKeysMutex.TryLock() ||
		!SyncUserMutex.TryLock() {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "sync function is running"})
		return
	}

	defer SyncExternalKeysMutex.Unlock()
	defer SyncOurKeysMutex.Unlock()
	defer SyncUserMutex.Unlock()

	// wait group
	var wg sync.WaitGroup

	// Logic to synchronize our keys with SSM this process check if we have keys like as AES, DES or DES3
	wg.Add(1)
	go func() {
		defer wg.Done()
		SyncKeys(ssm_constants.LABEL_ENCRYPTION_KEY, "SYNC_OUR_KEYS")
	}()
	for _, keyLabel := range ssm_constants.KeyLabelsInternalAllow {
		wg.Add(1)
		go func() {
			defer wg.Done()
			SyncKeys(keyLabel, "SYNC_OUR_KEYS")
		}()
	}

	// Logic to synchronize keys with SSM
	for _, keyLabel := range ssm_constants.KeyLabelsExternalAllow {
		wg.Add(1)
		go func() {
			defer wg.Done()
			SyncKeys(keyLabel, "SYNC_EXTERNAL_KEYS")
		}()
	}

	wg.Wait()

	coreUserSync()

	c.JSON(http.StatusOK, gin.H{"succes": "sync function run succesfully"})
}

func handleCheckK4Life(c *gin.Context) {
	// Try to get the priority
	if !CheckMutex.TryLock() &&
		!RotationMutex.TryLock() {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "the operation check life k4 or rotation k4 is running"})
		return
	}

	defer CheckMutex.Unlock()
	defer RotationMutex.Unlock()

	// Logic for the handle
	checkKeyHealth(ssmSyncMessage)
	c.JSON(http.StatusOK, gin.H{"succes": "sync function run succesfully"})
}

func handleRotationKey(c *gin.Context) {
	// Try to get the priority
	if !CheckMutex.TryLock() &&
		!RotationMutex.TryLock() {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "the operation check life k4 or rotation k4 is running"})
		return
	}

	defer CheckMutex.Unlock()
	defer RotationMutex.Unlock()

	rotateExpiredKeys(ssmSyncMessage)
}
